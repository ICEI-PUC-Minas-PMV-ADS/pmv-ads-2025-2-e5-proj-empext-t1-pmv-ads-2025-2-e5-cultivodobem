import {
  Content,
  GenerateContentConfig,
  GoogleGenAI,
  Part,
} from "@google/genai";
import { Id } from "./_generated/dataModel";
import { action, mutation } from "./_generated/server";
import { v } from "convex/values";
import responseSchema from "../content/response-schema.json";
import briefing from "../content/briefing";
import { Buffer } from "buffer/"; // note: the trailing slash is important!
import { api } from "./_generated/api";

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

      const briefingParts: Part[] = [
        { text: briefing },
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

      const model = "gemini-2.5-flash";

      const config: GenerateContentConfig = {
        responseSchema,
        responseMimeType: "application/json",
      };

      const contents: Content[] = [
        { role: "user", parts: briefingParts },
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
      ];

      const response = await gemini.models.generateContent({
        model,
        config,
        contents,
      });

      const promptResult = JSON.parse(response.text || "{}");

      ctx.runMutation(api.classifier.saveAnalysis, {
        analysis: {
          imageId: storageId,
          userId: userId,
          report: {
            summary: {
              totalBeans:
                promptResult.laudoTecnico.resumoAmostra.totalGraosIdentificados,
              totalDefectiveBeans:
                promptResult.laudoTecnico.resumoAmostra.totalGraosDefeituosos,
            },
            details: {
              graveDefects:
                promptResult.laudoTecnico.detalhamentoDefeitos.defeitosGraves,
              lightDefects:
                promptResult.laudoTecnico.detalhamentoDefeitos.defeitosLeves,
            },
            observations: promptResult.laudoTecnico.observacoes,
          },
        },
      });

      return promptResult;
    } catch (error) {
      console.log({ error });

      return null;
    }
  },
});

export const saveAnalysis = mutation({
  args: {
    analysis: v.object({
      imageId: v.id("_storage"),
      userId: v.id("users"),
      report: v.object({
        summary: v.object({
          totalBeans: v.number(),
          totalDefectiveBeans: v.number(),
        }),
        details: v.object({
          graveDefects: v.object({
            molded: v.number(),
            burned: v.number(),
            germinated: v.number(),
            chapped_and_attacked_by_caterpillars: v.number(),
          }),
          lightDefects: v.object({
            crushed: v.number(),
            damaged: v.number(),
            immature: v.number(),
            broken_or_split: v.number(),
          }),
        }),
        observations: v.optional(v.string()),
      }),
    }),
  },
  handler: async (ctx, { analysis }) => {
    await ctx.db.insert("analysis", { ...analysis, createdAt: Date.now() });
  },
});
