import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const sendImage = mutation({
  args: { storageId: v.id("_storage"), userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.insert("beanSampleImages", {
      storageId: args.storageId,
      userId: args.userId,
      createdAt: Date.now(),
    });
  },
});
