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
