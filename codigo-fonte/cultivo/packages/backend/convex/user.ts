import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Listar todos os usuários
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
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
    const email = args.email.trim().toLowerCase();

    const exists = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (exists) throw new Error("E-mail já cadastrado.");

    let tipo: string;
    if (args.tipo_usuario === "Produtor Rural") {
      tipo = "produtor";
    } else if (args.tipo_usuario === "Representante") {
      tipo = "representante";
    } else {
      tipo = args.tipo_usuario ?? "membro";
    }

    const id = await ctx.db.insert("users", {
      name: args.name.trim(),
      email,
      passwordHash: args.senha_hash || "",
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
    tipo_usuario: v.optional(
      v.union(v.literal("Produtor Rural"), v.literal("Representante"))
    ),
    data_nascimento: v.optional(v.string()),
    cep: v.optional(v.string()),
    logradouro: v.optional(v.string()),
    numero: v.optional(v.string()),
    complemento: v.optional(v.string()),
    telefone: v.optional(v.string()),
    cidade: v.optional(v.string()),
    estado: v.optional(v.string()),
    bio: v.optional(v.string()),
    foto_url: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...args }) => {
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
    if (args.logradouro) updateData.logradouro = args.logradouro;
    if (args.numero) updateData.numero = args.numero;
    if (args.complemento) updateData.complemento = args.complemento;
    if (args.telefone) updateData.telefone = args.telefone;
    if (args.cidade) updateData.cidade = args.cidade;
    if (args.estado) updateData.estado = args.estado;
    if (args.bio) updateData.bio = args.bio;
    if ("foto_url" in args) updateData.foto_url = args.foto_url;

    // Verificar e-mail único se estiver sendo alterado
    if (args.email && args.email !== user.email) {
      const dup = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email!))
        .first();
      if (dup && dup._id !== id) throw new Error("E-mail já está em uso.");
    }

    updateData.updatedAt = Date.now();
    await ctx.db.patch(id, updateData);
    return id;
  },
});

// CHANGE PASSWORD
export const changePassword = mutation({
  args: {
    id: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, { id, currentPassword, newPassword }) => {
    const user = await ctx.db.get(id);
    if (!user) throw new Error("Usuário não encontrado.");

    // Verificar se a senha atual está correta
    if (!user.passwordHash) {
      throw new Error("Usuário não possui senha cadastrada.");
    }

    if (currentPassword !== user.passwordHash) {
      throw new Error("Senha atual incorreta.");
    }

    // Atualizar com a nova senha
    await ctx.db.patch(id, {
      passwordHash: newPassword,
      updatedAt: Date.now(),
    });

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
