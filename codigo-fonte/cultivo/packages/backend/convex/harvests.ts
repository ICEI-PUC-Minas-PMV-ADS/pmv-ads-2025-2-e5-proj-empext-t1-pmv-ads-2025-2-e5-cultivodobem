import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createHarvest = mutation({
  args: {
    date: v.number(),
    quantity: v.number(),
    observations: v.optional(v.string()),
    image: v.optional(v.string()),
    analysisId: v.optional(v.id("analysis")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const newHarvest = {
      ...args,
      createdAt: now,
    };
    const id = await ctx.db.insert("harvests", newHarvest);
    return id;
  },
});

export const getHarvestById = query({
  args: { id: v.id("harvests") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getHarvestsByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("harvests")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const updateHarvest = mutation({
  args: {
    id: v.id("harvests"),
    date: v.optional(v.number()),
    quantity: v.optional(v.number()),
    observations: v.optional(v.string()),
    image: v.optional(v.string()),
    analysisId: v.optional(v.id("analysis")),
  },
  handler: async (ctx, { id, ...updateFields }) => {
    const patch: Record<string, any> = {};
    if (updateFields.date !== undefined) patch.date = updateFields.date;
    if (updateFields.quantity !== undefined)
      patch.quantity = updateFields.quantity;
    if (updateFields.observations !== undefined)
      patch.observations = updateFields.observations;
    if (updateFields.image !== undefined) patch.image = updateFields.image;
    if (updateFields.analysisId !== undefined)
      patch.analysisId = updateFields.analysisId;

    await ctx.db.patch(id, patch);

    return id;
  },
});

export const deleteHarvest = mutation({
  args: { id: v.id("harvests") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return id;
  },
});

// Listar todas as colheitas com informações do produtor e análise
export const getAllHarvestsWithDetails = query({
  args: {},
  handler: async (ctx) => {
    const harvests = await ctx.db.query("harvests").order("desc").collect();

    const harvestsWithDetails = await Promise.all(
      harvests.map(async (harvest) => {
        const user = await ctx.db.get(harvest.userId);
        let analysis = null;

        if (harvest.analysisId) {
          analysis = await ctx.db.get(harvest.analysisId);
        }

        return {
          ...harvest,
          user: user
            ? {
                _id: user._id,
                name: user.name,
                email: user.email,
                cidade: user.cidade,
                estado: user.estado,
              }
            : null,
          analysis: analysis
            ? {
                imageId: analysis.imageId,
                classification: analysis.classification,
                colorimetry: analysis.colorimetry,
              }
            : null,
        };
      })
    );

    return harvestsWithDetails;
  },
});
