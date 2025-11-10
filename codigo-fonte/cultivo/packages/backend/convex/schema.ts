import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
    logradouro: v.optional(v.string()),
    numero: v.optional(v.string()),
    complemento: v.optional(v.string()),
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
    classification: v.object({
      summary: v.object({
        species: v.string(),
        type: v.number(),
        defectiveBeansPercentage: v.number(),
        explanation: v.string(),
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
    }),
    colorimetry: v.object({
      averageL: v.number(),
      standardDeviation: v.number(),
      classification: v.string(),
      finalScore: v.number(),
    }),
  }).index("by_user", ["userId"]),

  beanSampleImages: defineTable({
    storageId: v.id("_storage"),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  harvests: defineTable({
    date: v.number(),
    quantity: v.number(),
    observations: v.optional(v.string()),
    analysisId: v.optional(v.id("analysis")),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  proposals: defineTable({
    groupId: v.optional(v.id("groups")),
    valuePerSack: v.number(),
    quantity: v.number(),
    phoneBuyer: v.string(),
    emailBuyer: v.string(),
    nameBuyer: v.string(),
    buyerId: v.id("users"),
    createdAt: v.number(),
    userId: v.optional(v.id("users")),
    viewed: v.boolean(),
    observations: v.optional(v.string()),
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

  ratings: defineTable({
    userId: v.id("users"),
    rating: v.number(),
    comment: v.optional(v.string()),
    userRatedId: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  postComments: defineTable({
    strapiPostId: v.string(), // ID do post no Strapi
    userId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_post", ["strapiPostId"]),

  postLikes: defineTable({
    strapiPostId: v.string(), // ID do post no Strapi
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_post", ["strapiPostId"])
    .index("by_user_post", ["userId", "strapiPostId"]),
});
