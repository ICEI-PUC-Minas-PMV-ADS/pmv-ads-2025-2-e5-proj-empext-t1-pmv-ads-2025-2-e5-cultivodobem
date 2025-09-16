import { action } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

export const createWithPassword = action({
  args: {
    nome: v.string(),
    email: v.string(),
    senha: v.string(),                  
    tipo_usuario: v.string(),           
    telefone: v.optional(v.string()),
    data_nascimento: v.optional(v.string()), 
    cep: v.optional(v.string()),
    cidade: v.optional(v.string()),
    estado: v.optional(v.string()),
    bio: v.optional(v.string()),
    foto_url: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"usuario">> => {
    const senha_hash = await bcrypt.hash(args.senha, 10);

    // cria a conta de usuário com a senha hash
    const id = await ctx.runMutation(api.user.create, {
      nome: args.nome,
      email: args.email,
      senha_hash,
      tipo_usuario: args.tipo_usuario,
      telefone: args.telefone,
      data_nascimento: args.data_nascimento,
      cep: args.cep,
      cidade: args.cidade,
      estado: args.estado,
      bio: args.bio,
      foto_url: args.foto_url,
    });

    return id;
  },
});
