import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Dialog from "@/components/ui/dialog";
import { api } from "../../../../../packages/backend/convex/_generated/api";
import { ensureUserRole, getUserIdFromLocalStorage } from "@/lib/utils";
import { Plus, Users, Crown, Share2, Edit, Trash2 } from "lucide-react";

export const Route = createFileRoute("/groups/")({
  component: RouteComponent,
  beforeLoad: () => ensureUserRole("Produtor Rural"),
});

function RouteComponent() {
  const navigate = useNavigate();
  const groups = useQuery(api.group.list);
  const userId = getUserIdFromLocalStorage();
  const ownedGroups = groups?.filter((g: any) => String(g.createdBy) === String(userId)) ?? [];
  const memberGroups = groups?.filter((g: any) => g.participants?.some((p: any) => String(p) === String(userId)) && String(g.createdBy) !== String(userId)) ?? [];
  const update = useMutation(api.group.update);
  const remove = useMutation(api.group.remove);
  const removeParticipant = useMutation(api.group.removeParticipant);

  const [editing, setEditing] = useState(false);
  const [editGroup, setEditGroup] = useState<any | null>(null);

  async function onDelete(id: any) {
    if (!confirm("Excluir grupo?")) return;
    await remove({ id });
  }

  return (
    <main className="min-h-screen bg-[#f8f3ed] py-8 px-4 pt-16">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#7c6a5c] mb-2">Meus Grupos</h1>
          <p className="text-[#7c6a5c]">Gerencie seus grupos de produção</p>
        </div>

        {/* Create Group Card */}
        <Card className="bg-white border-none shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Plus className="text-[#ffa726]" size={24} />
              <h2 className="text-xl font-semibold text-[#7c6a5c]">Criar Novo Grupo</h2>
            </div>
          </div>
          <p className="text-[#7c6a5c] mb-4">
            Crie um grupo para colaborar com outros produtores rurais
          </p>
          <Button
            onClick={() => navigate({ to: "/groups/new" })}
            className="w-full bg-[#ffa726] text-white font-semibold hover:bg-[#ff9800]"
          >
            <Plus size={18} className="mr-2" />
            Criar Novo Grupo
          </Button>
        </Card>

        {/* Owned Groups */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Crown className="text-[#ffa726]" size={24} />
            <h2 className="text-2xl font-bold text-[#7c6a5c]">Grupos que você é proprietário</h2>
          </div>
          {!groups && (
            <Card className="bg-white border-none shadow-lg p-6 text-center">
              <p className="text-[#7c6a5c]">Carregando...</p>
            </Card>
          )}
          {groups && ownedGroups.length === 0 && (
            <Card className="bg-white border-none shadow-lg p-6 text-center">
              <p className="text-[#7c6a5c]">Você não é proprietário de nenhum grupo.</p>
            </Card>
          )}
          <div className="space-y-4">
            {ownedGroups.map((g: any) => (
              <Card key={g._id} className="bg-white border-none shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start gap-4">
                  <Link
                    to="/groups/$groupId"
                    params={{ groupId: g._id }}
                    className="flex-1"
                  >
                    <h3 className="text-xl font-bold text-[#7c6a5c] mb-1">{g.name}</h3>
                    {g.description && (
                      <p className="text-[#7c6a5c] text-sm mb-2">{g.description}</p>
                    )}
                    <div className="text-green-700 font-semibold mb-3">
                      Estoque: {g.stock?.toLocaleString()} sacas
                    </div>
                    {g.participantsFull && g.participantsFull.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-[#7c6a5c]" />
                        <div className="flex -space-x-2">
                          {g.participantsFull.slice(0, 3).map((p: any) => (
                            <Avatar
                              key={p._id}
                              name={p.name ?? p.email ?? "?"}
                              className="border-2 border-white w-8 h-8 text-xs"
                            />
                          ))}
                          {g.participantsFull.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-[#7c6a5c] text-white text-xs flex items-center justify-center border-2 border-white">
                              +{g.participantsFull.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-[#7c6a5c]">
                          {g.participantsFull.length} {g.participantsFull.length === 1 ? 'membro' : 'membros'}
                        </span>
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        setEditGroup(g);
                        setEditing(true);
                      }}
                      className="text-[#7c6a5c] border-[#7c6a5c]"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async (e) => {
                        e.preventDefault();
                        const url = `${window.location.origin}/groups/join?groupId=${g._id}`;
                        try {
                          await navigator.clipboard.writeText(url);
                          alert("Link copiado!");
                        } catch (e) {
                          prompt("Copie o link:", url);
                        }
                      }}
                      className="text-[#ffa726] border-[#ffa726]"
                    >
                      <Share2 size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        onDelete(g._id);
                      }}
                      className="text-red-600 border-red-600"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Member Groups */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-[#ffa726]" size={24} />
            <h2 className="text-2xl font-bold text-[#7c6a5c]">Grupos que você participa</h2>
          </div>
          {!groups && (
            <Card className="bg-white border-none shadow-lg p-6 text-center">
              <p className="text-[#7c6a5c]">Carregando...</p>
            </Card>
          )}
          {groups && memberGroups.length === 0 && (
            <Card className="bg-white border-none shadow-lg p-6 text-center">
              <p className="text-[#7c6a5c]">Você não participa de nenhum grupo.</p>
            </Card>
          )}
          <div className="space-y-4">
            {memberGroups.map((g: any) => (
              <Card key={g._id} className="bg-white border-none shadow-lg p-6 hover:shadow-xl transition-shadow">
                <Link
                  to="/groups/$groupId"
                  params={{ groupId: g._id }}
                  className="block"
                >
                  <h3 className="text-xl font-bold text-[#7c6a5c] mb-1">{g.name}</h3>
                  {g.description && (
                    <p className="text-[#7c6a5c] text-sm mb-2">{g.description}</p>
                  )}
                  <div className="text-green-700 font-semibold mb-3">
                    Estoque: {g.stock?.toLocaleString()} sacas
                  </div>
                  {g.participantsFull && g.participantsFull.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-[#7c6a5c]" />
                      <div className="flex -space-x-2">
                        {g.participantsFull.slice(0, 3).map((p: any) => (
                          <Avatar
                            key={p._id}
                            name={p.name ?? p.email ?? "?"}
                            className="border-2 border-white w-8 h-8 text-xs"
                          />
                        ))}
                        {g.participantsFull.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-[#7c6a5c] text-white text-xs flex items-center justify-center border-2 border-white">
                            +{g.participantsFull.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-[#7c6a5c]">
                        {g.participantsFull.length} {g.participantsFull.length === 1 ? 'membro' : 'membros'}
                      </span>
                    </div>
                  )}
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog
        open={editing}
        onClose={() => { setEditing(false); setEditGroup(null); }}
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
              onChange={(e) => setEditGroup((g: any) => ({ ...g, name: e.target.value }))}
            />
            <Input
              value={editGroup.description}
              onChange={(e) => setEditGroup((g: any) => ({ ...g, description: e.target.value }))}
            />
            <Input
              type="number"
              value={String(editGroup.stock)}
              onChange={(e) => setEditGroup((g: any) => ({ ...g, stock: Number(e.target.value) }))}
            />
            {(editGroup.participantsFull ?? []).map((p: any) => (
              <div className="space-y-2">
                <div className="text-sm font-medium">Participantes</div>
                <ul className="ml-2">
                  <li key={p._id} className="flex items-center justify-between gap-2">
                    <span className="text-sm">{p.name ?? p.email} ({p._id})</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        await removeParticipant({ groupId: editGroup._id, userId: p._id });
                        const refreshed = groups?.find((gg: any) => gg._id === editGroup._id) ?? null;
                        setEditGroup(refreshed);
                      }}
                    >Remover</Button>
                  </li>
                </ul>
              </div>
            ))}
            <div className="flex justify-end gap-2 mt-2">
              <Button type="button" variant="secondary" onClick={() => { setEditing(false); setEditGroup(null); }}>Cancelar</Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        )}
      </Dialog>
    </main>
  );
}
