import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Criar uma nova proposta
export const createProposal = mutation({
  args: {
    groupId: v.optional(v.id("groups")),
    valuePerSack: v.number(),
    quantity: v.number(),
    phoneBuyer: v.string(),
    emailBuyer: v.string(),
    nameBuyer: v.string(),
    buyerId: v.id("users"),
    userId: v.optional(v.id("users")), // ID do produtor que receberá a proposta (opcional se for para grupo)
    observations: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const proposalId = await ctx.db.insert("proposals", {
      ...args,
      createdAt: Date.now(),
      viewed: false,
    });

    return proposalId;
  },
});

// Listar propostas recebidas (para produtores) - incluindo propostas para seus grupos
export const getReceivedProposals = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Buscar propostas diretas para o usuário
    const directProposals = await ctx.db
      .query("proposals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Buscar grupos onde o usuário participa
    const userGroups = await ctx.db.query("groups").collect();

    const userGroupIds = userGroups
      .filter(
        (group) =>
          group.participants.includes(args.userId) ||
          group.createdBy === args.userId
      )
      .map((group) => group._id);

    // Buscar propostas para os grupos do usuário
    const groupProposals = await Promise.all(
      userGroupIds.map(async (groupId) => {
        return await ctx.db
          .query("proposals")
          .withIndex("by_group", (q) => q.eq("groupId", groupId))
          .order("desc")
          .collect();
      })
    );

    // Combinar todas as propostas
    const allProposals = [...directProposals, ...groupProposals.flat()];

    // Remover duplicatas por ID
    const uniqueProposals = Array.from(
      new Map(allProposals.map((p) => [p._id, p])).values()
    );

    // Buscar informações detalhadas para cada proposta
    const proposalsWithDetails = await Promise.all(
      uniqueProposals.map(async (proposal) => {
        const group = proposal.groupId
          ? await ctx.db.get(proposal.groupId)
          : null;
        const buyer = await ctx.db.get(proposal.buyerId);

        return {
          ...proposal,
          group,
          buyer,
        };
      })
    );

    return proposalsWithDetails;
  },
});

// Listar apenas propostas diretas do produtor
export const getDirectProposals = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const proposals = await ctx.db
      .query("proposals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    const proposalsWithDetails = await Promise.all(
      proposals.map(async (proposal) => {
        const buyer = await ctx.db.get(proposal.buyerId);

        return {
          ...proposal,
          group: null,
          buyer,
        };
      })
    );

    return proposalsWithDetails;
  },
});

// Listar apenas propostas dos grupos do produtor
export const getGroupProposals = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Buscar grupos onde o usuário participa
    const userGroups = await ctx.db.query("groups").collect();

    const userGroupIds = userGroups
      .filter(
        (group) =>
          group.participants.includes(args.userId) ||
          group.createdBy === args.userId
      )
      .map((group) => group._id);

    // Buscar propostas para os grupos do usuário
    const groupProposals = await Promise.all(
      userGroupIds.map(async (groupId) => {
        return await ctx.db
          .query("proposals")
          .withIndex("by_group", (q) => q.eq("groupId", groupId))
          .order("desc")
          .collect();
      })
    );

    const allProposals = groupProposals.flat();

    // Buscar informações detalhadas para cada proposta
    const proposalsWithDetails = await Promise.all(
      allProposals.map(async (proposal) => {
        const group = proposal.groupId
          ? await ctx.db.get(proposal.groupId)
          : null;
        const buyer = await ctx.db.get(proposal.buyerId);

        return {
          ...proposal,
          group,
          buyer,
        };
      })
    );

    return proposalsWithDetails;
  },
}); // Listar propostas enviadas (para representantes)
export const getSentProposals = query({
  args: {
    buyerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const proposals = await ctx.db
      .query("proposals")
      .withIndex("by_buyer", (q) => q.eq("buyerId", args.buyerId))
      .order("desc")
      .collect();

    // Buscar informações do grupo e produtor para cada proposta
    const proposalsWithDetails = await Promise.all(
      proposals.map(async (proposal) => {
        const group = proposal.groupId
          ? await ctx.db.get(proposal.groupId)
          : null;
        const producer = proposal.userId
          ? await ctx.db.get(proposal.userId)
          : null;

        return {
          ...proposal,
          group,
          producer,
        };
      })
    );

    return proposalsWithDetails;
  },
});

// Deletar proposta
export const deleteProposal = mutation({
  args: {
    proposalId: v.id("proposals"),
  },
  handler: async (ctx, args) => {
    // Verificar se a proposta existe
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) {
      throw new Error("Proposta não encontrada");
    }

    await ctx.db.delete(args.proposalId);
    return { success: true };
  },
});

// Marcar proposta como visualizada
export const markProposalAsViewed = mutation({
  args: {
    proposalId: v.id("proposals"),
  },
  handler: async (ctx, args) => {
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) {
      throw new Error("Proposta não encontrada");
    }

    await ctx.db.patch(args.proposalId, {
      viewed: true,
    });

    return { success: true };
  },
});

// Buscar grupos disponíveis para propostas
export const getAvailableGroups = query({
  handler: async (ctx) => {
    const groups = await ctx.db.query("groups").order("desc").collect();

    // Buscar informações do criador para cada grupo
    const groupsWithCreator = await Promise.all(
      groups.map(async (group) => {
        const creator = await ctx.db.get(group.createdBy);
        return {
          ...group,
          creator,
        };
      })
    );

    return groupsWithCreator;
  },
});
