import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const url = await ctx.storage.generateUploadUrl();
    return { url };
  },
});

export const sendImage = mutation({
  args: { storageId: v.id("_storage"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("beanSampleImages", {
      storageId: args.storageId,
      userId: args.userId,
      createdAt: Date.now(),
    });

    return { id };
  },
});

export const getFileUrl = mutation({
  args: { fileId: v.id("_storage") },
  handler: async (ctx, { fileId }) => {
    const url = await ctx.storage.getUrl(fileId);
    return { url };
  },
});
