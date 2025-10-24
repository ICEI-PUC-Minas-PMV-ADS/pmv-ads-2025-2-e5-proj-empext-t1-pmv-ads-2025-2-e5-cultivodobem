import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import "@/styles/signup.css";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { Camera } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../../../packages/backend/convex/_generated/api.js";

export const Route = createFileRoute("/signup")({ component: SignUpRoute });

type Form = {
  nome: string;
  email: string;
  senha: string;
  confirmar: string;
  telefone: string;
  tipo_usuario: "Produtor Rural" | "Representante";
  data_nascimento: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  cidade: string;
  estado: string;
  bio: string;
  foto_url: string;
};
type Errors = Partial<Record<keyof Form | "confirmar", string>>;

function SignUpRoute() {
  const nav = useNavigate();
  const register = useMutation(api.register.register);
  const [form, setForm] = useState<Form>({
    nome: "",
    email: "",
    senha: "",
    confirmar: "",
    telefone: "",
    tipo_usuario: "Produtor Rural",
    data_nascimento: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    cidade: "",
    estado: "",
    bio: "",
    foto_url: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [topError, setTopError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  // ViaCEP: status de busca
  const [cepStatus, setCepStatus] = useState<{ loading: boolean; error: string | null }>({
    loading: false,
    error: null,
  });

  const fileRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

  function set<K extends keyof Form>(k: K, v: string) {
    let formattedValue = v;

    // Formatação específica para cada campo
    switch (k) {
      case "telefone":
        // Remove tudo que não é número
        const numbersOnly = v.replace(/\D/g, "");
        if (numbersOnly.length <= 11) {
          // Formata como (XX) XXXXX-XXXX
          formattedValue = numbersOnly.replace(
            /^(\d{0,2})(\d{0,5})(\d{0,4}).*$/,
            (_, g1, g2, g3) => {
              let formatted = "";
              if (g1) formatted += `(${g1}`;
              if (g2) formatted += `) ${g2}`;
              if (g3) formatted += `-${g3}`;
              return formatted;
            }
          );
        } else {
          return; // Não atualiza se passar de 11 dígitos
        }
        break;

      case "numero":
        // Aceita apenas números
        if (!/^\d*$/.test(v)) return;
        break;

      case "nome":
        // Remove números e caracteres especiais, permite espaços e acentos
        formattedValue = v.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");
        break;

      case "email":
        // Converte para minúsculas
        formattedValue = v.toLowerCase();
        break;
    }

    setForm((s) => ({ ...s, [k]: formattedValue }));
  }

  const validators = useMemo(() => {
    const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const cepRe = /^\d{5}-?\d{3}$/;
    const telRe = /^\(\d{2}\)\s\d{5}-\d{4}$/;
    const passwordRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    const nomeRe = /^[A-Za-zÀ-ÖØ-öø-ÿ]+ [A-Za-zÀ-ÖØ-öø-ÿ]+/; // Nome e sobrenome
    const numeroRe = /^\d+$/;
    
    const validate = (f: Form): Errors => {
      const e: Errors = {};
      
      // Validação de nome
      if (!f.nome.trim()) {
        e.nome = "Informe seu nome.";
      } else if (!nomeRe.test(f.nome.trim())) {
        e.nome = "Informe nome e sobrenome.";
      }

      // Validação de email
      if (!f.email) {
        e.email = "Informe seu e-mail.";
      } else if (!emailRe.test(f.email.trim())) {
        e.email = "E-mail inválido. Use o formato: exemplo@dominio.com";
      }

      // Validação de senha
      if (!f.senha) {
        e.senha = "Crie uma senha.";
      } else if (!passwordRe.test(f.senha)) {
        e.senha = "A senha deve ter no mínimo 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais.";
      }

      // Confirmação de senha
      if (!f.confirmar) e.confirmar = "Repita a senha.";
      if (f.senha && f.confirmar && f.senha !== f.confirmar)
        e.confirmar = "As senhas não coincidem.";
      // Tipo de usuário
      if (!f.tipo_usuario) e.tipo_usuario = "Selecione o tipo de conta.";

      // CEP
      if (!cepRe.test(f.cep.trim())) e.cep = "CEP inválido. Ex.: 00000-000";

      // Telefone
      if (f.telefone) {
        if (!telRe.test(f.telefone)) {
          e.telefone = "Formato inválido. Use: (00) 00000-0000";
        }
      }

      // Data de nascimento
      if (f.data_nascimento) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(f.data_nascimento)) {
          e.data_nascimento = "Data inválida.";
        } else {
          const date = new Date(f.data_nascimento);
          const hoje = new Date();
          const idade = hoje.getFullYear() - date.getFullYear();
          if (idade < 18) {
            e.data_nascimento = "Você precisa ter pelo menos 18 anos.";
          }
        }
      }

      // Número (apenas dígitos)
      if (f.numero && !numeroRe.test(f.numero)) {
        e.numero = "Use apenas números.";
      }
      return e;
    };
    return { validate };
  }, []);

  // trava o scroll do body enquanto o modal estiver aberto
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    if (topError) setErrors(validators.validate(form));
  }, [form, topError, validators]);

  // Busca CEP no ViaCEP e preenche cidade/estado/logradouro
  async function buscarCEP() {
    const digits = form.cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setCepStatus({ loading: false, error: "CEP deve ter 8 dígitos." });
      return;
    }

    setCepStatus({ loading: true, error: null });
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();

      if (data?.erro) {
        setCepStatus({ loading: false, error: "CEP não encontrado." });
        return;
      }

      // Preenche logradouro, cidade e estado
      setForm((s) => ({
        ...s,
        logradouro: data?.logradouro ?? "",
        cidade: data?.localidade ?? s.cidade,
        estado: data?.uf ?? s.estado,
      }));

      // normaliza o CEP com hífen na UI
      setForm((s) => ({
        ...s,
        cep: digits.replace(/(\d{5})(\d{3})/, "$1-$2"),
      }));

      setCepStatus({ loading: false, error: null });
    } catch {
      setCepStatus({ loading: false, error: "Falha ao consultar o CEP." });
    }
  }

  // Handler pra usar no onBlur do campo CEP
  function onCepBlur() {
    const digits = form.cep.replace(/\D/g, "");
    if (digits.length === 8) {
      buscarCEP();
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTopError(null);

    const eMap = validators.validate(form);
    setErrors(eMap);
    if (Object.keys(eMap).length) {
      setTopError("Verifique os campos obrigatórios destacados.");
      return;
    }

    setLoading(true);
    try {
      const email = form.email.trim().toLowerCase();
      const cep = form.cep
        .replace(/\D/g, "")
        .replace(/(\d{5})(\d{3})/, "$1-$2");

      await register({
        email,
        password: form.senha,
        name: form.nome.trim(),
        tipo_usuario: form.tipo_usuario,
        cep,
        logradouro: form.logradouro || undefined,
        numero: form.numero || undefined,
        complemento: form.complemento || undefined,
        telefone: form.telefone || undefined,
        data_nascimento: form.data_nascimento || undefined,
        cidade: form.cidade || undefined,
        estado: form.estado || undefined,
        bio: form.bio || undefined,
        foto_url: form.foto_url || undefined,
      });

      setShowSuccess(true);
      setTimeout(() => nav({ to: "/login" }), 2000);
    } catch (e: any) {
      const msg = String(e?.message ?? e);
      if (msg.toLowerCase().includes("e-mail já cadastrado")) {
        setErrors((prev) => ({
          ...prev,
          email: "Este e-mail já está cadastrado.",
        }));
        setTopError("Já existe uma conta com este e-mail.");
        emailRef.current?.focus();
      } else {
        setTopError("Não foi possível concluir o cadastro. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  function onPickPhoto(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    set("foto_url", url);
  }

  const errClass = (k: keyof Form | "confirmar") =>
    `h-11 rounded-xl border ${errors[k] ? "border-red-500 bg-red-50" : ""}`;
  const label = (txt: string) => (
    <label className="text-sm font-semibold" style={{ color: "#6b3f33" }}>
      {txt}
    </label>
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 signup-backdrop" />

      {/* Container do modal (clicar fora fecha) */}
      <div
        className="fixed inset-0 z-50 overflow-y-auto signup-surface"
        onClick={() => nav({ to: "/login" })}
      >
        <div className="flex min-h-dvh items-start justify-center p-4 sm:p-6">
          {/* Modal de sucesso */}
          {showSuccess && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" />
              <div
                className="relative z-10 w-[90%] max-w-sm rounded-3xl p-6 text-center shadow-2xl"
                style={{ background: "#f6efe4", color: "#6b3f33" }}
              >
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full signup-success-ring">
                  <span className="text-3xl">✓</span>
                </div>
                <h3 className="text-lg font-extrabold mb-1">
                  Cadastro realizado!
                </h3>
                <p className="text-sm opacity-80">
                  Redirecionando para o login…
                </p>
              </div>
            </div>
          )}

          {/* Card (para o clique não fechar) */}
          <Card
            onClick={(e) => e.stopPropagation()}
            className="relative my-6 w-full max-w-[520px] md:max-w-md rounded-3xl border-0 shadow-[0_40px_120px_rgba(0,0,0,0.20)]"
            style={{ background: "#f6efe4", color: "#6b3f33" }}
          >
            {/* Close (X) */}
            <button
              type="button"
              onClick={() => nav({ to: "/login" })}
              className="signup-close absolute left-3 top-3"
              title="Fechar"
              aria-label="Fechar"
            >
              ×
            </button>

            <CardHeader
              className="pb-2 sticky top-0 z-10"
              style={{ background: "#f6efe4" }}
            >
              <CardTitle
                className="text-center text-lg font-extrabold"
                style={{ color: "#6b3f33" }}
              >
                Criar Conta
              </CardTitle>
            </CardHeader>

            <CardContent className="px-4 sm:px-6 pb-6">
              <form
                onSubmit={onSubmit}
                className="grid grid-cols-1 gap-3 md:grid-cols-2"
              >
                {/* Avatar */}
                <div className="md:col-span-2 flex items-center justify-center mb-1">
                  <div
                    className="signup-avatar flex h-24 w-24 items-center justify-center rounded-full"
                    style={{ background: "#eadfce", color: "#6b3f33" }}
                  >
                    {!form.foto_url && (
                      <span className="text-4xl font-extrabold">
                        {(form.nome?.[0] ?? "U").toUpperCase()}
                      </span>
                    )}
                    {form.foto_url && (
                      <img
                        src={form.foto_url}
                        alt="Foto de perfil"
                        className="h-full w-full rounded-full object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="signup-avatar-btn"
                      title="Adicionar foto"
                      aria-label="Adicionar foto"
                    >
                      <Camera size={16} />
                    </button>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onPickPhoto}
                  />
                </div>

                {/* Nome */}
                <div className="space-y-1.5">
                  {label("Nome Completo *")}
                  <Input
                    value={form.nome}
                    onChange={(e) => set("nome", e.target.value)}
                    placeholder="Seu nome e sobrenome"
                    className={errClass("nome")}
                    style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
                  />
                  {errors.nome && (
                    <p className="text-xs text-red-600">{errors.nome}</p>
                  )}
                </div>

                {/* E-mail */}
                <div className="space-y-1.5">
                  {label("E-mail *")}
                  <Input
                    ref={emailRef}
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className={errClass("email")}
                    style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Telefone */}
                <div className="space-y-1.5">
                  {label("Telefone")}
                  <Input
                    value={form.telefone}
                    onChange={(e) => set("telefone", e.target.value)}
                    placeholder="(00) 00000-0000"
                    className={errClass("telefone")}
                    style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
                  />
                  {errors.telefone && (
                    <p className="text-xs text-red-600">{errors.telefone}</p>
                  )}
                </div>

                {/* CEP e Estado na mesma linha */}
                <div className="flex gap-3">
                  {/* CEP */}
                  <div className="space-y-1.5 flex-1">
                    {label("CEP *")}
                    <Input
                      value={form.cep}
                      onChange={(e) => set("cep", e.target.value)}
                      onBlur={onCepBlur}
                      placeholder="00000-000"
                      className={errClass("cep")}
                      style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
                    />
                    {cepStatus.error && (
                      <p className="text-xs text-red-600">{cepStatus.error}</p>
                    )}
                  </div>

                  {/* Estado */}
                  <div className="space-y-1.5 w-20">
                    {label("UF")}
                    <Input
                      value={form.estado}
                      readOnly
                      placeholder="UF"
                      className={errClass("estado")}
                      style={{ background: "#eadfce", borderColor: "#eadfce" }}
                    />
                  </div>
                </div>

                {/* Cidade */}
                <div className="space-y-1.5 md:col-span-2">
                  {label("Cidade")}
                  <Input
                    value={form.cidade}
                    readOnly
                    placeholder="Sua cidade"
                    className={errClass("cidade")}
                    style={{ background: "#eadfce", borderColor: "#eadfce" }}
                  />
                </div>

                {/* Logradouro */}
                <div className="space-y-1.5 md:col-span-2">
                  {label("Endereço")}
                  <Input
                    value={form.logradouro}
                    readOnly
                    placeholder="Rua, Avenida, etc"
                    className={errClass("logradouro")}
                    style={{ background: "#eadfce", borderColor: "#eadfce" }}
                  />
                </div>

                {/* Número e Complemento */}
                <div className="space-y-1.5">
                  {label("Número")}
                  <Input
                    value={form.numero}
                    onChange={(e) => set("numero", e.target.value)}
                    placeholder="Ex: 123"
                    className={errClass("numero")}
                    style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
                  />
                </div>

                <div className="space-y-1.5">
                  {label("Complemento")}
                  <Input
                    value={form.complemento}
                    onChange={(e) => set("complemento", e.target.value)}
                    placeholder="Ex: Apto, Sala, etc"
                    className={errClass("complemento")}
                    style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
                  />
                </div>

                {/* Data de nascimento */}
                <div className="space-y-1.5">
                  {label("Data de Nascimento")}
                  <Input
                    type="date"
                    value={form.data_nascimento}
                    onChange={(e) => set("data_nascimento", e.target.value)}
                    style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
                  />
                  {errors.data_nascimento && (
                    <p className="text-xs text-red-600">
                      {errors.data_nascimento}
                    </p>
                  )}
                </div>

                {/* Tipo de conta */}
                <div className="space-y-1.5">
                  {label("Tipo de Conta *")}
                  <select
                    value={form.tipo_usuario}
                    onChange={(e) =>
                      set(
                        "tipo_usuario",
                        e.target.value as Form["tipo_usuario"]
                      )
                    }
                    className={`w-full h-11 rounded-xl border px-3 ${errors.tipo_usuario ? "border-red-500 bg-red-50" : ""}`}
                    style={{
                      background: "#f9f2e8",
                      borderColor: "#eadfce",
                      color: "#6b3f33",
                    }}
                  >
                    <option>Produtor Rural</option>
                    <option>Representante</option>
                  </select>
                  {errors.tipo_usuario && (
                    <p className="text-xs text-red-600">
                      {errors.tipo_usuario}
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div className="space-y-1.5 md:col-span-2">
                  {label("Bio")}
                  <textarea
                    value={form.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    placeholder="Conte um pouco sobre você"
                    className={`min-h-[96px] w-full rounded-xl border p-3 ${errors.bio ? "border-red-500 bg-red-50" : ""}`}
                    style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
                  />
                </div>

                {/* Senhas */}
                <div className="space-y-1.5">
                  {label("Senha *")}
                  <Input
                    type="password"
                    value={form.senha}
                    onChange={(e) => set("senha", e.target.value)}
                    placeholder="Crie sua senha"
                    className={errClass("senha")}
                    style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
                  />
                  {errors.senha && (
                    <p className="text-xs text-red-600">{errors.senha}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  {label("Confirmar Senha *")}
                  <Input
                    type="password"
                    value={form.confirmar}
                    onChange={(e) => set("confirmar", e.target.value)}
                    placeholder="Repita a senha"
                    className={errClass("confirmar")}
                    style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
                  />
                  {errors.confirmar && (
                    <p className="text-xs text-red-600">{errors.confirmar}</p>
                  )}
                </div>

                {/* Ações */}
                <div className="md:col-span-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="login-submit-button"
                  >
                    {loading ? "Enviando..." : "Cadastrar"}
                  </Button>
                  <div className="mt-2 text-center text-sm">
                    Já tem conta?{" "}
                    <Link
                      to="/login"
                      className="font-semibold"
                      style={{ color: "#2d7a31" }}
                    >
                      Entrar
                    </Link>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default SignUpRoute;