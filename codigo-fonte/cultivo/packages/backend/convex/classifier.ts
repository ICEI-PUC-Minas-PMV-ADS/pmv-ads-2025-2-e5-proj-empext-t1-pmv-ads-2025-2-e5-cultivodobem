import {
  type Content,
  type GenerateContentConfig,
  GoogleGenAI,
  type Part,
} from "@google/genai";
import { Buffer } from "buffer/";
import { v } from "convex/values";
import analysisBriefing from "../content/briefing-analysis";
import colorimetryBriefing from "../content/briefing-colorimetry";
import responseSchema from "../content/response-schema.json";
import type { Analysis } from "../content/types";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";

function getGeminiClient() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY não configurada");
  }
  return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

async function urlToGenerativePart(
  url: string,
  mimeType: string
): Promise<Part> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch reference URL: ${url} (Status: ${response.status})`
    );
  }

  const arrayBuffer = await response.arrayBuffer();

  const base64Data = Buffer.from(arrayBuffer).toString("base64");

  return {
    inlineData: {
      mimeType,
      data: base64Data,
    },
  };
}

export const classifySample = action({
  args: {
    storageId: v.id("_storage"),
    fileType: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, { storageId, fileType, userId }) => {
    const imageUrl = await ctx.storage.getUrl(storageId);

    const references = [
      "https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/949273/1/manualilustrado06.pdf",
      "https://www.gov.br/agricultura/pt-br/assuntos/inspecao/produtos-vegetal/qualidade-vegetal-1/referencial-fotografico-pasta/referencial-fotografico-para-graos-pasta/referencial-fotografico-do-feijao.pdf",
    ];

    if (!imageUrl) {
      return {
        error: "Image URL is required",
      };
    }

    try {
      const sample = await fetch(imageUrl).then((response) =>
        response.arrayBuffer()
      );

      const referenceParts = await Promise.all(
        references.map((url) => urlToGenerativePart(url, "application/pdf"))
      );

      const analysisBriefingParts: Part[] = [{ text: analysisBriefing }];
      const colorimetryBriefingParts: Part[] = [{ text: colorimetryBriefing }];

      const model = "gemini-2.5-pro";

      const config: GenerateContentConfig = {
        responseSchema,
        responseMimeType: "application/json",
        temperature: 0,
      };

      const contents: Content[] = [
        { role: "user", parts: referenceParts },
        { role: "user", parts: analysisBriefingParts },
        { role: "user", parts: colorimetryBriefingParts },
        { role: "user", parts: [{ text: "Execute como definido no briefing." }] },
        {
          role: "user",
          parts: [
            { text: "Esta é a amostra de feijão a ser analisada:" },
            {
              inlineData: {
                mimeType: fileType,
                data: Buffer.from(sample).toString("base64"),
              },
            },
          ],
        },
      ];

      const gemini = getGeminiClient();
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
