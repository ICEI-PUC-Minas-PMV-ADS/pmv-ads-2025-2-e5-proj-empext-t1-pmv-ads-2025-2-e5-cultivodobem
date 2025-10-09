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

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const classifySample = action({
  args: {
    storageId: v.id("_storage"),
    fileType: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, { storageId, fileType, userId }) => {
    const imageUrl = await ctx.storage.getUrl(storageId);

    if (!imageUrl) {
      return {
        error: "Image URL is required",
      };
    }

    try {
      const sample = await fetch(imageUrl).then((response) =>
        response.arrayBuffer()
      );

      const analysisBriefingParts: Part[] = [
        { text: analysisBriefing },
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

      const notBean = promptResult.classification.summary.type === -1;

      if (notBean) {
        return {
          error: "The image is not a bean sample",
        };
      }

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

      return { id };
    } catch (error) {
      console.error(error);

      return {
        error: "Error classifying sample",
      };
    }
  },
});
