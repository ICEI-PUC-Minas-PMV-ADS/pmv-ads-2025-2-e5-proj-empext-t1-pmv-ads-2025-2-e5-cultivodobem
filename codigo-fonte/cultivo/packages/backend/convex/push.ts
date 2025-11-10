"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import webpush from "web-push";

// Send push to all subscriptions — uses web-push, requires VAPID keys in env
export const sendAll = action({
  args: { payload: v.string() },
  handler: async (ctx, { payload }) => {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    if (!publicKey || !privateKey) {
      throw new Error("VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY must be set in the environment");
    }

    webpush.setVapidDetails("mailto:you@example.com", publicKey, privateKey);

    // Get all subscriptions using query from pushSubscriptions.ts
    const subs = await ctx.runQuery(api.pushSubscriptions.getAll);

    const results: any[] = [];
    for (const s of subs) {
      const subscription = {
        endpoint: s.endpoint,
        keys: s.keys,
      } as any;
      try {
        await webpush.sendNotification(subscription, payload);
        results.push({ id: s._id, status: "sent" });
      } catch (e: any) {
        // If the subscription is invalid, delete it
        if (e && (e.statusCode === 410 || e.statusCode === 404)) {
          await ctx.runMutation(api.pushSubscriptions.deleteById, { id: s._id });
          results.push({ id: s._id, status: "deleted" });
        } else {
          results.push({ id: s._id, status: "error", message: e.message });
        }
      }
    }

    return results;
  },
});

// Send push to subscriptions for a specific userId
export const sendToUser = action({
  args: { userId: v.id("users"), payload: v.string() },
  handler: async (ctx, { userId, payload }) => {
    console.log('push.sendToUser called for userId:', userId);
    
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    if (!publicKey || !privateKey) {
      console.error('VAPID keys not set in environment');
      throw new Error("VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY must be set in the environment");
    }

    webpush.setVapidDetails("mailto:you@example.com", publicKey, privateKey);

    // Get subscriptions for the user using query from pushSubscriptions.ts
    const subs = await ctx.runQuery(api.pushSubscriptions.getByUser, { userId });
    console.log(`Found ${subs.length} subscriptions for user ${userId}:`, subs);

    if (subs.length === 0) {
      console.warn('No subscriptions found for user');
      return [];
    }

    const results: any[] = [];
    for (const s of subs) {
      const subscription = {
        endpoint: s.endpoint,
        keys: s.keys,
      } as any;
      try {
        console.log('Sending notification to:', s.endpoint);
        await webpush.sendNotification(subscription, payload);
        console.log('Notification sent successfully to:', s.endpoint);
        results.push({ id: s._id, status: "sent" });
      } catch (e: any) {
        console.error('Error sending notification:', e);
        // If the subscription is gone, remove it
        if (e && (e.statusCode === 410 || e.statusCode === 404)) {
          await ctx.runMutation(api.pushSubscriptions.deleteById, { id: s._id });
          results.push({ id: s._id, status: "deleted" });
        } else {
          results.push({ id: s._id, status: "error", message: e.message });
        }
      }
    }

    console.log('Notification results:', results);
    return results;
  },
});
