import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, Trash2, ImagePlus, Lock } from "lucide-react";
import "@/styles/editusers.css";
import { ChangePasswordModal } from "../components/ChangePasswordModal";
import "@/styles/signup.css";

/** Modal simples controlado (sem lib externa) */
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[90%] max-w-sm rounded-2xl border p-4 shadow-xl"
        style={{
          background: "var(--edit-bg)",
          borderColor: "#eadfce",
          color: "var(--edit-text)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-semibold">{title}</h3>
          <button className="edit-close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/editusers")({
  component: EditUserRoute,
});

type Form = {
  name: string;
  email: string;
  tipo_usuario: "Produtor Rural" | "Representante";
  data_nascimento: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  telefone: string;
  cidade: string;
  estado: string;
  bio: string;
  foto_url: string;
};

type Errors = Partial<Record<keyof Form, string>>;

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const withMask = digits.replace(
    /^(\d{0,2})(\d{0,5})(\d{0,4}).*$/,
    (_, g1, g2, g3) => {
      let formatted = "";
      if (g1) formatted += `(${g1}`;
      if (g2) formatted += `) ${g2}`;
      if (g3) formatted += `-${g3}`;
      return formatted;
    }
  );
  return withMask;
}

function normalizeCepMask(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length !== 8) return digits;
  return digits.replace(/(\d{5})(\d{3})/, "$1-$2");
}

function EditUserRoute() {
  // ----- infra / hooks -------------------------------------------------------
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement | null>(null);

  // usuário logado salvo no localStorage (id para buscar no Convex)
  const stored =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUserId = stored ? (JSON.parse(stored)?._id ?? null) : null;

  // queries/mutations do Convex
  const user = useQuery(
    api.user.getById,
    currentUserId ? { id: currentUserId } : "skip"
  );
  const update = useMutation(api.user.update);
  const remove = useMutation(api.user.remove);
  const pushSubscribe = useMutation(api.pushSubscriptions.subscribe);
  const sendNotification = useAction(api.push.sendToUser);
  const listSubscriptions = useQuery(api.pushSubscriptions.list);

  // ----- estado do formulário ------------------------------------------------
  const [form, setForm] = useState<Form>({
    name: "",
    email: "",
    tipo_usuario: "Produtor Rural",
    data_nascimento: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    telefone: "",
    cidade: "",
    estado: "",
    bio: "",
    foto_url: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [topError, setTopError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [cepStatus, setCepStatus] = useState<{
    loading: boolean;
    error: string | null;
  }>({ loading: false, error: null });

  // carrega dados do usuário quando a query retornar
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? "",
        email: (user.email ?? "").toLowerCase(),
        tipo_usuario:
          (user.tipo_usuario as Form["tipo_usuario"]) ?? "Produtor Rural",
        data_nascimento: user.data_nascimento ?? "",
        cep: normalizeCepMask(user.cep ?? ""),
        logradouro: user.logradouro ?? "",
        numero: user.numero ?? "",
        complemento: user.complemento ?? "",
        telefone: formatPhone(user.telefone ?? ""),
        cidade: user.cidade ?? "",
        estado: user.estado ?? "",
        bio: user.bio ?? "",
        foto_url: user.foto_url ?? "",
      });
      setErrors({});
      setTopError(null);
    }
  }, [user]);

  const set = <K extends keyof Form>(k: K, v: string) => {
    let formatted = v;

    switch (k) {
      case "telefone": {
        const digits = v.replace(/\D/g, "");
        if (digits.length > 11) return;
        formatted = formatPhone(v);
        break;
      }
      case "numero": {
        if (!/^\d*$/.test(v)) return;
        break;
      }
      case "name": {
        formatted = v.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");
        break;
      }
      case "email": {
        formatted = v.toLowerCase();
        break;
      }
      case "estado": {
        formatted = v.toUpperCase();
        break;
      }
      case "cep": {
        const digits = v.replace(/\D/g, "");
        if (digits.length > 8) return;
        formatted = digits.replace(/(\d{5})(\d{0,3})/, (_, g1, g2) =>
          g2 ? `${g1}-${g2}` : g1
        );
        break;
      }
    }

    setForm((prev) => ({ ...prev, [k]: formatted }));
  };

  const validators = useMemo(() => {
    const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const cepRe = /^\d{5}-?\d{3}$/;
    const telRe = /^\(\d{2}\)\s\d{5}-\d{4}$/;
    const passwordRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    const nomeRe = /^[A-Za-zÀ-ÖØ-öø-ÿ]+ [A-Za-zÀ-ÖØ-öø-ÿ]+/;
    const numeroRe = /^\d+$/;

    const validate = (f: Form): Errors => {
      const e: Errors = {};

      if (!f.name.trim()) {
        e.name = "Informe seu nome.";
      } else if (!nomeRe.test(f.name.trim())) {
        e.name = "Informe nome e sobrenome.";
      }

      if (!f.email) {
        e.email = "Informe seu e-mail.";
      } else if (!emailRe.test(f.email.trim())) {
        e.email = "E-mail inválido. Use o formato: exemplo@dominio.com";
      }

      if (!f.tipo_usuario) {
        e.tipo_usuario = "Selecione o tipo de conta.";
      }

      if (!cepRe.test(f.cep.trim())) {
        e.cep = "CEP inválido. Ex.: 00000-000";
      }

      if (f.telefone && !telRe.test(f.telefone)) {
        e.telefone = "Formato inválido. Use: (00) 00000-0000";
      }

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

      if (f.numero && !numeroRe.test(f.numero)) {
        e.numero = "Use apenas números.";
      }

      return e;
    };

    return { validate, passwordRe };
  }, []);

  useEffect(() => {
    if (topError) setErrors(validators.validate(form));
  }, [form, topError, validators]);

  // ----- estado dos modais ---------------------------------------------------
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // selecionar nova foto (gera preview local)
  function onPickPhoto(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setForm((prev) => ({ ...prev, foto_url: url }));
  }

  // salvar alterações
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

      setForm((s) => ({
        ...s,
        logradouro: data?.logradouro ?? s.logradouro,
        cidade: data?.localidade ?? s.cidade,
        estado: data?.uf ?? s.estado,
        cep: digits.replace(/(\d{5})(\d{3})/, "$1-$2"),
      }));

      setCepStatus({ loading: false, error: null });
    } catch {
      setCepStatus({ loading: false, error: "Falha ao consultar o CEP." });
    }
  }

  function onCepBlur() {
    const digits = form.cep.replace(/\D/g, "");
    if (digits.length === 8) {
      buscarCEP();
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUserId) return;

    setTopError(null);
    const eMap = validators.validate(form);
    setErrors(eMap);
    if (Object.keys(eMap).length) {
      setTopError("Verifique os campos obrigatórios destacados.");
      return;
    }

    setLoading(true);

    try {
      const cep = form.cep
        .replace(/\D/g, "")
        .replace(/(\d{5})(\d{3})/, "$1-$2");

      const updateData: any = {
        id: currentUserId,
        name: form.name.trim(),
        email: form.email.trim(),
        tipo_usuario: form.tipo_usuario,
        data_nascimento: form.data_nascimento || undefined,
        cep,
        logradouro: form.logradouro || undefined,
        numero: form.numero || undefined,
        complemento: form.complemento || undefined,
        telefone: form.telefone || undefined,
        cidade: form.cidade || undefined,
        estado: form.estado || undefined,
        bio: form.bio || undefined,
        foto_url: form.foto_url || undefined,
      };

      await update(updateData);

      const saved = JSON.parse(localStorage.getItem("user") || "null");
      if (saved) {
        const next: any = {
          ...saved,
          name: updateData.name,
          email: updateData.email,
          foto_url: updateData.foto_url,
        };
        localStorage.setItem("user", JSON.stringify(next));
        window.dispatchEvent(new Event("auth-changed"));
        try {
          // Send a push notification to the current user informing of profile update
          if (currentUserId) {
            const payload = JSON.stringify({
              title: "Perfil atualizado",
              body: "Seu perfil foi atualizado com sucesso.",
              url: "/editusers",
            });
            // call server-side Convex mutation to send notification to this user
            await sendNotification({ userId: currentUserId, payload });
          }
        } catch (e) {
          // don't block user flow on notification errors
          console.warn(
            "Failed to send push notification after profile update",
            e
          );
        }
      }

      toast.success("Perfil atualizado com sucesso!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setTopError(null);
    } catch (error) {
      setTopError(
        error instanceof Error ? error.message : "Erro ao atualizar perfil"
      );
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar perfil"
      );
    } finally {
      setLoading(false);
    }
  }

  if (user === undefined) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        Carregando…
      </div>
    );
  }

  // inicial do nome (mostrada quando não há foto)
  const initial = (user?.name?.[0] ?? "U").toUpperCase();

  const errClass = (k: keyof Form) =>
    `h-11 rounded-xl border ${errors[k] ? "border-red-500 bg-red-50" : ""}`;
  const label = (txt: string) => (
    <label className="text-sm font-semibold" style={{ color: "#6b3f33" }}>
      {txt}
    </label>
  );

  const navBack = () => nav({ to: "/menu" });

  // ----- UI ------------------------------------------------------------------
  return (
    <>
      <div className="fixed inset-0 z-40 signup-backdrop" />

      <div
        className="fixed inset-0 z-50 overflow-y-auto signup-surface"
        onClick={navBack}
      >
        <div className="flex min-h-dvh items-start justify-center p-4 sm:p-6">
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
                  Perfil atualizado!
                </h3>
                <p className="text-sm opacity-80">
                  Alterações salvas com sucesso.
                </p>
              </div>
            </div>
          )}

          <Card
            onClick={(e) => e.stopPropagation()}
            className="relative my-6 w-full max-w-[520px] md:max-w-md rounded-3xl border-0 shadow-[0_40px_120px_rgba(0,0,0,0.20)]"
            style={{ background: "#f6efe4", color: "#6b3f33" }}
          >
            <button
              type="button"
              onClick={navBack}
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
                Editar Perfil
              </CardTitle>
            </CardHeader>

            <CardContent className="px-4 sm:px-6 pb-6">
              {topError && (
                <div className="mb-3 rounded-xl border border-red-400 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {topError}
                </div>
              )}

              {cepStatus.error && (
                <div className="mb-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-700">
                  {cepStatus.error}
                </div>
              )}

              <form
                onSubmit={onSave}
                className="grid grid-cols-1 gap-3 md:grid-cols-2"
              >
                <div className="md:col-span-2 flex items-center justify-center mb-1">
                  <div
                    className="signup-avatar flex h-24 w-24 items-center justify-center rounded-full"
                    style={{ background: "#eadfce", color: "#6b3f33" }}
                  >
                    {!form.foto_url && (
                      <span className="text-4xl font-extrabold">{initial}</span>
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
                      onClick={() => setPhotoModalOpen(true)}
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

                <Modal
                  open={photoModalOpen}
                  onClose={() => setPhotoModalOpen(false)}
                  title="Foto de perfil"
                >
                  <p className="mb-2 opacity-80">O que você deseja fazer?</p>

                  <div className="grid gap-2">
                    <Button
                      onClick={() => {
                        setPhotoModalOpen(false);
                        fileRef.current?.click();
                      }}
                      className="w-full font-semibold"
                    >
                      <ImagePlus size={18} className="mr-2" /> Adicionar/Alterar
                      foto
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() => {
                        setForm((p) => ({ ...p, foto_url: "" }));
                        if (fileRef.current) fileRef.current.value = "";
                        setPhotoModalOpen(false);
                      }}
                      className="w-full font-semibold"
                    >
                      <Trash2 size={18} className="mr-2" /> Remover foto
                    </Button>
                  </div>

                  <div className="mt-3 text-right">
                    <Button
                      variant="secondary"
                      onClick={() => setPhotoModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </Modal>

                <div className="space-y-1.5">
                  {label("Nome Completo *")}
                  <Input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Seu nome e sobrenome"
                    className={errClass("name")}
                    style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  {label("E-mail *")}
                  <Input
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

                <div className="md:col-span-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPasswordModalOpen(true)}
                    className="w-full h-11 rounded-xl border"
                    style={{
                      background: "#f9f2e8",
                      borderColor: "#eadfce",
                      color: "#6b3f33",
                    }}
                  >
                    <Lock size={18} className="mr-2" /> Alterar Senha
                  </Button>
                </div>

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

                {/* CEP e Estado na mesma linha (igual signup) */}
                <div className="flex gap-3">
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
                    {cepStatus.loading && (
                      <p className="text-xs text-amber-600">Buscando CEP...</p>
                    )}
                    {errors.cep && (
                      <p className="text-xs text-red-600">{errors.cep}</p>
                    )}
                  </div>

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

                <div className="space-y-1.5 md:col-span-2">
                  {label("Endereço")}
                  <Input
                    value={form.logradouro}
                    onChange={(e) => set("logradouro", e.target.value)}
                    placeholder="Rua, avenida, etc."
                    className={errClass("logradouro")}
                    style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
                  />
                </div>

                <div className="space-y-1.5">
                  {label("Número")}
                  <Input
                    value={form.numero}
                    onChange={(e) => set("numero", e.target.value)}
                    placeholder="Ex: 123"
                    className={errClass("numero")}
                    style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
                  />
                  {errors.numero && (
                    <p className="text-xs text-red-600">{errors.numero}</p>
                  )}
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

                <div className="space-y-1.5 md:col-span-2">
                  {label("Bio")}
                  <textarea
                    value={form.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    placeholder="Conte um pouco sobre você"
                    className={`min-h-[96px] w-full rounded-xl border p-3 ${errors.bio ? "border-red-500 bg-red-50" : ""}`}
                    style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
                  />
                  {errors.bio && (
                    <p className="text-xs text-red-600">{errors.bio}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Button
                    type="submit"
                    className="login-submit-button"
                    disabled={loading}
                  >
                    {loading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>

                <div className="md:col-span-2">
                  <Button
                    type="button"
                    className="w-full rounded-xl font-semibold btn-danger-outline"
                    onClick={() => setDeleteModalOpen(true)}
                  >
                    <Trash2 size={18} className="mr-2" />
                    Excluir conta
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Excluir conta"
      >
        <p className="mb-3">
          Tem certeza que deseja excluir sua conta? Essa ação não pode ser
          desfeita.
        </p>

        <div className="modal-actions mt-3 flex flex-wrap items-center justify-end gap-2">
          <Button
            variant="secondary"
            className="w-auto px-4 btn-secondary-soft"
            onClick={() => setDeleteModalOpen(false)}
          >
            Cancelar
          </Button>

          <Button
            className="w-auto px-4 btn-danger-solid"
            onClick={async () => {
              if (!currentUserId) return;
              await remove({ id: currentUserId });
              localStorage.removeItem("user");
              window.dispatchEvent(new Event("auth-changed"));
              toast.success("Conta excluída com sucesso.");
              setDeleteModalOpen(false);
              nav({ to: "/login" });
            }}
          >
            <Trash2 size={18} className="mr-2" />
            Excluir
          </Button>
        </div>
      </Modal>

      <ChangePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        userId={currentUserId || ""}
        passwordRe={validators.passwordRe}
      />
    </>
  );
}
