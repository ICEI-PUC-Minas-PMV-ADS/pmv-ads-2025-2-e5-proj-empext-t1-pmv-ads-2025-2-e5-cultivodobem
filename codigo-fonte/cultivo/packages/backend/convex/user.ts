import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("usuario")
      .withIndex("by_criado_em")
      .order("desc")
      .collect();
  },
});

export const listProdutores = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("usuario")
      .withIndex("by_criado_em")
      .filter((q) => q.eq("tipo_usuario", "Produtor Rural"))
      .order("desc")
      .collect();
  },
});

// export const listRepresentantes = query({
//   args: {},
//   handler: async (ctx) => {
//     return await ctx.db
//       .query("usuario")
//       .withIndex("by_criado_em")
//       .filter((q) => q.eq("tipo_usuario", "Representante"))
//       .order("desc")
//       .collect();
//   },
// });

//       .filter((q) => q.eq("tipo_usuario", "Produtor Rural"))
//       .order("desc")
//       .collect();
//   },
// });

export const getById = query({
  args: { id: v.id("usuario") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const create = mutation({
  args: {
    nome: v.string(),
    email: v.string(),
    senha_hash: v.optional(v.string()),
    telefone: v.optional(v.string()),
    tipo_usuario: v.optional(v.string()),
    data_nascimento: v.optional(v.string()),  // ISO yyyy-MM-dd
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
      .query("usuario")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (exists) throw new Error("E-mail já cadastrado.");

    const tipo =
      args.tipo_usuario === "Produtor Rural" ? "produtor" :
      args.tipo_usuario === "Representante"  ? "representante" :
      args.tipo_usuario ?? "membro";

    const id = await ctx.db.insert("usuario", {
      nome: args.nome.trim(),
      email,
      senha_hash: args.senha_hash,
      telefone: args.telefone,
      tipo_usuario: tipo,
      data_nascimento: args.data_nascimento,
      cep: args.cep,
      cidade: args.cidade,
      estado: args.estado,
      bio: args.bio,
      foto_url: args.foto_url,
      criado_em: Date.now(),
      atualizado_em: Date.now(),
    });

    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("usuario"),
    nome: v.optional(v.string()),
    email: v.optional(v.string()),
    senha_hash: v.optional(v.string()), // (se trocar senha via Action)
    telefone: v.optional(v.string()),
    tipo_usuario: v.optional(v.string()),
    data_nascimento: v.optional(v.string()),
    cep: v.optional(v.string()),
    cidade: v.optional(v.string()),
    estado: v.optional(v.string()),
    bio: v.optional(v.string()),
    foto_url: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...rest }) => {
    const u = await ctx.db.get(id);
    if (!u) throw new Error("Usuário não encontrado.");

    const patch: Record<string, unknown> = { atualizado_em: Date.now() };

    if (rest.nome !== undefined) patch.nome = rest.nome.trim();
    if (rest.telefone !== undefined) patch.telefone = rest.telefone;
    if (rest.tipo_usuario !== undefined) patch.tipo_usuario = rest.tipo_usuario;
    if (rest.data_nascimento !== undefined) patch.data_nascimento = rest.data_nascimento;
    if (rest.cep !== undefined) patch.cep = rest.cep;
    if (rest.cidade !== undefined) patch.cidade = rest.cidade;
    if (rest.estado !== undefined) patch.estado = rest.estado;
    if (rest.bio !== undefined) patch.bio = rest.bio;
    if (rest.foto_url !== undefined) patch.foto_url = rest.foto_url;

    if (rest.email !== undefined) {
      const email = rest.email.trim().toLowerCase();
      if (email !== u.email) {
        const exists = await ctx.db
          .query("usuario")
          .withIndex("by_email", (q) => q.eq("email", email))
          .first();
        if (exists) throw new Error("E-mail já cadastrado.");
      }
      patch.email = email;
    }

    if (rest.senha_hash !== undefined) patch.senha_hash = rest.senha_hash;

    await ctx.db.patch(id, patch);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("usuario") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return id;
  },
});
