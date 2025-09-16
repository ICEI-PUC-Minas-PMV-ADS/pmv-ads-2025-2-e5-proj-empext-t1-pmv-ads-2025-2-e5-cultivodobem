import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	usuario: defineTable({
    nome: v.string(),
    email: v.string(),
    senha_hash: v.string(),
    tipo_usuario: v.string(), 
    data_nascimento: v.optional(v.string()),
    cep: v.optional(v.string()),
    criado_em: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_criado_em", ["criado_em"]),

	todos: defineTable({
		text: v.string(),
		completed: v.boolean(),
	}),
});
