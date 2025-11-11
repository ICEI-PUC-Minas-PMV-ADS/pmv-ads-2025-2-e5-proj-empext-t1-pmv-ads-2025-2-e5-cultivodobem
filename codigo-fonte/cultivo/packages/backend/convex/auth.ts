import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Função simples de hash da senha (apenas para demonstração)
function hashPassword(password: string): string {
	// Em produção, use uma biblioteca adequada como bcrypt
	return btoa(password);
}

function verifyPassword(password: string, hash: string): boolean {
	return btoa(password) === hash;
}

// Login
export const login = mutation({
	args: {
		email: v.string(),
		password: v.string(),
	},
	handler: async (ctx, { email, password }) => {
		// Buscar usuário pelo email
		const user = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
			.first();

		if (!user) {
			throw new Error("Credenciais inválidas");
		}

		// Verificar senha
		if (!verifyPassword(password, user.passwordHash)) {
			throw new Error("Credenciais inválidas");
		}

		// Retornar dados do usuário (sem a senha)
		return {
			_id: user._id,
			email: user.email,
			name: user.name,
			createdAt: user.createdAt,
		};
	},
});

// Criar usuário inicial para testes
export const createInitialUser = mutation({
	args: {},
	handler: async (ctx) => {
		// Verificar se já existe o usuário admin
		const existingUser = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", "admin@cultivodobem.com"))
			.first();

		if (existingUser) {
			return { message: "Usuário admin já existe" };
		}

		// Criar usuário admin
		const userId = await ctx.db.insert("users", {
			email: "admin@cultivodobem.com",
			passwordHash: hashPassword("123456"),
			name: "Administrador",
			createdAt: Date.now(),
		});

		return {
			message: "Usuário admin criado com sucesso",
			userId,
		};
	},
});

// Buscar usuário por ID
export const getUser = query({
	args: {
		userId: v.id("users"),
	},
	handler: async (ctx, { userId }) => {
		const user = await ctx.db.get(userId);

		if (!user) {
			return null;
		}

		// Retornar dados do usuário (sem a senha)
		return {
			_id: user._id,
			email: user.email,
			name: user.name,
			createdAt: user.createdAt,
		};
	},
});
