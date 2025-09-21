import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Camera, Trash2, ImagePlus } from "lucide-react";
import "@/styles/editusers.css";

// Modal simples controlado (sem libs)
function Modal({
  open, onClose, title, children,
}: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="w-[90%] max-w-sm rounded-2xl border p-4 shadow-xl"
        style={{ background: "var(--edit-bg)", borderColor: "#eadfce", color: "var(--edit-text)" }}
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


export const Route = createFileRoute("/editusers")({
  component: EditUserRoute,
});


function EditUserRoute() {
  const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const currentUserId = stored ? (JSON.parse(stored)?._id ?? null) : null;
  const user = useQuery(api.user.getById, currentUserId ? { id: currentUserId } : "skip");
  const update = useMutation(api.user.update);
  const remove = useMutation(api.user.remove);
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState({
    name: "",
    tipo_usuario: "Produtor Rural",
    data_nascimento: "",
    cep: "",
    telefone: "",
    cidade: "",
    estado: "",
    bio: "",
    foto_url: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? "",
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

  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  function onPickPhoto(ev: React.ChangeEvent<HTMLInputElement>) {
  const f = ev.target.files?.[0];
  if (!f) return;
  const url = URL.createObjectURL(f);
  setForm((prev) => ({ ...prev, foto_url: url }));
  }


  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUserId) return;

    await update({
      id: currentUserId,
      name: form.name || undefined,
      tipo_usuario: form.tipo_usuario || undefined,
      data_nascimento: form.data_nascimento || undefined,
      cep: form.cep || undefined,
      telefone: form.telefone || undefined,
      cidade: form.cidade || undefined,
      estado: form.estado || undefined,
      bio: form.bio || undefined,
      foto_url: form.foto_url,
    });

    // Atualiza sessão (header)
    const saved = JSON.parse(localStorage.getItem("user") || "null");
    if (saved) {
      // const next = {
      //   ...saved,
      //   name: form.name,
      //   foto_url: form.foto_url || saved.foto_url,
      // };
      const next: any = { ...saved, name: form.name };
      // se veio "", limpa; se veio uma URL, atualiza; se ficar undefined, mantém
      if (form.foto_url !== undefined) next.foto_url = form.foto_url;
      localStorage.setItem("user", JSON.stringify(next));
      window.dispatchEvent(new Event("auth-changed"));
    }

    toast.success("Perfil atualizado com sucesso!");
  }


  if (user === undefined) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        Carregando…
      </div>
    );
  }

  // Avatar com a inicial do nome
  const initial = (user?.name?.[0] ?? "U").toUpperCase();

  return (
    <div className="edit-container px-4">
      <Card className="edit-card relative">
        {/* Close (X) */}
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
        <div className="relative mx-auto mb-4 mt-1 flex h-24 w-24 items-center justify-center rounded-full edit-avatar overflow-hidden">
          {!form.foto_url && (
            <span className="text-4xl font-extrabold">{initial}</span>
          )}
          {form.foto_url && (
            <img
              src={form.foto_url}
              alt="Foto do perfil"
              className="absolute inset-0 h-full w-full rounded-full object-cover"
            />
          )}

          {/* Botão da câmera (agora funcional) */}
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

        {/* Modal de opções da foto */}
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
            <Button variant="secondary" onClick={() => setPhotoModalOpen(false)}>Cancelar</Button>
          </div>
        </Modal>


          <form onSubmit={onSave} className="space-y-3">
            {/* NOME */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold" style={{ color: "#6b3f33" }}>
                Nome Completo
              </label>
              <Input
                placeholder="Seu nome"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="edit-input"
              />
            </div>
            
            {/* EMAIL */}
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
            
            {/* DATA DE NASCIMENTO E CEP*/}
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

            {/* Estado e Cidade */}
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

            {/* TIPO DE CONTA */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold" style={{ color: "#6b3f33" }}>
                Tipo de Conta
              </label>
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

                        {/* AÇÕES */}
            <Button
              type="submit"
              className="edit-button"
            >
              Salvar Alterações
            </Button>

            <div className="mt-2">
            <Button
              type="button"
              className="w-full rounded-xl font-semibold btn-danger-outline"
              onClick={async () => {
                if (!currentUserId) return;
                const ok = window.confirm("Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.");
                if (!ok) return;
                await remove({ id: currentUserId });
                localStorage.removeItem("user");
                window.dispatchEvent(new Event("auth-changed"));
                toast.success("Conta excluída com sucesso.");
                nav({ to: "/login" });
              }}
            >
              <Trash2 size={18} className="mr-2" />
              Excluir conta
            </Button>
          </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
