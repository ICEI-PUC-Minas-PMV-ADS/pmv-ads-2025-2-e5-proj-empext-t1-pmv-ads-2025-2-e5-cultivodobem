import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Phone, Calendar, Users, User, Package } from "lucide-react";
import { ensureAuthenticated } from "@/lib/utils";

export const Route = createFileRoute("/proposals")({
  component: ProposalsPage,
  beforeLoad: ensureAuthenticated,
});

// Dados mocados
const MOCK_PROPOSALS = [
  {
    _id: "1",
    representativeName: "Carlos Silva",
    representativePhone: "(11) 98765-4321",
    valuePerSack: 388.0,
    quantity: 120,
    totalValue: 46560.0,
    status: "pending",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 dias atrás
    isGroupProposal: true,
    groupName: "Grãos Brasil",
    groupId: "group1",
    notes: "Proposta para entrega em 30 dias. Pagamento em 2 parcelas.",
  },
  {
    _id: "2",
    representativeName: "Ana Oliveira",
    representativePhone: "(31) 91234-5678",
    valuePerSack: 385.5,
    quantity: 80,
    totalValue: 30840.0,
    status: "accepted",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 dias atrás
    isGroupProposal: false,
    notes: "Pagamento à vista com 5% de desconto.",
  },
  {
    _id: "3",
    representativeName: "João Mendes",
    representativePhone: "(19) 99876-5432",
    valuePerSack: 390.0,
    quantity: 150,
    totalValue: 58500.0,
    status: "pending",
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 dia atrás
    isGroupProposal: true,
    groupName: "Comercial de Alimentos",
    groupId: "group2",
  },
  {
    _id: "4",
    representativeName: "Maria Santos",
    representativePhone: "(11) 97654-3210",
    valuePerSack: 380.0,
    quantity: 60,
    totalValue: 22800.0,
    status: "rejected",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7, // 7 dias atrás
    isGroupProposal: false,
    notes: "Proposta para entrega imediata.",
  },
  {
    _id: "5",
    representativeName: "Pedro Costa",
    representativePhone: "(21) 98888-7777",
    valuePerSack: 395.0,
    quantity: 200,
    totalValue: 79000.0,
    status: "pending",
    createdAt: Date.now() - 1000 * 60 * 60 * 3, // 3 horas atrás
    isGroupProposal: true,
    groupName: "Grãos Brasil",
    groupId: "group1",
    notes: "Melhor proposta do mês! Pagamento antecipado disponível.",
  },
];

function ProposalsPage() {
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");

  // Filtrar propostas
  const filteredProposals = MOCK_PROPOSALS.filter((proposal) => {
    if (filter === "all") return true;
    return proposal.status === filter;
  });

  // Função para formatar valor em reais
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Função para formatar data
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Função para obter a cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  // Função para obter o texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "accepted":
        return "Aceita";
      case "rejected":
        return "Rejeitada";
      default:
        return status;
    }
  };

  return (
    <div className="screen flex flex-col items-center p-4">
      {/* Header */}
      <div className="w-full max-w-4xl mb-6">
        <h1 className="font-bold text-2xl text-cultivo-primary text-center mb-2">
          Minhas Propostas
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Propostas enviadas
        </p>
      </div>

      {/* Filtros */}
      <div className="w-full max-w-4xl mb-6">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-cultivo-green-dark text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Todas ({MOCK_PROPOSALS.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "pending"
                ? "bg-yellow-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Pendentes ({MOCK_PROPOSALS.filter(p => p.status === "pending").length})
          </button>
          <button
            onClick={() => setFilter("accepted")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "accepted"
                ? "bg-green-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Aceitas ({MOCK_PROPOSALS.filter(p => p.status === "accepted").length})
          </button>
          <button
            onClick={() => setFilter("rejected")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "rejected"
                ? "bg-red-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Rejeitadas ({MOCK_PROPOSALS.filter(p => p.status === "rejected").length})
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredProposals.length === 0 && (
        <Card className="p-8 max-w-md text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
            Nenhuma proposta encontrada
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Não há propostas com o filtro selecionado.
          </p>
        </Card>
      )}

      {/* Lista de Propostas */}
      {filteredProposals.length > 0 && (
        <div className="w-full max-w-4xl space-y-4">
          {filteredProposals.map((proposal) => (
            <Link
              key={proposal._id}
              to="/proposals/$proposalId"
              params={{ proposalId: proposal._id }}
              className="block"
            >
              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                {/* Header com status */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {proposal.isGroupProposal ? (
                      <Users className="w-5 h-5 text-cultivo-green-dark" />
                    ) : (
                      <User className="w-5 h-5 text-cultivo-green-dark" />
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-cultivo-primary">
                        Proposta de {proposal.representativeName}
                      </h3>
                      {proposal.isGroupProposal && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Grupo: {proposal.groupName}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(proposal.status)}`}
                  >
                    {getStatusText(proposal.status)}
                  </span>
                </div>

                {/* Informações principais */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Valor por saca
                    </p>
                    <p className="font-bold text-cultivo-green-dark">
                      {formatCurrency(proposal.valuePerSack)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Quantidade
                    </p>
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {proposal.quantity} sacas
                    </p>
                  </div>
                </div>

                {/* Valor total */}
                <div className="mb-3 p-3 bg-cultivo-background-darker rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Valor Total
                  </p>
                  <p className="font-bold text-xl text-cultivo-secondary">
                    {formatCurrency(proposal.totalValue)}
                  </p>
                </div>

                {/* Footer com contato e data */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{proposal.representativePhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(proposal.createdAt)}</span>
                  </div>
                </div>

                {/* Observações (se houver) */}
                {proposal.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      <span className="font-semibold">Observações:</span>{" "}
                      {proposal.notes}
                    </p>
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}