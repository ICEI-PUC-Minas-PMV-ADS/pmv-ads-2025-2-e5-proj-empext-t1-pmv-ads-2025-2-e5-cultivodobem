import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Create a notification (used by server actions)
export const create = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    url: v.optional(v.string()),
    data: v.optional(v.string()),
    senderId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("notifications", {
      userId: args.userId,
      title: args.title,
      body: args.body,
      url: args.url,
      data: args.data,
      senderId: args.senderId,
      read: false,
      createdAt: Date.now(),
    });
    return id;
  },
});

// List notifications by user
export const listByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const notifs = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    return notifs;
  },
});

// Mark as read
export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { read: true });
    return { success: true };
  },
});
