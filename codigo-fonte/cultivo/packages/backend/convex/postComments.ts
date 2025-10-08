import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// CRUD para comentários de posts do Strapi

// Buscar comentários por strapiPostId
export const getCommentsByPostId = query({
  args: { strapiPostId: v.string() },
  handler: async (ctx, { strapiPostId }) => {
    const comments = await ctx.db
      .query("postComments")
      .withIndex("by_post", (q) => q.eq("strapiPostId", strapiPostId))
      .order("desc")
      .collect();

    // Buscar informações dos usuários para cada comentário
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          userName: user?.name || "Usuário desconhecido",
          userEmail: user?.email || "",
        };
      })
    );

    return commentsWithUsers;
  },
});

// Contar comentários por strapiPostId
export const countCommentsByPostId = query({
  args: { strapiPostId: v.string() },
  handler: async (ctx, { strapiPostId }) => {
    const comments = await ctx.db
      .query("postComments")
      .withIndex("by_post", (q) => q.eq("strapiPostId", strapiPostId))
      .collect();

    return comments.length;
  },
});

// Criar novo comentário
export const createComment = mutation({
  args: {
    strapiPostId: v.string(),
    userId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, { strapiPostId, userId, content }) => {
    // Verificar se o usuário existe
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const now = Date.now();
    const commentId = await ctx.db.insert("postComments", {
      strapiPostId,
      userId,
      content: content.trim(),
      createdAt: now,
    });

    return commentId;
  },
});

// Editar comentário (apenas o próprio usuário pode editar)
export const updateComment = mutation({
  args: {
    commentId: v.id("postComments"),
    userId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, { commentId, userId, content }) => {
    const comment = await ctx.db.get(commentId);
    if (!comment) {
      throw new Error("Comentário não encontrado");
    }

    // Verificar se é o dono do comentário
    if (comment.userId !== userId) {
      throw new Error("Você não tem permissão para editar este comentário");
    }

    await ctx.db.patch(commentId, {
      content: content.trim(),
      updatedAt: Date.now(),
    });

    return commentId;
  },
});

// Deletar comentário (apenas o próprio usuário pode deletar)
export const deleteComment = mutation({
  args: {
    commentId: v.id("postComments"),
    userId: v.id("users"),
  },
  handler: async (ctx, { commentId, userId }) => {
    const comment = await ctx.db.get(commentId);
    if (!comment) {
      throw new Error("Comentário não encontrado");
    }

    // Verificar se é o dono do comentário
    if (comment.userId !== userId) {
      throw new Error("Você não tem permissão para deletar este comentário");
    }

    await ctx.db.delete(commentId);
    return commentId;
  },
});

// Buscar comentários de um usuário específico
export const getCommentsByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("postComments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});
