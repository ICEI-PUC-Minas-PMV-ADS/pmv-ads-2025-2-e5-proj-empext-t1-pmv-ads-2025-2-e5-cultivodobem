import { GoogleGenAI } from "@google/genai";
import { action, mutation } from "./_generated/server";
import { v } from "convex/values";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const briefing = `
  Você é um assistente de IA que responde perguntas sobre a cultura do feijão.
  Responda em português, de forma clara e objetiva, e use markdown.
`;

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const savePrompt = mutation({
  args: {
    userId: v.id("users"),
    message: v.string(),
    response: v.string(),
    createdAt: v.number(),
  },
  handler: async (ctx, { userId, message, response, createdAt }) => {
    await ctx.db.insert("chatAiMessages", {
      userId,
      message,
      response,
      createdAt,
    });
  },
});

export const promptAssistant = action({
  args: { prompt: v.string() },
  handler: async (ctx, { prompt }) => {
    if (!GEMINI_API_KEY) {
      throw new Error("A variável GEMINI_API_KEY não está configurada.");
    }

    const model = "gemini-2.5-flash";

    const contents = [
      { role: "user", parts: [{ text: briefing }] },
      { role: "user", parts: [{ text: prompt }] },
    ];

    const response = await gemini.models.generateContent({
      model,
      contents,
    });

    const chatResponse = response.text || "Não consegui gerar uma resposta.";

    // TODO: Salvar a conversa no banco de dados
    // ctx.runMutation(api.chat.savePrompt, {
    //   userId: null,
    //   message: prompt,
    //   response: chatResponse,
    //   createdAt: Date.now(),
    // });

    return chatResponse;
  },
});
