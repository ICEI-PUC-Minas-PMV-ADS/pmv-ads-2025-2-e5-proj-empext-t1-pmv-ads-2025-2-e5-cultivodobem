import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../packages/backend/convex/_generated/api";
import type { Id } from "../../../../../packages/backend/convex/_generated/dataModel";
import { Card } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { Button } from "../../components/ui/button";
import { Avatar } from "../../components/ui/avatar";
import { useState, useMemo } from "react";
import { Input } from "../../components/ui/input";
import { ensureUserRole } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/groups/$groupId")({
  component: GroupDetails,
  beforeLoad: () => ensureUserRole("Produtor Rural"),
});

function GroupDetails() {
  const navigate = useNavigate();
  const { groupId } = Route.useParams();
  const group = useQuery(api.group.getById, { id: groupId as Id<"groups"> });
  const removeParticipant = useMutation(api.group.removeParticipant);
  const leaveGroup = useMutation(api.group.leaveGroup);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [isLeavingGroup, setIsLeavingGroup] = useState(false);
  const userId = useMemo(() => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user)._id : null;
  }, []);
  const isOwner = useMemo(
    () => userId && group && String(group.createdBy) === String(userId),
    [userId, group]
  );
  const inviteLink = useMemo(
    () =>
      group ? `${window.location.origin}/groups/join?groupId=${group._id}` : "",
    [group]
  );

  async function handleRemoveParticipant(
    participantId: string,
    participantName: string
  ) {
    if (
      !confirm(`Tem certeza que deseja remover ${participantName} do grupo?`)
    ) {
      return;
    }

    setRemovingUserId(participantId);
    try {
      await removeParticipant({
        groupId: groupId as Id<"groups">,
        userId: participantId as Id<"users">,
      });
    } catch (error) {
      console.error("Error removing participant:", error);
      alert("Erro ao remover participante. Tente novamente.");
    } finally {
      setRemovingUserId(null);
    }
  }

  async function handleLeaveGroup() {
    if (!confirm("Tem certeza que deseja sair deste grupo?")) {
      return;
    }

    setIsLeavingGroup(true);
    try {
      await leaveGroup({
        groupId: groupId as Id<"groups">,
        userId: userId as Id<"users">,
      });
    navigate({ to: "/groups" } as any);
    } catch (error: any) {
      console.error("Error leaving group:", error);
      alert(error.message || "Erro ao sair do grupo. Tente novamente.");
    } finally {
      setIsLeavingGroup(false);
    }
  }

  if (group === undefined) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!group) {
    return <div className="p-4">Group not found</div>;
  }

  return (
    <main className="flex flex-col justify-center items-center min-h-screen p-4 pt-16">
      <div className="w-full max-w-md mb-4">
        <button
          onClick={() => navigate({ to: "/groups" } as any)}
          className="flex items-center gap-2 text-[#7c6a5c] hover:text-[#bfa98a] mb-3 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Voltar</span>
        </button>
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-[#7c6a5c]">{group.name}</h1>
          {group.description && (
            <p className="text-[#7c6a5c] mt-1">{group.description}</p>
          )}
        </div>
      </div>
      <div className="bg-[#f8f3ed] p-8 flex flex-col gap-4 rounded-xl shadow w-full max-w-md">
        <div className="flex items-center justify-between mb-2">
          {isOwner && (
            <button
              title="Editar nome"
              className="text-[#7c6a5c] hover:text-[#bfa98a]"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
            </button>
          )}
        </div>
        <Card className="bg-white border-none shadow-none p-4 flex flex-col items-center">
          <div className="text-[#7c6a5c] text-sm mb-1">
            Estoque Combinado Atual
          </div>
          <div className="text-3xl font-bold text-green-700 mb-1">
            {group.stock?.toLocaleString()} sacas
          </div>
        </Card>
        <Card className="bg-white border-none shadow-none p-4">
          <div className="font-semibold text-[#7c6a5c] mb-2">
            Participantes ({group.participantsFull?.length ?? 0})
          </div>
          <div className="flex flex-col gap-2">
            {group.participantsFull?.map((p: any) => (
              <div
                key={p._id}
                className="flex items-center gap-3 bg-[#f5ede3] rounded-lg px-3 py-2"
              >
                <Avatar name={p.name ?? p.email ?? "?"} />
                <span className="font-medium text-[#7c6a5c] flex-1">
                  {p.name ?? p.email}
                  {String(p._id) === String(userId) ? " (Você)" : ""}
                </span>
                {isOwner && String(p._id) !== String(userId) && (
                  <button
                    title="Remover participante"
                    className="text-[#bfa98a] hover:text-red-500 transition-colors disabled:opacity-50"
                    onClick={() =>
                      handleRemoveParticipant(
                        p._id,
                        p.name ?? p.email ?? "participante"
                      )
                    }
                    disabled={removingUserId === p._id}
                  >
                    {removingUserId === p._id ? (
                      <div className="w-5 h-5 border-2 border-[#bfa98a] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
        <Card className="bg-white border-none shadow-none p-4">
          <div className="font-semibold text-green-700 mb-1">
            Link de convite
          </div>
          <div className="text-sm text-[#7c6a5c] mb-2">{inviteLink}</div>
          <Button
            variant="secondary"
            className="w-full bg-[#ffa726] text-white font-semibold hover:bg-[#ff9800] transition-all cursor-pointer shadow-sm hover:shadow-md"
            onClick={async () => {
              await navigator.clipboard.writeText(inviteLink);
              setInviteCopied(true);
              setTimeout(() => setInviteCopied(false), 2000);
            }}
          >
            {inviteCopied ? "✓ Link copiado!" : "📋 Convidar"}
          </Button>
        </Card>
        <div className="mt-3">
          <Button
            onClick={() =>
              navigate({ to: "/groups/$groupId/propose", params: { groupId } } as any)
            }
            className="w-full bg-green-600 text-white font-semibold hover:bg-green-700"
          >
            Propor Compra
          </Button>
        </div>
        {!isOwner && (
          <Button
            variant="outline"
            className="w-full border-2 border-amber-600 text-amber-600 bg-white hover:bg-amber-50 hover:border-amber-700 transition-all font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleLeaveGroup}
            disabled={isLeavingGroup}
          >
            {isLeavingGroup ? (
              <>
                <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mr-2" />
                Saindo...
              </>
            ) : (
              "Sair do Grupo"
            )}
          </Button>
        )}
        {isOwner && (
          <Button
            variant="destructive"
            className="w-full border-2 border-red-500 text-red-600 bg-white hover:bg-red-50 hover:border-red-600 transition-all font-semibold cursor-pointer"
          >
            Encerrar Grupo
          </Button>
        )}
      </div>
    </main>
  );
}
