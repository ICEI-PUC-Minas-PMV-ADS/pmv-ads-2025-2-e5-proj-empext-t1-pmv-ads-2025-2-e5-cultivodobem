import { query } from "./_generated/server";

export const getBeanStocks = query({
  handler: async (ctx) => {
    const stocks = [];
    const groups = await ctx.db.query("groups").collect();
    const users = await ctx.db.query("users").collect();

    console.log(groups);
    
    for (const group of groups) {
      const participantsIds = group.participants;
      const user = users.find((user) => participantsIds.includes(user._id));
      const harvests = (await ctx.db.query("harvests").collect()).filter(
        (harvest) => participantsIds.includes(harvest.userId)
      );

      const analysisIds = harvests.map((harvest) => harvest.analysisId);
      const analysis = (await ctx.db.query("analysis").collect()).filter(
        (analysis) => analysisIds.includes(analysis._id)
      );

      const images = await Promise.allSettled(
        analysis.map((analysis) => ctx.storage.getUrl(analysis.imageId))
      );

      const quantity = harvests.reduce(
        (acc, harvest) => acc + harvest.quantity,
        0
      );

      const lowestScore = Math.min(
        ...analysis.map((analysis) => analysis.colorimetry.finalScore)
      );
      const highestScore = Math.max(
        ...analysis.map((analysis) => analysis.colorimetry.finalScore)
      );

      stocks.push({
        name: group.name,
        images: images.map((image) => (image as { value: string }).value),
        quantity,
        lowestScore,
        highestScore,
        location: user?.cep,
      });
    }

    for (const user of users) {
      const harvests = await ctx.db
        .query("harvests")
        .filter((q) => q.eq(q.field("userId"), user._id))
        .collect();

      const analysisIds = harvests.map((harvest) => harvest.analysisId);
      const analysis = (await ctx.db.query("analysis").collect()).filter(
        (analysis) => analysisIds.includes(analysis._id)
      );

      const images = await Promise.allSettled(
        analysis.map((analysis) => ctx.storage.getUrl(analysis.imageId))
      );

      const quantity = harvests.reduce(
        (acc, harvest) => acc + harvest.quantity,
        0
      );

      const lowestScore = Math.min(
        ...analysis.map((analysis) => analysis.colorimetry.finalScore)
      );
      const highestScore = Math.max(
        ...analysis.map((analysis) => analysis.colorimetry.finalScore)
      );

      stocks.push({
        name: user.name,
        images: images.map((image) => (image as { value: string }).value),
        quantity,
        lowestScore,
        highestScore,
        location: user?.cep,
      });
    }

    return stocks.filter((stock) => stock.quantity > 0);
  },
});
