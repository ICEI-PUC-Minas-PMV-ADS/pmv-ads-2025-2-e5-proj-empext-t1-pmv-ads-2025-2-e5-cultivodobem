import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Plus, Trash2, Mail, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../packages/backend/convex/_generated/api.js";

export const Route = createFileRoute("/proposals")({
  component: ProposalsPage,
});

interface Proposal {
  _id: string;
  nameBuyer: string;
  valuePerSack: number;
  quantity: number;
  phoneBuyer: string;
  emailBuyer: string;
  viewed: boolean;
  group?: {
    name: string;
    _id: string;
    createdBy: string;
  } | null;
  buyer?: {
    name: string;
    email: string;
  };
}

type ProposalFilter = "all" | "direct" | "group";

function ProposalsPage() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [filter, setFilter] = useState<ProposalFilter>("all");

  // Buscar informações do usuário pelo Convex (mesmo padrão de editusers.tsx)
  const stored =
    globalThis.window === undefined ? null : localStorage.getItem("user");
  const currentUserId = stored ? (JSON.parse(stored)?._id ?? null) : null;

  const currentUser = useQuery(
    api.user.getById,
    currentUserId ? { id: currentUserId } : "skip"
  );

  // Buscar propostas do backend com base no tipo de usuário e filtro
  const receivedProposals = useQuery(
    api.proposals.getReceivedProposals,
    currentUserId && userType !== "Representante"
      ? { userId: currentUserId }
      : "skip"
  );

  const directProposals = useQuery(
    api.proposals.getDirectProposals,
    currentUserId && userType !== "Representante" && filter === "direct"
      ? { userId: currentUserId }
      : "skip"
  );

  const groupProposals = useQuery(
    api.proposals.getGroupProposals,
    currentUserId && userType !== "Representante" && filter === "group"
      ? { userId: currentUserId }
      : "skip"
  );

  const sentProposals = useQuery(
    api.proposals.getSentProposals,
    currentUserId && userType === "Representante"
      ? { buyerId: currentUserId }
      : "skip"
  );

  // Mutations
  const deleteProposalMutation = useMutation(api.proposals.deleteProposal);
  const markAsViewedMutation = useMutation(api.proposals.markProposalAsViewed);

  // Carregar dados do localStorage inicialmente
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setUserType(user.tipo_usuario || user.tipo || "");
      setUserId(user._id || "");
    }
  }, []);

  // Atualizar com dados do Convex quando disponível
  useEffect(() => {
    if (currentUser) {
      setUserType(currentUser.tipo_usuario || "");
      setUserId(currentUser._id || "");
    }
  }, [currentUser]);

  const isRepresentante = userType === "Representante";
  const pageTitle = "Minhas Propostas";

  // Determinar quais propostas exibir com base no tipo de usuário e filtro
  let proposals: any[] = [];

  if (isRepresentante) {
    proposals = sentProposals || [];
  } else if (filter === "direct") {
    proposals = directProposals || [];
  } else if (filter === "group") {
    proposals = groupProposals || [];
  } else {
    // "all" - usar receivedProposals que já combina diretas e de grupo
    proposals = receivedProposals || [];
  }

  // Loading enquanto não temos o tipo de usuário ou as propostas ainda não carregaram
  if (!userType || proposals === undefined) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#62331B] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-[#62331B] font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  // Verificar se o usuário é o criador do grupo da proposta
  const isGroupCreator = (proposal: Proposal): boolean => {
    if (!proposal.group) return false;
    return proposal.group.createdBy === userId;
  };

  const handleCreateProposal = () => {
    navigate({ to: "/proposals/create" });
  };

  const handleContactPhone = (proposal: Proposal) => {
    // Marcar como visualizada
    if (!proposal.viewed) {
      markAsViewedMutation({ proposalId: proposal._id as any }).catch(
        (error) => {
          console.error("Erro ao marcar como visualizada:", error);
        }
      );
    }

    const phone = proposal.phoneBuyer.replaceAll(/\D/g, "");
    const totalValue = proposal.valuePerSack * proposal.quantity;
    const message = `Olá! Gostaria de conversar sobre sua proposta de compra de ${proposal.quantity} sacas no valor de R$ ${totalValue.toFixed(2)}.`;
    const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    globalThis.open(whatsappUrl, "_blank");
  };

  const handleContactEmail = (proposal: Proposal) => {
    // Marcar como visualizada
    if (!proposal.viewed) {
      markAsViewedMutation({ proposalId: proposal._id as any }).catch(
        (error) => {
          console.error("Erro ao marcar como visualizada:", error);
        }
      );
    }

    const subject = `Proposta de Compra - ${proposal.group?.name || "Proposta Direta"}`;
    const totalValue = proposal.valuePerSack * proposal.quantity;
    const body = `Olá ${proposal.nameBuyer},\n\nRecebi sua proposta de compra e gostaria de conversar mais sobre os detalhes.\n\nDetalhes da proposta:\n- Quantidade: ${proposal.quantity} sacas\n- Valor por saca: R$ ${proposal.valuePerSack.toFixed(2)}\n- Valor total: R$ ${totalValue.toFixed(2)}\n\nAguardo seu retorno.\n\nAtenciosamente.`;

    globalThis.location.href = `mailto:${proposal.emailBuyer}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleDeleteProposal = async (proposalId: string) => {
    try {
      await deleteProposalMutation({ proposalId: proposalId as any });
      toast.success("Proposta removida");
    } catch (error) {
      toast.error("Erro ao remover proposta");
      console.error(error);
    }
  };

  const handleMarkAsViewed = async (proposalId: string) => {
    try {
      await markAsViewedMutation({ proposalId: proposalId as any });
      toast.success("Proposta marcada como lida");
    } catch (error) {
      toast.error("Erro ao marcar como lida");
      console.error(error);
    }
  };

  // Filtrar propostas baseado no filtro selecionado (apenas para produtores)
  const displayProposals = proposals;

  // Contar propostas não visualizadas (usar receivedProposals para contagem geral)
  const allProposals = receivedProposals || [];
  const unviewedCount = allProposals.filter((p: any) => !p.viewed).length;
  const unviewedDirectCount = allProposals.filter(
    (p: any) => !p.viewed && !p.group
  ).length;
  const unviewedGroupCount = allProposals.filter(
    (p: any) => !p.viewed && !!p.group
  ).length;

  return (
    <div className="min-h-screen bg-[#F5F1E8] mt-16">
      {/* Header */}
      <div className="flex items-center h-14 px-4 bg-white border-b">
        <span className="flex-1 text-center font-semibold text-[#62331B]">
          {pageTitle}
        </span>
      </div>

      {/* Botão de criar proposta para Representantes */}
      {isRepresentante && (
        <div className="p-4">
          <Button
            onClick={handleCreateProposal}
            className="w-full bg-[#62331B] text-white hover:bg-[#4a2415] cursor-pointer"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Proposta de Compra
          </Button>
        </div>
      )}

      {/* Filtros para Produtor Rural */}
      {!isRepresentante && (
        <div className="bg-white border-b px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            <Button
              onClick={() => setFilter("all")}
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              className={`cursor-pointer whitespace-nowrap ${
                filter === "all"
                  ? "bg-[#62331B] text-white hover:bg-[#4a2415]"
                  : "text-[#62331B]"
              }`}
            >
              Todas
              {unviewedCount > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-semibold">
                  {unviewedCount}
                </span>
              )}
            </Button>

            <Button
              onClick={() => setFilter("direct")}
              variant={filter === "direct" ? "default" : "outline"}
              size="sm"
              className={`cursor-pointer whitespace-nowrap ${
                filter === "direct"
                  ? "bg-[#62331B] text-white hover:bg-[#4a2415]"
                  : "text-[#62331B]"
              }`}
            >
              Diretas
              {unviewedDirectCount > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-semibold">
                  {unviewedDirectCount}
                </span>
              )}
            </Button>

            <Button
              onClick={() => setFilter("group")}
              variant={filter === "group" ? "default" : "outline"}
              size="sm"
              className={`cursor-pointer whitespace-nowrap ${
                filter === "group"
                  ? "bg-[#62331B] text-white hover:bg-[#4a2415]"
                  : "text-[#62331B]"
              }`}
            >
              Do Grupo
              {unviewedGroupCount > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs font-semibold">
                  {unviewedGroupCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-4">
        {displayProposals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {isRepresentante
                ? "Você ainda não enviou nenhuma proposta"
                : "Você ainda não recebeu nenhuma proposta"}
            </p>
            {isRepresentante && (
              <Button
                onClick={handleCreateProposal}
                className="mt-4 bg-[#62331B] text-white hover:bg-[#4a2415] cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Nova Proposta
              </Button>
            )}
          </div>
        ) : (
          displayProposals.map((proposal) => {
            return (
              <Card
                key={proposal._id}
                className={`bg-white shadow-sm border-l-4 ${
                  proposal.viewed ? "border-l-orange-500" : "border-l-red-500"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-green-700">
                        {isRepresentante ? (
                          <>
                            Proposta para "
                            {proposal.group?.name || "Produtor Direto"}"
                          </>
                        ) : (
                          <>Proposta de "{proposal.nameBuyer}"</>
                        )}
                      </h3>
                      {!proposal.viewed && !isRepresentante && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                          Nova
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Informações diferentes para Representantes e Produtores */}
                  {isRepresentante ? (
                    <div className="mb-3">
                      {proposal.group ? (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">
                            📦 Enviado para o grupo:
                          </span>{" "}
                          {proposal.group.name}
                        </p>
                      ) : (
                        <p className="text-sm text-blue-600 font-medium">
                          📩 Proposta Direta
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Enviado em: {new Date().toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  ) : (
                    <>
                      {proposal.group ? (
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Grupo:</span>{" "}
                          {proposal.group.name}
                          {!isGroupCreator(proposal) && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              Apenas visualização
                            </span>
                          )}
                        </p>
                      ) : (
                        <p className="text-sm text-blue-600 mb-2 font-medium">
                          📩 Proposta Direta
                        </p>
                      )}
                    </>
                  )}

                  <div className="space-y-1 mb-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Quantidade:</span>{" "}
                      {proposal.quantity} sacas
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Valor por saca:</span> R${" "}
                      {proposal.valuePerSack.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-700 font-semibold">
                      <span className="font-medium">Valor total:</span> R${" "}
                      {(proposal.valuePerSack * proposal.quantity).toFixed(2)}
                    </p>

                    {/* Mostrar informações de contato apenas para produtores (criadores do grupo ou propostas diretas) */}
                    {!isRepresentante &&
                      (!proposal.group || isGroupCreator(proposal)) && (
                        <>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Telefone:</span>{" "}
                            {proposal.phoneBuyer}
                          </p>
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Email:</span>{" "}
                            {proposal.emailBuyer}
                          </p>
                        </>
                      )}

                    {/* Para membros do grupo que não são criadores */}
                    {!isRepresentante &&
                      proposal.group &&
                      !isGroupCreator(proposal) && (
                        <p className="text-sm text-amber-600 italic mt-2">
                          ℹ️ Apenas o criador do grupo pode visualizar os dados
                          de contato
                        </p>
                      )}
                  </div>

                  {!isRepresentante &&
                    (!proposal.group || isGroupCreator(proposal)) && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleContactPhone(proposal)}
                            className="flex-1 bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                            size="sm"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            WhatsApp
                          </Button>

                          <Button
                            onClick={() => handleContactEmail(proposal)}
                            className="flex-1 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                            size="sm"
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Email
                          </Button>
                        </div>

                        <div className="flex gap-2">
                          {!proposal.viewed && (
                            <Button
                              onClick={() => handleMarkAsViewed(proposal._id)}
                              variant="outline"
                              size="sm"
                              className="flex-1 text-green-600 border-green-300 hover:bg-green-50 cursor-pointer"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Marcar como lida
                            </Button>
                          )}

                          <Button
                            onClick={() => handleDeleteProposal(proposal._id)}
                            variant="outline"
                            size="sm"
                            className={`${proposal.viewed ? "w-full" : "flex-1"} text-red-600 border-red-300 hover:bg-red-50 cursor-pointer`}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    )}

                  {isRepresentante && (
                    <Button
                      onClick={() => handleDeleteProposal(proposal._id)}
                      variant="outline"
                      size="sm"
                      className="w-full text-red-600 border-red-300 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
