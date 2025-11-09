import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import "@/styles/groups.css";
import { api } from "../../../../../packages/backend/convex/_generated/api";
import { ensureUserRole, getUserIdFromLocalStorage } from "@/lib/utils";

export const Route = createFileRoute("/groups/")({
  component: RouteComponent,
  beforeLoad: () => ensureUserRole("Produtor Rural"),
});

function RouteComponent() {
  const groups = useQuery(api.group.list);
  const create = useMutation(api.group.create);
  const update = useMutation(api.group.update);
  const remove = useMutation(api.group.remove);
  const addParticipant = useMutation(api.group.addParticipant);
  const removeParticipant = useMutation(api.group.removeParticipant);

  const [form, setForm] = useState({ name: "", description: "", stock: 0 });
  const [editing, setEditing] = useState(false);
  const [editGroup, setEditGroup] = useState<any | null>(null);

  useEffect(() => {
    if (typeof form.stock !== "number") setForm((f) => ({ ...f, stock: 0 }));
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const user = getUserIdFromLocalStorage();
    if (!user) {
      alert("Usuário não encontrado. Faça login novamente.");
      return;
    }
    try {
      const id = await create({
        userId: user,
        name: form.name || "Sem nome",
        description: form.description || undefined,
        stock: Number(form.stock) || 0,
        participants: [],
        createdBy: user,
      });
      setForm({ name: "", description: "", stock: 0 });
    } catch (err) {
      console.error("Create failed", err);
    }
  }

  async function onDelete(id: any) {
    if (!confirm("Excluir grupo?")) return;
    await remove({ id });
  }

  return (
    <div className="screen flex flex-col mx-auto px-4 py-6">
      <section className="mb-6 rounded-lg border p-4">
        <h2 className="mb-2 font-medium">Criar novo grupo</h2>
        <form className=" gap-2" onSubmit={onCreate}>
          <Input
            placeholder="Nome do grupo"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input
            placeholder="Descrição (opcional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <Input
            type="number"
            placeholder="Estoque inicial"
            value={String(form.stock)}
            onChange={(e) =>
              setForm({ ...form, stock: Number(e.target.value) })
            }
          />

          <div className="flex items-center gap-2">
            <Button type="submit">Criar</Button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="mb-3 font-medium">Lista de grupos</h2>
        {!groups && <div>Carregando...</div>}
        {groups && groups.length === 0 && <div>Nenhum grupo encontrado.</div>}
        <ul className="groups-list">
          {groups?.map((g: any) => (
            <li key={g._id} className="group-item">
              <div className="flex justify-between items-start">
                <Link
                  to="/groups/$groupId"
                  params={{ groupId: g._id }}
                  className="flex-1 block hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <div className="group-name">{g.name}</div>
                    <div className="group-desc">{g.description}</div>
                    <div className="group-stock">Estoque: {g.stock}</div>
                    {g.participantsFull && g.participantsFull.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm font-semibold">
                          Participantes:
                        </div>
                        <ul className="ml-2">
                          {g.participantsFull.map((p: any) => (
                            <li key={p._id} className="text-sm">
                              {p.name ?? p.email} ({p._id})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="group-actions">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setEditGroup(g);
                      setEditing(true);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(g._id);
                    }}
                  >
                    Excluir
                  </button>
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      const url = `${window.location.origin}/groups/join?groupId=${g._id}`;
                      try {
                        await navigator.clipboard.writeText(url);
                        alert(
                          "Link copiado para a área de transferência:\n" + url
                        );
                      } catch (e) {
                        prompt("Copie o link abaixo:", url);
                      }
                    }}
                  >
                    Compartilhar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Edit dialog */}
      <Dialog
        open={editing}
        onClose={() => {
          setEditing(false);
          setEditGroup(null);
        }}
        title="Editar Grupo"
      >
        {editGroup && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await update({
                  id: editGroup._id,
                  name: editGroup.name || undefined,
                  description: editGroup.description || undefined,
                  stock: editGroup.stock ?? undefined,
                  participants: editGroup.participants ?? undefined,
                });
                setEditing(false);
                setEditGroup(null);
              } catch (err) {
                console.error("Update failed", err);
              }
            }}
            className="grid gap-2"
          >
            <Input
              value={editGroup.name}
              onChange={(e) =>
                setEditGroup((g: any) => ({ ...g, name: e.target.value }))
              }
            />
            <Input
              value={editGroup.description}
              onChange={(e) =>
                setEditGroup((g: any) => ({
                  ...g,
                  description: e.target.value,
                }))
              }
            />
            <Input
              type="number"
              value={String(editGroup.stock)}
              onChange={(e) =>
                setEditGroup((g: any) => ({
                  ...g,
                  stock: Number(e.target.value),
                }))
              }
            />
            {(editGroup.participantsFull ?? []).map((p: any) => (
              <div className="space-y-2">
                {}
                <div className="text-sm font-medium">Participantes</div>
                <ul className="ml-2">
                  <li
                    key={p._id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-sm">
                      {p.name ?? p.email} ({p._id})
                    </span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        await removeParticipant({
                          groupId: editGroup._id,
                          userId: p._id,
                        });
                        const refreshed =
                          groups?.find((gg: any) => gg._id === editGroup._id) ??
                          null;
                        setEditGroup(refreshed);
                      }}
                    >
                      Remover
                    </Button>
                  </li>
                </ul>
              </div>
            ))}
            <div className="flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditing(false);
                  setEditGroup(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
