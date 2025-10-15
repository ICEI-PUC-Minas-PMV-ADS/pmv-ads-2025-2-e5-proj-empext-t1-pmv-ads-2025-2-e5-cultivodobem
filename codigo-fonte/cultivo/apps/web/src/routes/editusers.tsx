import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api.js";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, Trash2, ImagePlus } from "lucide-react";
import "@/styles/editusers.css";
import { Label } from "../components/ui/label";

/** Modal simples controlado (sem lib externa) */
function Modal({
  open, onClose, title, children,
}: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[90%] max-w-sm rounded-2xl border p-4 shadow-xl"
        style={{ background: "var(--edit-bg)", borderColor: "#eadfce", color: "var(--edit-text)" }}
        role="dialog" aria-modal="true" aria-label={title}
      >
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-semibold">{title}</h3>
          <button className="edit-close" onClick={onClose} aria-label="Fechar">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/editusers")({ component: EditUserRoute });

function EditUserRoute() {
  // ----- infra / hooks -------------------------------------------------------
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement | null>(null);

  // usuário logado salvo no localStorage (id para buscar no Convex)
  const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUserId = stored ? (JSON.parse(stored)?._id ?? null) : null;

  // queries/mutations do Convex
  const user   = useQuery(api.user.getById, currentUserId ? { id: currentUserId } : "skip");
  const update = useMutation(api.user.update);
  const remove = useMutation(api.user.remove);

  // ----- estado do formulário ------------------------------------------------
  const [form, setForm] = useState({
    name: "",
    email: "",
    tipo_usuario: "Produtor Rural",
    data_nascimento: "",
    cep: "",
    telefone: "",
    cidade: "",
    estado: "",
    bio: "",
    foto_url: "", 
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // carrega dados do usuário quando a query retornar
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? "",
        email: user.email ?? "",
        tipo_usuario: user.tipo_usuario ?? "Produtor Rural",
        data_nascimento: user.data_nascimento ?? "",
        cep: user.cep ?? "",
        telefone: user.telefone ?? "",
        cidade: user.cidade ?? "",
        estado: user.estado ?? "",
        bio: user.bio ?? "",
        foto_url: user.foto_url ?? "",
      });
    }
  }, [user]);

  // ----- estado dos modais ---------------------------------------------------
  const [photoModalOpen,  setPhotoModalOpen]  = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // selecionar nova foto (gera preview local)
  function onPickPhoto(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setForm((prev) => ({ ...prev, foto_url: url }));
  }

  // salvar alterações
  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUserId) return;

    try {
      // Validação da senha se estiver sendo alterada
      if (passwordForm.newPassword || passwordForm.confirmPassword || passwordForm.currentPassword) {
        if (!passwordForm.currentPassword) {
          toast.error("Digite sua senha atual para alterá-la");
          return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          toast.error("As senhas não conferem");
          return;
        }
        if (passwordForm.newPassword.length < 6) {
          toast.error("A nova senha deve ter pelo menos 6 caracteres");
          return;
        }
      }

      // Só envia senha_hash e senha_atual se estiver alterando a senha
      // Prepara os dados para atualização
      const updateData: any = {
        id: currentUserId,
        name: form.name || undefined,
        email: form.email || undefined,
        tipo_usuario: form.tipo_usuario || undefined,
        data_nascimento: form.data_nascimento || undefined,
        cep: form.cep || undefined,
        telefone: form.telefone || undefined,
        cidade: form.cidade || undefined,
        estado: form.estado || undefined,
        bio: form.bio || undefined,
        foto_url: form.foto_url,
      };

      // Se estiver alterando senha, inclui os campos de senha
      if (passwordForm.newPassword || passwordForm.currentPassword) {
        updateData.senha_hash = passwordForm.newPassword ? btoa(passwordForm.newPassword) : undefined;
        updateData.senha_atual = passwordForm.currentPassword ? btoa(passwordForm.currentPassword) : undefined;
      }

      await update(updateData);

      // atualiza sessão (header) — preserva outros campos
      const saved = JSON.parse(localStorage.getItem("user") || "null");
      if (saved) {
        const next: any = { ...saved, name: form.name, email: form.email };
        if (form.foto_url !== undefined) next.foto_url = form.foto_url;
        localStorage.setItem("user", JSON.stringify(next));
        window.dispatchEvent(new Event("auth-changed"));
      }

      // Limpa o formulário de senha
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar perfil");
    }
  }

  if (user === undefined) {
    return <div className="flex h-[60vh] items-center justify-center">Carregando…</div>;
  }

  // inicial do nome (mostrada quando não há foto)
  const initial = (user?.name?.[0] ?? "U").toUpperCase();

  // ----- UI ------------------------------------------------------------------
  return (
    <div className="edit-container px-4">
      <Card className="edit-card relative">
        {/* Fechar */}
        <button
          type="button"
          onClick={() => nav({ to: "/login" })}
          className="edit-close absolute left-3 top-3"
          aria-label="Fechar"
          title="Fechar"
        >
          ×
        </button>

        <CardContent>
          {/* Avatar */}
          <div className="relative mx-auto mb-4 mt-1 flex h-24 w-24 items-center justify-center rounded-full edit-avatar">
            {!form.foto_url && <span className="text-4xl font-extrabold">{initial}</span>}
            {form.foto_url && (
              <img
                src={form.foto_url}
                alt="Foto do perfil"
                className="absolute inset-0 h-full w-full rounded-full object-cover"
              />
            )}

            {/* Camerazinha (abre o modal de opções) */}
            <button
              type="button"
              onClick={() => setPhotoModalOpen(true)}
              className="edit-avatar-btn"
              title="Alterar foto" aria-label="Alterar foto"
            >
              <Camera size={16}/>
            </button>

            {/* input de arquivo oculto */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickPhoto}
            />
          </div>

          {/* Modal da Foto */}
          <Modal open={photoModalOpen} onClose={() => setPhotoModalOpen(false)} title="Foto de perfil">
            <p className="mb-2 opacity-80">O que você deseja fazer?</p>

            <div className="grid gap-2">
              <Button
                onClick={() => { setPhotoModalOpen(false); fileRef.current?.click(); }}
                className="w-full font-semibold"
              >
                <ImagePlus size={18} className="mr-2" /> Adicionar/Alterar foto
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  setForm((p) => ({ ...p, foto_url: "" })); // limpa preview
                  if (fileRef.current) fileRef.current.value = ""; // reseta input
                  setPhotoModalOpen(false);
                }}
                className="w-full font-semibold"
              >
                <Trash2 size={18} className="mr-2" /> Remover foto
              </Button>
            </div>

            <div className="mt-3 text-right">
              <Button variant="secondary" onClick={() => setPhotoModalOpen(false)}>Cancelar</Button>
            </div>
          </Modal>

          {/* Formulário */}
          <form onSubmit={onSave} className="space-y-3">
            {/* Nome */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold" style={{ color: "#6b3f33" }}>Nome Completo</label>
              <Input
                placeholder="Seu nome"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="edit-input"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="edit-input"
              />
            </div>

            {/* Senha atual */}
            <div className="space-y-1.5">
              <Label>Senha atual</Label>
              <Input
                type="password"
                placeholder="Digite sua senha atual"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="edit-input"
              />
            </div>

            {/* Nova senha */}
            <div className="space-y-1.5">
              <Label>Nova senha</Label>
              <Input
                type="password"
                placeholder="Digite a nova senha"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="edit-input"
              />
            </div>

            {/* Confirmar nova senha */}
            <div className="space-y-1.5">
              <Label>Confirmar nova senha</Label>
              <Input
                type="password"
                placeholder="Confirme a nova senha"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="edit-input"
              />
            </div>

            {/* Data de nascimento & CEP */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: "#6b3f33" }}>Data de Nascimento</label>
                <Input
                  type="date"
                  value={form.data_nascimento}
                  onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })}
                  style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: "#6b3f33" }}>CEP</label>
                <Input
                  placeholder="00000-000"
                  value={form.cep}
                  onChange={(e) => setForm({ ...form, cep: e.target.value })}
                  className="h-12 rounded-xl border"
                  style={{ background: "#f9f2e8", borderColor: "#eadfce" }}
                />
              </div>
            </div>

            {/* Telefone */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Telefone</label>
              <Input
                placeholder="(00) 00000-0000"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                className="edit-input"
              />
            </div>

            {/* Estado & Cidade */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Estado</label>
                <Input
                  placeholder="UF"
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value.toUpperCase() })}
                  className="edit-input"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Cidade</label>
                <Input
                  placeholder="Sua cidade"
                  value={form.cidade}
                  onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                  className="edit-input"
                />
              </div>
            </div>

            {/* Tipo de conta */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold" style={{ color: "#6b3f33" }}>Tipo de Conta</label>
              <select
                className="edit-select"
                value={form.tipo_usuario}
                onChange={(e) => setForm({ ...form, tipo_usuario: e.target.value as any })}
              >
                <option>Produtor Rural</option>
                <option>Representante</option>
              </select>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Bio</label>
              <textarea
                className="w-full min-h-[96px] rounded-xl border p-3"
                style={{ background: "var(--login-input-bg)", borderColor: "var(--login-input-border)", color: "var(--login-text-primary)" }}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Conte um pouco sobre você"
              />
            </div>

            {/* Ações */}
            <Button type="submit" className="edit-button">Salvar Alterações</Button>

            {/* Excluir conta — abre modal de confirmação */}
            <div className="mt-2">
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

      {/* Modal de confirmação — Excluir conta */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Excluir conta">
        <p className="mb-3">Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.</p>

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

    </div>
  );
}
