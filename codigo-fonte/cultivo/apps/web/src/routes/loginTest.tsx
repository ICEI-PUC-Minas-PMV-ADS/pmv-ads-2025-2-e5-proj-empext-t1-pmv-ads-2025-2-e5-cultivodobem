import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api.js";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/loginTest")({
  component: LoginRoute,
});

function LoginRoute() {
  const login = useAction(api.user_actions.loginWithPassword); 
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const { id } = await login({ email: email.trim(), senha });
      window.location.href = `/users/${id}/edit`;
    } catch (e: any) {
      setErr(e?.message ?? "Falha no login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100dvh-56px)] w-full flex items-center justify-center px-4"
         style={{ background: "#f5efe5" }}>
      <Card
        className="w-full max-w-md rounded-3xl border-0 shadow-[0_40px_120px_rgba(0,0,0,0.20)]"
        style={{ background: "#f6efe4", color: "#6b3f33" }}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-lg font-extrabold"
            style={{ color: "#6b3f33" }}>
            Acessar Conta
          </CardTitle>
        </CardHeader>

        <CardContent>
          {err && (
            <div className="mb-4 rounded-xl border px-3 py-2 text-sm font-semibold"
                 style={{ background:"#fdecec", borderColor:"#f3b4b4", color:"#7d1d1d" }}>
              {err}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold" style={{ color:"#6b3f33" }}>
                Email
              </label>
              <Input
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                className="h-12 rounded-xl border"
                style={{ background:"#f9f2e8", borderColor:"#eadfce" }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold" style={{ color:"#6b3f33" }}>
                Senha
              </label>
              <Input
                type="password"
                placeholder="Sua senha"
                value={senha}
                onChange={(e)=>setSenha(e.target.value)}
                className="h-12 rounded-xl border"
                style={{ background:"#f9f2e8", borderColor:"#eadfce" }}
              />
            </div>

            <div className="text-right">
              <a href="#" className="text-sm font-semibold"
                 style={{ color:"#2d7a31" }}>
                Esqueceu sua senha?
              </a>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-2xl text-base font-extrabold shadow-md"
              style={{ background:"#f39a18", color:"#3a2000" }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="text-center text-sm">
              Não tem uma conta?{" "}
              <Link to="/signup" className="font-semibold"
                    style={{ color:"#2d7a31" }}>
                Cadastre-se
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
