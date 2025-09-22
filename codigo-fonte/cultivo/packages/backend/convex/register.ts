import { mutation } from "./_generated/server";
import { v } from "convex/values";

// usa o mesmo esquema de hash do auth. (btoa)
const hashPassword = (plain: string) => btoa(plain);

export const register = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    tipo_usuario: v.optional(
      v.union(v.literal("Produtor Rural"), v.literal("Representante"))
    ),
    telefone: v.optional(v.string()),
    data_nascimento: v.optional(v.string()),
    cep: v.optional(v.string()),
    cidade: v.optional(v.string()),
    estado: v.optional(v.string()),
    bio: v.optional(v.string()),
    foto_url: v.optional(v.string()),
  },

  handler: async (ctx, args) => {

    const email = args.email.toLowerCase();

    // unicidade por email
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing) {
      throw new Error("E-mail já cadastrado.");
    }

    const passwordHash = hashPassword(args.password);

    const _id = await ctx.db.insert("users", {
      email,
      passwordHash,
      name: args.name,
      tipo_usuario: args.tipo_usuario,
      telefone: args.telefone,
      data_nascimento: args.data_nascimento,
      cep: args.cep,
      cidade: args.cidade,
      estado: args.estado,
      bio: args.bio,
      foto_url: args.foto_url,
      createdAt: Date.now(),
    });

    return { _id };
  },
});
