import { createFileRoute, Link } from "@tanstack/react-router";
import { useAction } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api.js";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/signup")({ component: SignUpRoute });

type Form = {
  nome: string;
  email: string;
  senha: string;
  confirmar: string;
  telefone: string;
  tipo_usuario: "Produtor Rural" | "Representante";
  data_nascimento: string; // yyyy-MM-dd
  cep: string;
  cidade: string;
  estado: string;
  bio: string;
  foto_url: string; // preview/local por enquanto
};

type Errors = Partial<Record<keyof Form | "confirmar", string>>;

function SignUpRoute() {
  const createWithPassword = useAction(api.user_actions.createWithPassword);
  const [form, setForm] = useState<Form>({
    nome: "",
    email: "",
    senha: "",
    confirmar: "",
    telefone: "",
    tipo_usuario: "Produtor Rural",
    data_nascimento: "",
    cep: "",
    cidade: "",
    estado: "",
    bio: "",
    foto_url: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [topError, setTopError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);

  function set<K extends keyof Form>(k: K, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  // validações
  const validators = useMemo(() => {
    const emailRe = /^\S+@\S+\.\S+$/;
    const cepRe = /^\d{5}-?\d{3}$/; // 00000-000 ou 00000000
    const telRe = /^[0-9()\-\s+]{8,}$/;

    const validate = (f: Form): Errors => {
      const e: Errors = {};
      if (!f.nome.trim()) e.nome = "Informe seu nome.";
      if (!emailRe.test(f.email.trim())) e.email = "E-mail inválido.";
      if (!f.senha) e.senha = "Crie uma senha.";
      if (!f.confirmar) e.confirmar = "Repita a senha.";
      if (f.senha && f.confirmar && f.senha !== f.confirmar)
        e.confirmar = "As senhas não coincidem.";
      if (!f.tipo_usuario) e.tipo_usuario = "Selecione o tipo de conta.";
      if (!cepRe.test(f.cep.trim())) e.cep = "CEP inválido. Ex.: 00000-000";
      if (f.telefone && !telRe.test(f.telefone)) e.telefone = "Telefone inválido.";
      if (f.data_nascimento && !/^\d{4}-\d{2}-\d{2}$/.test(f.data_nascimento))
        e.data_nascimento = "Use o formato yyyy-MM-dd.";
      return e;
    };
    return { validate };
  }, []);

  useEffect(() => {
    if (topError) setErrors(validators.validate(form));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTopError(null);
    const eMap = validators.validate(form);
    setErrors(eMap);
    if (Object.keys(eMap).length > 0) {
      setTopError("Verifique os campos obrigatórios destacados.");
      return;
    }

    setLoading(true);
    try {
      const email = form.email.trim().toLowerCase();
      const cep = form.cep.replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2");

      await createWithPassword({
        nome: form.nome.trim(),
        email,
        senha: form.senha,
        tipo_usuario: form.tipo_usuario,
        cep,
        telefone: form.telefone || undefined,
        data_nascimento: form.data_nascimento || undefined,
        cidade: form.cidade || undefined,
        estado: form.estado || undefined,
        bio: form.bio || undefined,
        foto_url: form.foto_url || undefined,
      });

      setShowSuccess(true);
      setTimeout(() => (window.location.href = "/login"), 2000);
    } catch (e: any) {
      setTopError(e?.message ?? "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  // avatar preview
  function onPickPhoto(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    set("foto_url", url);
  }

  const errClass = (key: keyof Form | "confirmar") =>
    `h-11 rounded-xl border ${errors[key] ? "border-red-500 bg-red-50" : ""}`;

  const label = (txt: string) => (
    <label className="text-sm font-semibold" style={{ color: "#6b3f33" }}>
      {txt}
    </label>
  );

  return (
    <div className="min-h-[calc(100dvh-56px)] w-full flex items-center justify-center px-4" style={{ background: "#f5efe5" }}>
      {/* Modal de sucesso */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 w-[90%] max-w-sm rounded-3xl p-6 text-center shadow-2xl"
               style={{ background: "#f6efe4", color: "#6b3f33" }}>
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full"
                 style={{ background: "#e3f7e7", color: "#1e7a31" }}>
              <span className="text-3xl">✓</span>
            </div>
            <h3 className="text-lg font-extrabold mb-1">Cadastro realizado!</h3>
            <p className="text-sm opacity-80">Redirecionando para o login…</p>
          </div>
        </div>
      )}

      <Card className="w-full max-w-2xl rounded-3xl border-0 shadow-[0_40px_120px_rgba(0,0,0,0.20)]"
            style={{ background: "#f6efe4", color: "#6b3f33" }}>
        {/* Header “grudado” ao topo do card */}
        <CardHeader className="pb-2 sticky top-0 z-10"
                    style={{ background: "#f6efe4" }}>
          <CardTitle className="text-center text-lg font-extrabold" style={{ color: "#6b3f33" }}>
            Criar Conta
          </CardTitle>
        </CardHeader>

        {/* Conteúdo com scroll interno e layout em 2 colunas a partir de md */}
        <CardContent className="max-h-[72vh] overflow-y-auto">
          {topError && (
            <div className="mb-4 rounded-xl border px-3 py-2 text-sm font-semibold"
                 style={{ background: "#fdecec", borderColor: "#f3b4b4", color: "#7d1d1d" }}>
              {topError}
            </div>
          )}

          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Avatar */}
            <div className="md:col-span-2 flex items-center justify-center mb-1">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full"
                   style={{ background: "#eadfce", color: "#6b3f33" }}>
                <span className="text-4xl font-extrabold">
                  {(form.nome?.[0] ?? "U").toUpperCase()}
                </span>
                <button type="button"
                        onClick={() => fileRef.current?.click()}
                        className="absolute -right-1 bottom-1 flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm"
                        style={{ background: "#f39a18", color: "#3a2000", borderColor: "#f6efe4" }}
                        title="Adicionar foto">
                  📷
                </button>
                {form.foto_url && (
                  <img src={form.foto_url} alt="Foto de perfil"
                       className="absolute inset-0 h-full w-full rounded-full object-cover" />
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
            </div>

            {/* Nome */}
            <div className="space-y-1.5">
              {label("Nome *")}
              <Input value={form.nome} onChange={(e) => set("nome", e.target.value)}
                     placeholder="Seu nome" className={errClass("nome")}
                     style={{ background: "#f9f2e8", borderColor: "#eadfce" }} />
              {errors.nome && <p className="text-xs text-red-600">{errors.nome}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              {label("E-mail *")}
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                     placeholder="seuemail@exemplo.com" className={errClass("email")}
                     style={{ background: "#f9f2e8", borderColor: "#eadfce" }} />
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Telefone */}
            <div className="space-y-1.5">
              {label("Telefone")}
              <Input value={form.telefone} onChange={(e) => set("telefone", e.target.value)}
                     placeholder="(00) 00000-0000" className={errClass("telefone")}
                     style={{ background: "#f9f2e8", borderColor: "#eadfce" }} />
              {errors.telefone && <p className="text-xs text-red-600">{errors.telefone}</p>}
            </div>

            {/* CEP */}
            <div className="space-y-1.5">
              {label("CEP *")}
              <Input value={form.cep} onChange={(e) => set("cep", e.target.value)}
                     placeholder="00000-000" className={errClass("cep")}
                     style={{ background: "#f9f2e8", borderColor: "#eadfce" }} />
              {errors.cep && <p className="text-xs text-red-600">{errors.cep}</p>}
            </div>

            {/* Data nasc. */}
            <div className="space-y-1.5">
              {label("Data de Nascimento")}
              <Input value={form.data_nascimento} onChange={(e) => set("data_nascimento", e.target.value)}
                     placeholder="yyyy-MM-dd" className={errClass("data_nascimento")}
                     style={{ background: "#f9f2e8", borderColor: "#eadfce" }} />
              {errors.data_nascimento && <p className="text-xs text-red-600">{errors.data_nascimento}</p>}
            </div>

            {/* Estado */}
            <div className="space-y-1.5">
              {label("Estado")}
              <Input value={form.estado} onChange={(e) => set("estado", e.target.value.toUpperCase())}
                     placeholder="UF" className={errClass("estado")}
                     style={{ background: "#f9f2e8", borderColor: "#eadfce" }} />
            </div>

            {/* Cidade (span 2 em md pra caber) */}
            <div className="space-y-1.5 md:col-span-2">
              {label("Cidade")}
              <Input value={form.cidade} onChange={(e) => set("cidade", e.target.value)}
                     placeholder="Sua cidade" className={errClass("cidade")}
                     style={{ background: "#f9f2e8", borderColor: "#eadfce" }} />
            </div>

            {/* Tipo de conta */}
            <div className="space-y-1.5">
              {label("Tipo de Conta *")}
              <select value={form.tipo_usuario} onChange={(e) => set("tipo_usuario", e.target.value as Form["tipo_usuario"])}
                      className={`w-full h-11 rounded-xl border px-3 ${errors.tipo_usuario ? "border-red-500 bg-red-50" : ""}`}
                      style={{ background: "#f9f2e8", borderColor: "#eadfce", color: "#6b3f33" }}>
                <option>Produtor Rural</option>
                <option>Representante</option>
              </select>
              {errors.tipo_usuario && <p className="text-xs text-red-600">{errors.tipo_usuario}</p>}
            </div>

            {/* Bio (pega largura toda) */}
            <div className="space-y-1.5 md:col-span-2">
              {label("Bio")}
              <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)}
                        placeholder="Conte um pouco sobre você"
                        className={`min-h-[96px] w-full rounded-xl border p-3 ${errors.bio ? "border-red-500 bg-red-50" : ""}`}
                        style={{ background: "#f9f2e8", borderColor: "#eadfce" }} />
            </div>

            {/* Senhas (lado a lado) */}
            <div className="space-y-1.5">
              {label("Senha *")}
              <Input type="password" value={form.senha} onChange={(e) => set("senha", e.target.value)}
                     placeholder="Crie sua senha" className={errClass("senha")}
                     style={{ background: "#f9f2e8", borderColor: "#eadfce" }} />
              {errors.senha && <p className="text-xs text-red-600">{errors.senha}</p>}
            </div>
            <div className="space-y-1.5">
              {label("Confirmar Senha *")}
              <Input type="password" value={form.confirmar} onChange={(e) => set("confirmar", e.target.value)}
                     placeholder="Repita a senha" className={errClass("confirmar")}
                     style={{ background: "#f9f2e8", borderColor: "#eadfce" }} />
              {errors.confirmar && <p className="text-xs text-red-600">{errors.confirmar}</p>}
            </div>

            {/* Ações */}
            <div className="md:col-span-2">
              <Button type="submit" disabled={loading}
                      className="h-12 w-full rounded-2xl text-base font-extrabold shadow-md"
                      style={{ background: "#f39a18", color: "#3a2000" }}>
                {loading ? "Enviando..." : "Cadastrar"}
              </Button>
              <div className="mt-2 text-center text-sm">
                Já tem conta?{" "}
                <Link to="/login" className="font-semibold" style={{ color: "#2d7a31" }}>
                  Entrar
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
