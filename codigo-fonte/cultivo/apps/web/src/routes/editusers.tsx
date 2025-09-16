import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api.js";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/editusers")({
  component: EditUserRoute,
});

function EditUserRoute() {
  const { id } = useParams({ from: "/users/$id/edit" });

  const user = useQuery(api.user.getById, id ? { id: id as any } : "skip");
  const update = useMutation(api.user.update);

  const [form, setForm] = useState({
    nome: "",
    tipo_usuario: "Produtor Rural",
    data_nascimento: "",
    cep: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        nome: user.nome ?? "",
        tipo_usuario: user.tipo_usuario ?? "Produtor Rural",
        data_nascimento: user.data_nascimento ?? "",
        cep: user.cep ?? "",
      });
    }
  }, [user]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    await update({
      id: id as any,
      nome: form.nome || undefined,
      tipo_usuario: form.tipo_usuario || undefined,
      data_nascimento: form.data_nascimento || undefined,
      cep: form.cep || undefined,
    });
    alert("Alterações salvas!");
  }

  if (user === undefined) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        Carregando…
      </div>
    );
  }

  // Avatar com a inicial do nome
  const initial = (user?.nome?.[0] ?? "U").toUpperCase();

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
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-lg" style={{ color: "#6b3f33" }}>
              ←
            </Link>
            <CardTitle className="mx-auto text-lg font-extrabold" style={{ color: "#6b3f33" }}>
              Editar Perfil
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          {/* Avatar */}
          <div className="relative mx-auto mb-4 mt-1 flex h-24 w-24 items-center justify-center rounded-full"
               style={{ background: "#eadfce", color: "#6b3f33" }}>
            <span className="text-4xl font-extrabold">{initial}</span>
            {/* Botão de câmera decorativo */}
            <div
              className="absolute -right-1 bottom-2 flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm"
              style={{ background: "#f39a18", color: "#3a2000", borderColor: "#f6efe4" }}
              title="Alterar foto (em breve)"
            >
              📷
            </div>
          </div>

          <form onSubmit={onSave} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold" style={{ color: "#6b3f33" }}>
                Nome Completo
              </label>
              <Input
                placeholder="Seu nome"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="h-12 rounded-xl border"
                style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold" style={{ color: "#6b3f33" }}>
                Email
              </label>
              <Input
                value={user?.email ?? ""}
                disabled
                className="h-12 rounded-xl border opacity-90"
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
                  onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, cep: e.target.value })}
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
                className="h-12 w-full rounded-xl border px-3"
                style={{ background: "#f9f2e8", borderColor: "#eadfce", color: "#6b3f33" }}
                value={form.tipo_usuario}
                onChange={(e) => setForm({ ...form, tipo_usuario: e.target.value })}
              >
                <option>Produtor Rural</option>
                <option>Representante</option>
              </select>
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-2xl text-base font-extrabold shadow-md"
              style={{ background: "#f39a18", color: "#3a2000" }}
            >
              Salvar Alterações
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
