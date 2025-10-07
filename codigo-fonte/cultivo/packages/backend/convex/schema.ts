import { group } from "console";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { title } from "process";
import { use } from "react";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    tipo_usuario: v.optional(
      v.union(v.literal("Produtor Rural"), v.literal("Representante"))
    ),
    telefone: v.optional(v.string()),
    data_nascimento: v.optional(v.string()),
    cep: v.optional(v.string()),
    cidade: v.optional(v.string()),
    estado: v.optional(v.string()),
    bio: v.optional(v.string()),
    foto_url: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_createdAt", ["createdAt"]),

  settings: defineTable({
    userId: v.id("users"),
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
    notificationsContent: v.boolean(),
    notificationSProposals: v.boolean(),
  }).index("by_user", ["userId"]),

  groups: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    stock: v.number(),
    participants: v.array(v.id("users")),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  analysis: defineTable({
    imageId: v.id("_storage"),
    userId: v.id("users"),
    createdAt: v.number(),
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
  }).index("by_user", ["userId"]),

  beanSampleImages: defineTable({
    storageId: v.id("_storage"),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  harvests: defineTable({
    date: v.string(),
    quantity: v.number(),
    observations: v.optional(v.string()),
    image: v.optional(v.string()),
    dateOfHarvest: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  beanStock: defineTable({
    value: v.number(),
    dayLastUpdated: v.number(),
    hourLastUpdated: v.number(),
    quantity: v.number(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_createdAt", ["createdAt"]),

  proposals: defineTable({
    groupId: v.id("groups"),
    valuePerSack: v.number(),
    totalValue: v.number(),
    phoneBuyer: v.string(),
    nameBuyer: v.string(),
    buyerId: v.id("users"),
    createdAt: v.number(),
    status: v.union(v.literal("pending"), v.literal("rejected")),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_group", ["groupId"])
    .index("by_buyer", ["buyerId"]),

  chatAiMessages: defineTable({
    userId: v.id("users"),
    message: v.string(),
    response: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  posts: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    image: v.optional(v.string()),
    createdAt: v.number(),
    coments: v.array(
      v.object({
        userId: v.id("users"),
        content: v.string(),
        createdAt: v.number(),
      })
    ),
  }).index("by_user", ["userId"]),

  ratings: defineTable({
    userId: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
    userRatedId: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
