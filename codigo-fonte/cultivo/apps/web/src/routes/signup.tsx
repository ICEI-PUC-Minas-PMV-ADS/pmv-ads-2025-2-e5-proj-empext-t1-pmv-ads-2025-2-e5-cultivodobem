import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api.js";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/signup")({ component: SignUpRoute });

function SignUpRoute() {
  const createWithPassword = useAction(api.user_actions.createWithPassword);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmar: "",
    tipo_usuario: "Produtor Rural",
    data_nascimento: "",
    cep: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!form.nome.trim() || !/^\S+@\S+\.\S+$/.test(form.email) || !form.senha || form.senha !== form.confirmar) {
      setErr("Verifique os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const { id } = await createWithPassword({
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
        tipo_usuario: form.tipo_usuario,
        data_nascimento: form.data_nascimento || undefined,
        cep: form.cep || undefined,
      });
      window.location.href = `/users/${id}/edit`;
    } catch (e: any) {
      setErr(e?.message ?? "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-[calc(100dvh-56px)] w-full flex items-center justify-center px-4"
      style={{ background: "#f5efe5" }}
    >
      <Card
        className="w-full max-w-md rounded-3xl border-0 shadow-[0_40px_120px_rgba(0,0,0,0.20)]"
        style={{ background: "#f6efe4", color: "#6b3f33" }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-lg font-extrabold" style={{ color: "#6b3f33" }}>
            Criar Conta
          </CardTitle>
        </CardHeader>

        <CardContent>
          {err && (
            <div
              className="mb-4 rounded-xl border px-3 py-2 text-sm font-semibold"
              style={{ background: "#fdecec", borderColor: "#f3b4b4", color: "#7d1d1d" }}
            >
              {err}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold" style={{ color: "#6b3f33" }}>
                Nome *
              </label>
              <Input
                placeholder="Seu nome"
                value={form.nome}
                onChange={(e) => set("nome", e.target.value)}
                className="h-12 rounded-xl border"
                style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold" style={{ color: "#6b3f33" }}>
                E-mail *
              </label>
              <Input
                type="email"
                placeholder="seuemail@exemplo.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="h-12 rounded-xl border"
                style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: "#6b3f33" }}>
                  Data de Nascimento
                </label>
                <Input
                  placeholder="yyyy-MM-dd"
                  value={form.data_nascimento}
                  onChange={(e) => set("data_nascimento", e.target.value)}
                  className="h-12 rounded-xl border"
                  style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: "#6b3f33" }}>
                  CEP
                </label>
                <Input
                  placeholder="00000-000"
                  value={form.cep}
                  onChange={(e) => set("cep", e.target.value)}
                  className="h-12 rounded-xl border"
                  style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold" style={{ color: "#6b3f33" }}>
                Tipo de Conta
              </label>
              <select
                className="w-full h-12 rounded-xl border px-3"
                style={{ background: "#f9f2e8", borderColor: "#eadfce", color: "#6b3f33" }}
                value={form.tipo_usuario}
                onChange={(e) => set("tipo_usuario", e.target.value)}
              >
                <option>Produtor Rural</option>
                <option>Representante</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold" style={{ color: "#6b3f33" }}>
                Senha *
              </label>
              <Input
                type="password"
                placeholder="Crie sua senha"
                value={form.senha}
                onChange={(e) => set("senha", e.target.value)}
                className="h-12 rounded-xl border"
                style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold" style={{ color: "#6b3f33" }}>
                Confirmar Senha *
              </label>
              <Input
                type="password"
                placeholder="Repita a senha"
                value={form.confirmar}
                onChange={(e) => set("confirmar", e.target.value)}
                className="h-12 rounded-xl border"
                style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-2xl text-base font-extrabold shadow-md"
              style={{ background: "#f39a18", color: "#3a2000" }}
            >
              {loading ? "Enviando..." : "Cadastrar"}
            </Button>

            <div className="text-center text-sm">
              Já tem conta?{" "}
              <Link to="/loginTest" className="font-semibold" style={{ color: "#2d7a31" }}>
                Entrar
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
