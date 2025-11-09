import { v } from "convex/values";
import { query } from "./_generated/server";

// Listar todas as colheitas disponíveis (para representantes fazerem propostas)
export const listAvailableHarvests = query({
  handler: async (ctx) => {
    const harvests = await ctx.db.query("harvests").order("desc").collect();

    // Buscar informações do produtor e grupo (se aplicável) para cada colheita
    const harvestsWithDetails = await Promise.all(
      harvests.map(async (harvest) => {
        const producer = await ctx.db.get(harvest.userId);

        // Buscar se o produtor pertence a algum grupo
        const allGroups = await ctx.db.query("groups").collect();
        const producerGroup = allGroups.find(
          (group) =>
            group.createdBy === harvest.userId ||
            group.participants.includes(harvest.userId)
        );

        return {
          ...harvest,
          producer: producer
            ? {
                _id: producer._id,
                name: producer.name,
                email: producer.email,
              }
            : null,
          group: producerGroup
            ? {
                _id: producerGroup._id,
                name: producerGroup.name,
                createdBy: producerGroup.createdBy,
              }
            : null,
        };
      })
    );

    return harvestsWithDetails;
  },
});

// Buscar detalhes de uma colheita específica
export const getHarvestById = query({
  args: {
    harvestId: v.id("harvests"),
  },
  handler: async (ctx, args) => {
    const harvest = await ctx.db.get(args.harvestId);
    if (!harvest) {
      throw new Error("Colheita não encontrada");
    }

    const producer = await ctx.db.get(harvest.userId);

    // Buscar se o produtor pertence a algum grupo
    const allGroups = await ctx.db.query("groups").collect();
    const producerGroup = allGroups.find(
      (group) =>
        group.createdBy === harvest.userId ||
        group.participants.includes(harvest.userId)
    );

    return {
      ...harvest,
      producer: producer
        ? {
            _id: producer._id,
            name: producer.name,
            email: producer.email,
          }
        : null,
      group: producerGroup
        ? {
            _id: producerGroup._id,
            name: producerGroup.name,
            createdBy: producerGroup.createdBy,
          }
        : null,
    };
  },
});
