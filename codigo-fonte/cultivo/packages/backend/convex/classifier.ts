import {
  Content,
  GenerateContentConfig,
  GoogleGenAI,
  Part,
} from "@google/genai";
import { Buffer } from "buffer/";
import { v } from "convex/values";
import analysisBriefing from "../content/briefing-analysis";
import colorimetryBriefing from "../content/briefing-colorimetry";
import responseSchema from "../content/response-schema.json";
import { Analysis } from "../content/types";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";

const classificationManualId = process.env
  .CLASSIFICATION_MANUAL_ID as Id<"_storage">;
const photographicReferenceId = process.env
  .PHOTOGRAPHIC_REFERENCE_ID as Id<"_storage">;

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const classifySample = action({
  args: {
    storageId: v.id("_storage"),
    fileType: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, { storageId, fileType, userId }) => {
    const imageUrl = await ctx.storage.getUrl(storageId);
    const classificationManualUrl = await ctx.storage.getUrl(
      classificationManualId
    );
    const photographicReferenceUrl = await ctx.storage.getUrl(
      photographicReferenceId
    );

    if (!imageUrl) {
      throw Error("Image URL is required");
    }

    if (!classificationManualUrl || !photographicReferenceUrl) {
      throw Error("Classification manual and photographic could not be found");
    }

    try {
      const classificationManual = await fetch(classificationManualUrl).then(
        (response) => response.arrayBuffer()
      );
      const photographicReference = await fetch(photographicReferenceUrl).then(
        (response) => response.arrayBuffer()
      );
      const sample = await fetch(imageUrl).then((response) =>
        response.arrayBuffer()
      );

      const analysisBriefingParts: Part[] = [
        { text: analysisBriefing },
        {
          inlineData: {
            mimeType: "application/pdf",
            data: Buffer.from(classificationManual).toString("base64"),
          },
        },
        {
          inlineData: {
            mimeType: "application/pdf",
            data: Buffer.from(photographicReference).toString("base64"),
          },
        },
        { text: "A amostra a ser classificada é a seguinte:" },
      ];

      const colorimetryBriefingParts: Part[] = [{ text: colorimetryBriefing }];

      const model = "gemini-2.5-flash";

      const config: GenerateContentConfig = {
        responseSchema,
        responseMimeType: "application/json",
      };

      const contents: Content[] = [
        { role: "user", parts: analysisBriefingParts },
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: fileType,
                data: Buffer.from(sample).toString("base64"),
              },
            },
          ],
        },
        { role: "user", parts: colorimetryBriefingParts },
      ];

      const response = await gemini.models.generateContent({
        model,
        config,
        contents,
      });

      const promptResult: Analysis = JSON.parse(response.text || "{}");

      const id: Id<"analysis"> = await ctx.runMutation(
        api.analysis.saveAnalysis,
        {
          imageId: storageId,
          userId: userId,
          createdAt: Date.now(),
          classification: promptResult.classification,
          colorimetry: promptResult.colorimetry,
        }
      );

      return id;
    } catch (error) {
      console.log({ error });

      return null;
    }
  },
});
