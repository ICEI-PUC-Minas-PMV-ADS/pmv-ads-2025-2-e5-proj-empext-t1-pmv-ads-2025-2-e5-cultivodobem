import { query, mutation, internalAction } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { v } from "convex/values";

// helper to fetch user objects for participant ids and strip sensitive fields
async function fetchParticipants(ctx: any, participantIds: any[] = []) {
	const participants = await Promise.all(
		(participantIds ?? []).map(async (pid: any) => {
			const u = await ctx.db.get(pid);
			if (!u) return null;
			const { passwordHash, ...safe } = u as any;
			return { _id: pid, ...safe };
		}),
	);
	return participants.filter(Boolean);
}

// CRUD for `groups` table

// List all groups (includes participantsFull)
export const list = query({
	args: {},
	handler: async (ctx) => {
		const groups = await ctx.db.query("groups").collect();
		return await Promise.all(
			groups.map(async (g: any) => ({
				...g,
				participantsFull: await fetchParticipants(ctx, g.participants ?? []),
			})),
		);
	},
});

// List groups by a given userId (owner)
export const listByUser = query({
	args: { userId: v.id("users") },
	handler: async (ctx, { userId }) => {
		return await ctx.db
			.query("groups")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.collect();
	},
});

// READ
export const getById = query({
	args: { id: v.id("groups") },
	handler: async (ctx, { id }) => {
		const g = await ctx.db.get(id);
		if (!g) return null;
		const participantsFull = await fetchParticipants(ctx, g.participants ?? []);
		return { ...g, participantsFull };
	},
});

// CREATE
export const create = mutation({
	args: {
		userId: v.id("users"),
		name: v.string(),
		description: v.optional(v.string()),
		stock: v.number(),
		participants: v.optional(v.array(v.id("users"))),
		createdBy: v.id("users"),
	},
	handler: async (ctx, args) => {
		const now = Date.now();
		const id = await ctx.db.insert("groups", {
			userId: args.userId,
			name: args.name.trim(),
			description: args.description,
			stock: args.stock,
			participants: args.participants ?? [],
			createdBy: args.createdBy,
			createdAt: now,
		});
		return id;
	},
});

// UPDATE
export const update = mutation({
	args: {
		id: v.id("groups"),
		name: v.optional(v.string()),
		description: v.optional(v.string()),
		stock: v.optional(v.number()),
		participants: v.optional(v.array(v.id("users"))),
	},
	handler: async (ctx, { id, ...rest }) => {
		const g = await ctx.db.get(id);
		if (!g) throw new Error("Grupo não encontrado.");

		const patch: Record<string, unknown> = {};
		if (rest.name !== undefined) patch.name = rest.name.trim();
		if (rest.description !== undefined) patch.description = rest.description;
		if (rest.stock !== undefined) patch.stock = rest.stock;
		if (rest.participants !== undefined) patch.participants = rest.participants;

		await ctx.db.patch(id, patch);
		return id;
	},
});

// Add a participant to the group
export const addParticipant = mutation({
  args: { groupId: v.id("groups"), userId: v.id("users") },
  handler: async (ctx, { groupId, userId }) => {
    const g = await ctx.db.get(groupId);
    if (!g) throw new Error("Grupo não encontrado.");
    const participants: any[] = g.participants ?? [];
    // avoid duplicates
    if (participants.some((p: any) => String(p) === String(userId)))
      return groupId;
    
    // Get the user info who is joining
    const joiningUser = await ctx.db.get(userId);
    
    participants.push(userId);
    await ctx.db.patch(groupId, { participants });
    
    // Send notification to group creator if it's not the same user joining
    if (String(g.createdBy) !== String(userId)) {
      try {
        await ctx.scheduler.runAfter(0, (internal as any).group.sendJoinNotification, {
          creatorId: g.createdBy,
          joiningUserId: userId,
          joiningUserName: joiningUser?.name || "Um usuário",
          groupId: groupId,
          groupName: g.name,
        });
        console.log(`Join notification scheduled for group creator ${g.createdBy}`);
      } catch (error) {
        console.error("Error scheduling join notification:", error);
      }
    }
    
    return groupId;
  },
});

// Remove a participant from the group
export const removeParticipant = mutation({
	args: { groupId: v.id("groups"), userId: v.id("users") },
	handler: async (ctx, { groupId, userId }) => {
		const g = await ctx.db.get(groupId);
		if (!g) throw new Error("Grupo não encontrado.");
		const participants: any[] = g.participants ?? [];
		const next = participants.filter((p: any) => String(p) !== String(userId));
		await ctx.db.patch(groupId, { participants: next });
		return groupId;
	},
});

// DELETE
export const remove = mutation({
	args: { id: v.id("groups") },
	handler: async (ctx, { id }) => {
		await ctx.db.delete(id);
		return id;
	},
});

// Internal action to send notification when someone joins a group
export const sendJoinNotification: any = internalAction({
  args: {
    creatorId: v.id("users"),
    joiningUserId: v.id("users"),
    joiningUserName: v.string(),
    groupId: v.id("groups"),
    groupName: v.string(),
  },
  handler: async (ctx, { creatorId, joiningUserId, joiningUserName, groupId, groupName }): Promise<any> => {
    console.log(`Sending join notification to creator ${creatorId} for user ${joiningUserName} joining group ${groupName}`);
    
    try {
      // Call the push notification action
      const payload = JSON.stringify({
        title: "Novo Membro no Grupo! 👥",
        body: `${joiningUserName} entrou no grupo "${groupName}"`,
        url: `/groups/${groupId}`,
      });

      const results: any = await ctx.runAction(api.push.sendToUser, {
        userId: creatorId,
        payload,
      });

      console.log(`Join notification sent. Results:`, results);
      return results;
    } catch (error) {
      console.error("Error sending join notification:", error);
      throw error;
    }
  },
});
