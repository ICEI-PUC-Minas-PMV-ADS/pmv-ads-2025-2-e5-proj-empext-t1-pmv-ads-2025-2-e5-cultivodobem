import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Store a subscription object (endpoint + keys)
export const subscribe = mutation({
  args: {
    endpoint: v.string(),
    keys: v.object({ p256dh: v.string(), auth: v.string() }),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, { endpoint, keys, userId }) => {
    console.log('pushSubscriptions.subscribe called with:', { endpoint, keys, userId });
    
    // If a subscription with same endpoint exists, update it
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", endpoint))
      .first();

    const now = Date.now();
    if (existing) {
      console.log('Updating existing subscription:', existing._id);
      await ctx.db.patch(existing._id, { keys, userId, updatedAt: now });
      return existing._id;
    }

    console.log('Creating new subscription');
    const id = await ctx.db.insert("pushSubscriptions", {
      endpoint,
      keys,
      userId,
      createdAt: now,
    });
    console.log('Subscription created with id:', id);
    return id;
  },
});

export const unsubscribe = mutation({
  args: { endpoint: v.string() },
  handler: async (ctx, { endpoint }) => {
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", endpoint))
      .first();
    if (!existing) return null;
    await ctx.db.delete(existing._id);
    return existing._id;
  },
});

// Helper to list subscriptions (admin use)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pushSubscriptions").collect();
  },
});

// Get subscriptions for a specific user - internal query for actions
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Get all subscriptions - internal query for actions
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pushSubscriptions").collect();
  },
});

// Delete a subscription by ID - internal mutation for actions
export const deleteById = mutation({
  args: { id: v.id("pushSubscriptions") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return id;
  },
});
