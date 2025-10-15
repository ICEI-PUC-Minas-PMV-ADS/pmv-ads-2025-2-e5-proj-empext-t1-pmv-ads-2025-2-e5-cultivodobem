import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Listar todos os usuários
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .collect();
  },
});

// Listar apenas produtores rurais
export const listProdutores = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq("tipo_usuario", "Produtor Rural"))
      .collect();
  },
});

// READ
export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    const user = await ctx.db.get(id);
    if (!user) return null;
    const { passwordHash, ...safe } = user;
    return safe;
  },
});

// CREATE
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    senha_hash: v.optional(v.string()),
    telefone: v.optional(v.string()),
    tipo_usuario: v.optional(v.string()),
    data_nascimento: v.optional(v.string()),
    cep: v.optional(v.string()),
    cidade: v.optional(v.string()),
    estado: v.optional(v.string()),
    bio: v.optional(v.string()),
    foto_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const email = args.email.trim().toLowerCase();

    const exists = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (exists) throw new Error("E-mail já cadastrado.");

    const tipo =
      args.tipo_usuario === "Produtor Rural" ? "produtor" :
      args.tipo_usuario === "Representante"  ? "representante" :
      args.tipo_usuario ?? "membro";

    const id = await ctx.db.insert("users", {
      name: args.name.trim(),
      email,
      passwordHash: args.senha_hash,
      telefone: args.telefone,
      tipo_usuario: tipo as "Produtor Rural" | "Representante",
      data_nascimento: args.data_nascimento,
      cep: args.cep,
      cidade: args.cidade,
      estado: args.estado,
      bio: args.bio,
      foto_url: args.foto_url,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return id;
  },
});

// UPDATE
export const update = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    senha_atual: v.optional(v.string()),
    senha_hash: v.optional(v.string()),
    tipo_usuario: v.optional(
      v.union(v.literal("Produtor Rural"), v.literal("Representante"))
    ),
    data_nascimento: v.optional(v.string()),
    cep: v.optional(v.string()),
    telefone: v.optional(v.string()),
    cidade: v.optional(v.string()),
    estado: v.optional(v.string()),
    bio: v.optional(v.string()),
    foto_url: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(id);
    if (!user) throw new Error("Usuário não encontrado.");

    // Preparar dados para atualização
    const updateData: any = {};

    // Copiar campos básicos se fornecidos
    if (args.name) updateData.name = args.name;
    if (args.email) updateData.email = args.email;
    if (args.tipo_usuario) updateData.tipo_usuario = args.tipo_usuario;
    if (args.data_nascimento) updateData.data_nascimento = args.data_nascimento;
    if (args.cep) updateData.cep = args.cep;
    if (args.telefone) updateData.telefone = args.telefone;
    if (args.cidade) updateData.cidade = args.cidade;
    if (args.estado) updateData.estado = args.estado;
    if (args.bio) updateData.bio = args.bio;
    if ('foto_url' in args) updateData.foto_url = args.foto_url;

    // Verificar e-mail único
    if (args.email && args.email !== user.email) {
      const dup = await ctx.db
        .query("users")
        .withIndex("by_email", q => q.eq("email", args.email))
        .first();
      if (dup && dup._id !== id) throw new Error("E-mail já está em uso.");
    }

    // Troca de senha (opcional)
    if (args.senha_atual || args.senha_hash) {
      if (!args.senha_atual || !args.senha_hash) {
        throw new Error("Informe a senha atual e a nova senha.");
      }
      if (!user.passwordHash) throw new Error("Usuário não possui senha cadastrada.");
      if (args.senha_atual !== user.passwordHash) {
        throw new Error("Senha atual incorreta.");
      }
      updateData.passwordHash = args.senha_hash;
    }

    updateData.updatedAt = Date.now();
    await ctx.db.patch(id, updateData);
    return id;
  },
});

// DELETE
export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return id;
  },
});
