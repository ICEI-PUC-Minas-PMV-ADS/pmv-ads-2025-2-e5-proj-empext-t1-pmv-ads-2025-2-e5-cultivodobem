import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Curtir ou descurtir um post
export const toggleLike = mutation({
  args: {
    strapiPostId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, { strapiPostId, userId }) => {
    // Verificar se o usuário já curtiu o post
    const existingLike = await ctx.db
      .query("postLikes")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", userId).eq("strapiPostId", strapiPostId)
      )
      .first();

    if (existingLike) {
      // Se já curtiu, remove a curtida
      await ctx.db.delete(existingLike._id);
      return { action: "unliked" };
    } else {
      // Se não curtiu, adiciona a curtida
      await ctx.db.insert("postLikes", {
        strapiPostId,
        userId,
        createdAt: Date.now(),
      });
      return { action: "liked" };
    }
  },
});

// Contar curtidas de um post
export const countLikesByPostId = query({
  args: {
    strapiPostId: v.string(),
  },
  handler: async (ctx, { strapiPostId }) => {
    const likes = await ctx.db
      .query("postLikes")
      .withIndex("by_post", (q) => q.eq("strapiPostId", strapiPostId))
      .collect();

    return likes.length;
  },
});

// Verificar se um usuário curtiu um post específico
export const hasUserLikedPost = query({
  args: {
    strapiPostId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, { strapiPostId, userId }) => {
    const like = await ctx.db
      .query("postLikes")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", userId).eq("strapiPostId", strapiPostId)
      )
      .first();

    return !!like;
  },
});

// Listar usuários que curtiram um post
export const getUsersWhoLikedPost = query({
  args: {
    strapiPostId: v.string(),
  },
  handler: async (ctx, { strapiPostId }) => {
    const likes = await ctx.db
      .query("postLikes")
      .withIndex("by_post", (q) => q.eq("strapiPostId", strapiPostId))
      .collect();

    // Buscar informações dos usuários
    const users = await Promise.all(
      likes.map(async (like) => {
        const user = await ctx.db.get(like.userId);
        return {
          id: user?._id,
          name: user?.name,
          foto_url: user?.foto_url,
          createdAt: like.createdAt,
        };
      })
    );

    return users.filter((user) => user.name); // Filtrar usuários válidos
  },
});

// Listar posts curtidos por um usuário
export const getPostsLikedByUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    const likes = await ctx.db
      .query("postLikes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return likes.map((like) => ({
      strapiPostId: like.strapiPostId,
      createdAt: like.createdAt,
    }));
  },
});
