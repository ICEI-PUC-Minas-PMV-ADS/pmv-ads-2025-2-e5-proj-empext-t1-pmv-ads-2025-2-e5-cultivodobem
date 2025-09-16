import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	usuario: defineTable({
  nome: v.string(),
  email: v.string(),
  senha_hash: v.string(),
  tipo_usuario: v.string(),
  cep: v.string(),

  telefone: v.optional(v.string()),
  data_nascimento: v.optional(v.string()),
  cidade: v.optional(v.string()),
  estado: v.optional(v.string()),
  bio: v.optional(v.string()),
  foto_url: v.optional(v.string()),

  criado_em: v.number(),
  atualizado_em: v.number(),
  })
  .index("by_email", ["email"])
  .index("by_criado_em", ["criado_em"]),

	todos: defineTable({
		text: v.string(),
		completed: v.boolean(),
	}),
});
