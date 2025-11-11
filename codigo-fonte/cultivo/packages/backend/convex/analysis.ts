import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import schema from "./schema";

export const saveAnalysis = mutation({
	args: schema.tables.analysis.validator,
	handler: async (ctx, payload) => {
		return await ctx.db.insert("analysis", payload);
	},
});

export const getAnalysisById = query({
	args: { id: v.id("analysis") },
	handler: async (ctx, { id }) => {
		return await ctx.db.get(id);
	},
});
