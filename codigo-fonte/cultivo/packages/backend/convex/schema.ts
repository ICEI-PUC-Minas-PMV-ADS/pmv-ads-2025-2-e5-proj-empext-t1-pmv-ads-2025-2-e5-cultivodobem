import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    tipo_usuario: v.optional(v.union(v.literal("Produtor Rural"), v.literal("Representante"))),
    telefone: v.optional(v.string()),
    data_nascimento: v.optional(v.string()),
    cep: v.optional(v.string()),
    cidade: v.optional(v.string()),
    estado: v.optional(v.string()),
    bio: v.optional(v.string()),
    foto_url: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_email", ["email"])
    .index("by_createdAt", ["createdAt"]),

  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
    userId: v.optional(v.id("users")),
  }).index("by_user", ["userId"]),
});
