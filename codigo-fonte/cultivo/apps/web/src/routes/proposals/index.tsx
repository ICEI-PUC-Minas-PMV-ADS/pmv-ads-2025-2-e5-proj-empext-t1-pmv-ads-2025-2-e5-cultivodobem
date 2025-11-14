import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Phone,
  Plus,
  Trash2,
  Mail,
  Check,
  Package2,
  ShoppingCart,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../packages/backend/convex/_generated/api";

export const Route = createFileRoute("/proposals/")({
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
  observations?: string;
  group?: {
    name: string;
    _id: string;
    createdBy: string;
  } | null;
  buyer?: {
    name: string;
    email: string;
  };
  producer?: {
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
      <div className="min-h-screen bg-gradient-to-b from-[#F5F1E8] to-[#E8E0D5] flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#62331B] border-r-transparent mb-4"></div>
          <p className="text-[#62331B] font-semibold text-lg">
            Carregando propostas...
          </p>
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

    // Para produtores: subject com nome do comprador (representante)
    // Para representantes: subject com nome do produtor
    const recipientName = isRepresentante
      ? proposal.producer?.name || "Produtor"
      : proposal.nameBuyer;

    const subject = `Proposta de Compra - ${recipientName}`;
    const totalValue = proposal.valuePerSack * proposal.quantity;

    const emailTo = isRepresentante
      ? proposal.producer?.email || ""
      : proposal.emailBuyer;

    const body = isRepresentante
      ? `Olá ${recipientName},\n\nEnviei uma proposta de compra e gostaria de conversar sobre os detalhes.\n\nDetalhes da proposta:\n- Quantidade: ${proposal.quantity} sacas\n- Valor por saca: R$ ${proposal.valuePerSack.toFixed(2)}\n- Valor total: R$ ${totalValue.toFixed(2)}\n\nAguardo seu retorno.\n\nAtenciosamente.`
      : `Olá ${proposal.nameBuyer},\n\nRecebi sua proposta de compra e gostaria de conversar mais sobre os detalhes.\n\nDetalhes da proposta:\n- Quantidade: ${proposal.quantity} sacas\n- Valor por saca: R$ ${proposal.valuePerSack.toFixed(2)}\n- Valor total: R$ ${totalValue.toFixed(2)}\n\nAguardo seu retorno.\n\nAtenciosamente.`;

    globalThis.location.href = `mailto:${emailTo}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
    <div className="min-h-screen bg-gradient-to-b from-[#F5F1E8] to-[#E8E0D5] mt-16">
      {/* Header */}
      <div className="flex items-center h-16 px-4 bg-gradient-to-r from-[#62331B] to-[#8B5A3C] shadow-lg">
        <span className="flex-1 text-center font-bold text-xl text-white tracking-wide">
          {pageTitle}
        </span>
      </div>

      {/* Botão de criar proposta para Representantes */}
      {isRepresentante && (
        <div className="p-4">
          <Button
            onClick={handleCreateProposal}
            className="w-full bg-gradient-to-r from-[#62331B] to-[#8B5A3C] text-white hover:from-[#4a2415] hover:to-[#62331B] cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Proposta de Compra
          </Button>
        </div>
      )}

      {/* Filtros para Produtor Rural */}
      {!isRepresentante && (
        <div className="bg-white shadow-md px-4 py-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Button
              onClick={() => setFilter("all")}
              variant={filter === "all" ? "default" : "outline"}
              size="default"
              className={`cursor-pointer whitespace-nowrap transition-all duration-200 shadow-sm hover:shadow-md ${
                filter === "all"
                  ? "bg-gradient-to-r from-[#62331B] to-[#8B5A3C] text-white hover:from-[#4a2415] hover:to-[#62331B]"
                  : "text-[#62331B] border-[#62331B] hover:bg-[#62331B]/10"
              }`}
            >
              📋 Todas
              {unviewedCount > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full px-2.5 py-0.5 text-xs font-bold shadow-md">
                  {unviewedCount}
                </span>
              )}
            </Button>

            <Button
              onClick={() => setFilter("direct")}
              variant={filter === "direct" ? "default" : "outline"}
              size="default"
              className={`cursor-pointer whitespace-nowrap transition-all duration-200 shadow-sm hover:shadow-md ${
                filter === "direct"
                  ? "bg-gradient-to-r from-[#62331B] to-[#8B5A3C] text-white hover:from-[#4a2415] hover:to-[#62331B]"
                  : "text-[#62331B] border-[#62331B] hover:bg-[#62331B]/10"
              }`}
            >
              📦 Diretas
              {unviewedDirectCount > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full px-2.5 py-0.5 text-xs font-bold shadow-md">
                  {unviewedDirectCount}
                </span>
              )}
            </Button>

            <Button
              onClick={() => setFilter("group")}
              variant={filter === "group" ? "default" : "outline"}
              size="default"
              className={`cursor-pointer whitespace-nowrap transition-all duration-200 shadow-sm hover:shadow-md ${
                filter === "group"
                  ? "bg-gradient-to-r from-[#62331B] to-[#8B5A3C] text-white hover:from-[#4a2415] hover:to-[#62331B]"
                  : "text-[#62331B] border-[#62331B] hover:bg-[#62331B]/10"
              }`}
            >
              🌾 Do Grupo
              {unviewedGroupCount > 0 && (
                <span className="ml-2 bg-red-500 text-white rounded-full px-2.5 py-0.5 text-xs font-bold shadow-md">
                  {unviewedGroupCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {displayProposals.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
              <div className="mb-6">
                <div className="inline-block p-4 bg-gray-100 rounded-full">
                  <Package2 className="w-16 h-16 text-gray-400" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
                {isRepresentante
                  ? "Nenhuma proposta enviada ainda"
                  : "Nenhuma proposta recebida"}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {isRepresentante
                  ? "Comece a fazer propostas de compra para produtores rurais e acompanhe todas aqui."
                  : "Quando você receber propostas de compra, elas aparecerão aqui."}
              </p>
              {isRepresentante && (
                <Button
                  onClick={handleCreateProposal}
                  className="bg-gradient-to-r from-[#62331B] to-[#8B5A3C] text-white hover:from-[#4a2415] hover:to-[#62331B] cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200"
                  size="lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Primeira Proposta
                </Button>
              )}
            </div>
          </div>
        ) : (
          displayProposals.map((proposal) => {
            const totalValue = proposal.valuePerSack * proposal.quantity;
            const isCreator = isGroupCreator(proposal);
            const canContact =
              !isRepresentante && (!proposal.group || isCreator);
              
            return (
              <Card
                key={proposal._id}
                className={`bg-white shadow-sm hover:shadow-md transition-shadow duration-200 border ${
                  !proposal.viewed && !isRepresentante
                    ? "border-l-4 border-l-red-500 border-t border-r border-b border-gray-200"
                    : "border-gray-200"
                }`}
              >
                <CardContent className="p-5">
                  {/* Header Compacto */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {proposal.group ? (
                          <ShoppingCart className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Package2 className="w-4 h-4 text-gray-500" />
                        )}
                        <h3 className="text-lg font-bold text-gray-900">
                          {isRepresentante
                            ? proposal.producer?.name ||
                              proposal.group?.name ||
                              "Produtor"
                            : proposal.nameBuyer}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500">
                        {proposal.group
                          ? `Grupo: ${proposal.group.name}`
                          : "Proposta Direta"}
                      </p>
                    </div>
                    {!proposal.viewed && !isRepresentante && (
                      <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold">
                        Nova
                      </span>
                    )}
                  </div>

                  {/* Informações Principais - Layout Horizontal Minimalista */}
                  <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Quantidade</p>
                      <p className="text-base font-bold text-gray-900">
                        {proposal.quantity} sacas
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Valor/saca</p>
                      <p className="text-base font-bold text-gray-900">
                        R$ {proposal.valuePerSack.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total</p>
                      <p className="text-base font-bold text-green-600">
                        R$ {totalValue.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Observações */}
                  {proposal.observations && (
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <p className="text-xs text-gray-500 mb-1.5 font-medium">
                        Observações
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {proposal.observations}
                      </p>
                    </div>
                  )}

                  {/* Informações de Contato - Minimalista */}
                  {canContact && (
                    <div className="mb-4 pb-4 border-b border-gray-100 space-y-1.5">
                      <p className="text-xs text-gray-500 font-medium mb-2">
                        Contato
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="text-gray-500">Tel:</span>{" "}
                        {proposal.phoneBuyer}
                      </p>
                      <p className="text-sm text-gray-700 break-all">
                        <span className="text-gray-500">Email:</span>{" "}
                        {proposal.emailBuyer}
                      </p>
                    </div>
                  )}

                  {/* Aviso para membros do grupo */}
                  {!isRepresentante && proposal.group && !isCreator && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                      <p className="text-xs text-amber-800">
                        ℹ️ Apenas o criador do grupo pode visualizar os dados de
                        contato e interagir com esta proposta.
                      </p>
                    </div>
                  )}
                  {/* Aviso para membros do grupo */}
                  {!isRepresentante && proposal.group && !isCreator && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                      <p className="text-xs text-amber-800">
                        ℹ️ Apenas o criador do grupo pode visualizar os dados de
                        contato e interagir com esta proposta.
                      </p>
                    </div>
                  )}

                  {/* Botões de Ação - Minimalista */}
                  {canContact && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleContactPhone(proposal)}
                        className="flex-1 min-w-[120px] bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                        size="sm"
                      >
                        <Phone className="w-4 h-4 mr-1.5" />
                        WhatsApp
                      </Button>

                      <Button
                        onClick={() => handleContactEmail(proposal)}
                        className="flex-1 min-w-[120px] bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                        size="sm"
                      >
                        <Mail className="w-4 h-4 mr-1.5" />
                        Email
                      </Button>

                      {!proposal.viewed && (
                        <Button
                          onClick={() => handleMarkAsViewed(proposal._id)}
                          variant="outline"
                          size="sm"
                          className="text-green-700 border-green-300 hover:bg-green-50 cursor-pointer"
                        >
                          <Check className="w-4 h-4 mr-1.5" />
                          Marcar Lida
                        </Button>
                      )}

                      <Button
                        onClick={() => handleDeleteProposal(proposal._id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" />
                        Excluir
                      </Button>
                    </div>
                  )}

                  {isRepresentante && (
                    <Button
                      onClick={() => handleDeleteProposal(proposal._id)}
                      variant="outline"
                      size="sm"
                      className="w-full text-red-600 border-red-300 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      Excluir Proposta
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
