import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../packages/backend/convex/_generated/api";
import { ensureAuthenticated, getUserIdFromLocalStorage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import type { Id } from "../../../../../packages/backend/convex/_generated/dataModel";

export const Route = createFileRoute("/groups/join")({
  component: JoinGroupPage,
  beforeLoad: () => ensureAuthenticated(),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      groupId: (search.groupId as string) || "",
    };
  },
});

function JoinGroupPage() {
  const navigate = useNavigate();
  const { groupId: groupIdParam } = Route.useSearch();
  const groupId = groupIdParam as Id<"groups">;
  const userId = getUserIdFromLocalStorage();

  const group = useQuery(api.group.getById, groupId ? { id: groupId } : "skip");
  const currentUser = useQuery(
    api.user.getById,
    userId ? { id: userId as Id<"users"> } : "skip"
  );
  const addParticipant = useMutation(api.group.addParticipant);

  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-join and redirect when group loads
  useEffect(() => {
    if (!group || !userId || !currentUser || isJoining) return;

    // Verificar se o usuário é do tipo "Produtor Rural"
    if (currentUser.tipo_usuario !== "Produtor Rural") {
      setError(
        "Apenas usuários do tipo 'Produtor Rural' podem participar de grupos."
      );
      return;
    }

    const isAlreadyMember = group.participants?.some(
      (p: any) => String(p) === String(userId)
    );

    if (isAlreadyMember) {
      // Already a member, redirect immediately
  navigate({ to: `/groups/${groupId}` } as any);
      return;
    }

    // Auto-join the group
    const joinGroup = async () => {
      setIsJoining(true);
      try {
        await addParticipant({ groupId, userId: userId as Id<"users"> });
        // Redirect to group page after successful join
        setTimeout(() => {
          navigate({ to: `/groups/${groupId}` } as any);
        }, 500);
      } catch (err) {
        console.error("Error joining group:", err);
        setError("Não foi possível entrar no grupo. Tente novamente.");
        setIsJoining(false);
      }
    };

    joinGroup();
  }, [
    group,
    userId,
    currentUser,
    groupId,
    addParticipant,
    navigate,
    isJoining,
  ]);

  // Loading state
  if (!groupId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f3ed] p-4">
        <Card className="bg-white border-none shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Link Inválido
          </div>
          <p className="text-[#7c6a5c] mb-4">
            O link de convite está incompleto ou inválido.
          </p>
          <Button
            onClick={() => navigate({ to: "/" } as any)}
            className="bg-[#ffa726] text-white font-semibold"
          >
            Voltar para o Início
          </Button>
        </Card>
      </div>
    );
  }

  if (group === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f3ed] p-4">
        <Card className="bg-white border-none shadow-lg p-8 max-w-md w-full">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-[#ffa726] border-t-transparent rounded-full animate-spin" />
            <h2 className="text-xl font-semibold text-[#7c6a5c]">
              Carregando grupo...
            </h2>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Card>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f3ed] p-4">
        <Card className="bg-white border-none shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Grupo Não Encontrado
          </div>
          <p className="text-[#7c6a5c] mb-4">
            O grupo que você está tentando acessar não existe ou foi removido.
          </p>
          <Button
            onClick={() => navigate({ to: "/" } as any)}
            className="bg-[#ffa726] text-white font-semibold"
          >
            Voltar para o Início
          </Button>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f3ed] p-4">
        <Card className="bg-white border-none shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Erro</div>
          <p className="text-[#7c6a5c] mb-4">{error}</p>
          <div className="flex gap-2">
            <Button
              onClick={() => window.location.reload()}
              className="flex-1 bg-[#ffa726] text-white font-semibold"
            >
              Tentar Novamente
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate({ to: "/" } as any)}
              className="flex-1"
            >
              Voltar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Joining state
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f3ed] p-4">
      <Card className="bg-white border-none shadow-lg p-8 max-w-md w-full">
        <div className="flex flex-col items-center space-y-6">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-[#7c6a5c]">
              Entrando no Grupo
            </h2>
            <p className="text-[#7c6a5c]">
              Você está sendo adicionado ao grupo
            </p>
          </div>

          {/* Group Info */}
          <div className="w-full bg-[#f5ede3] rounded-lg p-4 space-y-3">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-[#7c6a5c]">
                {group.name}
              </h3>
              {group.description && (
                <p className="text-sm text-[#7c6a5c] mt-1">
                  {group.description}
                </p>
              )}
            </div>

            {group.participantsFull && group.participantsFull.length > 0 && (
              <div className="pt-3 border-t border-[#7c6a5c]/20">
                <p className="text-xs text-[#7c6a5c] mb-2 text-center">
                  {group.participantsFull.length}{" "}
                  {group.participantsFull.length === 1
                    ? "participante"
                    : "participantes"}
                </p>
                <div className="flex justify-center -space-x-2">
                  {group.participantsFull.slice(0, 5).map((p: any) => (
                    <Avatar
                      key={p._id}
                      name={p.name ?? p.email ?? "?"}
                      className="border-2 border-white w-8 h-8 text-sm"
                    />
                  ))}
                  {group.participantsFull.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-[#7c6a5c] text-white text-xs flex items-center justify-center border-2 border-white">
                      +{group.participantsFull.length - 5}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Loading Indicator */}
          <div className="flex items-center gap-2 text-[#7c6a5c]">
            <div className="w-5 h-5 border-2 border-[#ffa726] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Redirecionando...</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
