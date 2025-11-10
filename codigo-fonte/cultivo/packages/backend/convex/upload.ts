import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation({
	handler: async (ctx) => {
		return await ctx.storage.generateUploadUrl();
	},
});

export const sendImage = mutation({
	args: { storageId: v.id("_storage"), userId: v.id("users") },
	handler: async (ctx, args) => {
		return await ctx.db.insert("beanSampleImages", {
			storageId: args.storageId,
			userId: args.userId,
			createdAt: Date.now(),
		});
	},
});

export const getFileUrl = query({
	args: { fileId: v.id("_storage") },
	handler: async (ctx, { fileId }) => {
		return await ctx.storage.getUrl(fileId);
	},
});
