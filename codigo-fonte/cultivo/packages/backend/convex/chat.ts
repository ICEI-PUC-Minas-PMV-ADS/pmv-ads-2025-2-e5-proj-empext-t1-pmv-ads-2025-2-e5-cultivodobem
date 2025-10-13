import { action, mutation } from "./_generated/server";
import { v } from "convex/values";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const briefing = `
  Você é um assistente de IA que responde perguntas sobre a cultura do feijão.
  Responda em português, de forma clara e objetiva, e use markdown.
`;

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

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" +
        GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: briefing }] },
            { role: "user", parts: [{ text: prompt }] },
          ],
        }),
      }
    );

    const data = await response.json();

    // Extração segura da resposta
    const resposta =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Não consegui gerar uma resposta.";

    return resposta;
  },
});
