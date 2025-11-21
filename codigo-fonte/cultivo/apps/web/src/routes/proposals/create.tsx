import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Package2,
  User,
  MapPin,
  DollarSign,
  ChevronDown,
  Info,
  Eye,
  X,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useConvex } from "convex/react";
import { api } from "../../../../../packages/backend/convex/_generated/api.js";
import type { Id } from "../../../../../packages/backend/convex/_generated/dataModel";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const searchSchema = z.object({
  harvestId: z.string().optional(),
});

export const Route = createFileRoute("/proposals/create")({
  component: CreateProposalPage,
  validateSearch: (search) => searchSchema.parse(search),
});

const proposalSchema = z.object({
  recipientType: z.enum(["producer", "group"], {
    message: "Selecione o tipo de destinatário",
  }),
  valuePerSack: z
    .number({ message: "Informe o valor por saca" })
    .min(0.01, "O valor deve ser maior que zero"),
  quantity: z
    .number({ message: "Informe a quantidade" })
    .min(1, "A quantidade deve ser pelo menos 1"),
  observations: z.string().optional(),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

function CreateProposalPage() {
  const navigate = useNavigate();
  const { harvestId } = Route.useSearch();
  const convex = useConvex();
  const [selectedHarvest, setSelectedHarvest] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [buyerData, setBuyerData] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Buscar informações do comprador (representante logado)
  const stored =
    globalThis.window === undefined ? null : localStorage.getItem("user");
  const currentUserId = stored ? (JSON.parse(stored)?._id ?? null) : null;

  const currentUser = useQuery(
    api.user.getById,
    currentUserId ? { id: currentUserId } : "skip"
  );

  // Buscar todas as colheitas com detalhes
  const harvests = useQuery(api.harvests.getAllHarvestsWithDetails);

  // Buscar todos os grupos
  const groups = useQuery(api.group.list);

  // Mutation para criar proposta
  const createProposalMutation = useMutation(api.proposals.createProposal);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      recipientType: "producer",
      valuePerSack: 0,
      quantity: 1,
      observations: "",
    },
  });

  useEffect(() => {
    if (currentUser) {
      setBuyerData(currentUser);
    }
  }, [currentUser]);

  // Pré-selecionar colheita se harvestId foi passado na URL
  useEffect(() => {
    if (harvestId && harvests) {
      const harvest = harvests.find((h) => h._id === harvestId);
      if (harvest) {
        setSelectedHarvest(harvest);
      }
    }
  }, [harvestId, harvests]);

  // Buscar URL da imagem quando a colheita selecionada mudar
  useEffect(() => {
    const fetchImageUrl = async () => {
      if (selectedHarvest?.analysis?.imageId) {
        try {
          const url = await convex.query(api.upload.getFileUrl, {
            fileId: selectedHarvest.analysis.imageId as Id<"_storage">,
          });
          setImageUrl(url);
        } catch (error) {
          console.error("Erro ao buscar URL da imagem:", error);
          setImageUrl(null);
        }
      } else {
        setImageUrl(null);
      }
    };

    fetchImageUrl();
  }, [selectedHarvest, convex]);

  const valuePerSack = watch("valuePerSack");
  const quantity = watch("quantity");
  const recipientType = watch("recipientType");
  const totalValue = valuePerSack * quantity;

  // Determinar quantidade máxima disponível
  let maxQuantity: number | undefined;
  if (selectedHarvest) {
    maxQuantity = selectedHarvest.quantity;
  } else if (selectedGroup) {
    maxQuantity = selectedGroup.stock;
  }

  if (!harvests || !buyerData || !groups) {
    return (
      <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center mt-16">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#62331B] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-[#62331B] font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    navigate({ to: "/proposals" });
  };

  const onSubmit = async (data: ProposalFormData) => {
    if (data.recipientType === "producer" && !selectedHarvest) {
      toast.error("Selecione uma colheita para enviar a proposta");
      return;
    }

    if (data.recipientType === "group" && !selectedGroup) {
      toast.error("Selecione um grupo para enviar a proposta");
      return;
    }

    try {
      if (data.recipientType === "producer") {
        await createProposalMutation({
          userId: selectedHarvest.userId,
          valuePerSack: data.valuePerSack,
          quantity: data.quantity,
          phoneBuyer: buyerData.telefone || "",
          emailBuyer: buyerData.email,
          nameBuyer: buyerData.name,
          buyerId: currentUserId,
          observations: data.observations,
        });
      } else {
        // Proposta para grupo
        await createProposalMutation({
          groupId: selectedGroup._id,
          valuePerSack: data.valuePerSack,
          quantity: data.quantity,
          phoneBuyer: buyerData.telefone || "",
          emailBuyer: buyerData.email,
          nameBuyer: buyerData.name,
          buyerId: currentUserId,
          observations: data.observations,
        });
      }

      toast.success("Proposta enviada com sucesso!");
      navigate({ to: "/proposals" });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar proposta");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F1E8] to-[#E8E0D5] mt-16">
      {/* Header */}
      <div className="flex items-center h-16 px-4 bg-gradient-to-r from-[#62331B] to-[#8B5A3C] shadow-lg">
        <Button
          onClick={handleBack}
          variant="ghost"
          size="sm"
          className="cursor-pointer text-white hover:bg-white/20"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="flex-1 text-center font-bold text-lg text-white">
          Nova Proposta de Compra
        </span>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Card Principal Compacto */}
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6 space-y-5">
              {/* Seletor de Tipo de Destinatário */}
              <div>
                <div className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Destinatário
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setValue("recipientType", "producer");
                      setSelectedGroup(null);
                    }}
                    className={`cursor-pointer flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      recipientType === "producer"
                        ? "border-[#62331B] bg-[#62331B]/10 text-[#62331B]"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-semibold">Produtor Individual</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setValue("recipientType", "group");
                      setSelectedHarvest(null);
                    }}
                    className={`cursor-pointer flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      recipientType === "group"
                        ? "border-[#62331B] bg-[#62331B]/10 text-[#62331B]"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span className="font-semibold">Grupo</span>
                  </button>
                </div>
                {errors.recipientType && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.recipientType.message}
                  </p>
                )}
              </div>

              {/* Seletor de Colheita Minimalista */}
              {recipientType === "producer" && (
                <div>
                  <label
                    htmlFor="harvestSelect"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Selecione a Colheita
                  </label>

                  {harvests.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
                      <Package2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">
                        Nenhuma colheita disponível
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        id="harvestSelect"
                        value={selectedHarvest?._id || ""}
                        onChange={(e) => {
                          const harvest = harvests.find(
                            (h) => h._id === e.target.value
                          );
                          setSelectedHarvest(harvest || null);
                        }}
                        className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:border-[#62331B] focus:ring-2 focus:ring-[#62331B]/20 cursor-pointer appearance-none transition-all"
                      >
                        <option value="">Escolha uma colheita...</option>
                        {harvests.map((harvest) => {
                          const finalScore =
                            harvest.analysis?.colorimetry?.finalScore;
                          const scoreText = finalScore
                            ? ` | Nota: ${finalScore.toFixed(1)}`
                            : "";
                          return (
                            <option key={harvest._id} value={harvest._id}>
                              {harvest.user?.name || "Produtor"} -{" "}
                              {harvest.quantity} sacas -{" "}
                              {harvest.user?.cidade || "Cidade"}
                              {scoreText}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                    </div>
                  )}

                  {!selectedHarvest && harvests.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Selecione uma colheita para continuar
                    </p>
                  )}
                </div>
              )}

              {/* Seletor de Grupo */}
              {recipientType === "group" && (
                <div>
                  <label
                    htmlFor="groupSelect"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Selecione o Grupo
                  </label>

                  {groups.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Nenhum grupo disponível</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        id="groupSelect"
                        value={selectedGroup?._id || ""}
                        onChange={(e) => {
                          const group = groups.find(
                            (g) => g._id === e.target.value
                          );
                          setSelectedGroup(group || null);
                        }}
                        className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:border-[#62331B] focus:ring-2 focus:ring-[#62331B]/20 cursor-pointer appearance-none transition-all"
                      >
                        <option value="">Escolha um grupo...</option>
                        {groups.map((group) => (
                          <option key={group._id} value={group._id}>
                            {group.name} - {group.stock} sacas -{" "}
                            {group.participantsFull?.length || 0} membros
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                    </div>
                  )}

                  {!selectedGroup && groups.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Selecione um grupo para continuar
                    </p>
                  )}
                </div>
              )}

              {/* Detalhes da Colheita Selecionada */}
              {selectedHarvest && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-5 h-5 text-green-700" />
                      <div>
                        <p className="font-bold text-green-900">
                          {selectedHarvest.user?.name || "Produtor"}
                        </p>
                        {selectedHarvest.user?.cidade &&
                          selectedHarvest.user?.estado && (
                            <div className="flex items-center gap-1 text-xs text-green-700">
                              <MapPin className="w-3 h-3" />
                              <span>
                                {selectedHarvest.user.cidade} -{" "}
                                {selectedHarvest.user.estado}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={() => setShowDetailsModal(true)}
                        variant="outline"
                        size="sm"
                        className="cursor-pointer text-green-700 border-green-300 hover:bg-green-100"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Detalhes
                      </Button>
                      <div className="text-right">
                        <p className="text-xs text-green-700">Disponível</p>
                        <p className="font-bold text-green-900">
                          {selectedHarvest.quantity} sacas
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedHarvest.analysis && (
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-green-200">
                      <div className="text-center">
                        <p className="text-xs text-green-700">Tipo</p>
                        <p className="font-semibold text-sm text-green-900">
                          {selectedHarvest.analysis.classification.summary.type}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-green-700">Defeitos</p>
                        <p className="font-semibold text-sm text-green-900">
                          {selectedHarvest.analysis.classification.summary.defectiveBeansPercentage.toFixed(
                            1
                          )}
                          %
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-green-700">Colorimetria</p>
                        <p className="font-semibold text-sm text-green-900">
                          {selectedHarvest.analysis.colorimetry.classification}
                        </p>
                      </div>
                      <div className="text-center bg-amber-100 rounded-md -m-1 p-1 border border-amber-300">
                        <p className="text-xs text-amber-800 font-bold">
                          ⭐ Nota
                        </p>
                        <p className="font-bold text-lg text-amber-900">
                          {selectedHarvest.analysis.colorimetry.finalScore.toFixed(
                            1
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Detalhes do Grupo Selecionado */}
              {selectedGroup && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-700" />
                      <div>
                        <p className="font-bold text-blue-900">
                          {selectedGroup.name}
                        </p>
                        {selectedGroup.description && (
                          <p className="text-xs text-blue-700 mt-1">
                            {selectedGroup.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-700">Estoque Total</p>
                      <p className="font-bold text-blue-900">
                        {selectedGroup.stock} sacas
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-200">
                    <div className="text-center bg-blue-100 rounded-lg p-2">
                      <p className="text-xs text-blue-700">Membros</p>
                      <p className="font-semibold text-lg text-blue-900">
                        {selectedGroup.participantsFull?.length || 0}
                      </p>
                    </div>
                    <div className="text-center bg-blue-100 rounded-lg p-2">
                      <p className="text-xs text-blue-700">Criado em</p>
                      <p className="font-semibold text-sm text-blue-900">
                        {new Date(selectedGroup.createdAt).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Campos do Formulário */}
              {(selectedHarvest || selectedGroup) && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Valor por Saca */}
                    <div>
                      <label
                        htmlFor="valuePerSack"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Valor por Saca (R$)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="valuePerSack"
                          type="number"
                          step="0.01"
                          min="0.01"
                          {...register("valuePerSack", { valueAsNumber: true })}
                          className="pl-10 h-12 text-lg font-medium border-2 focus:border-[#62331B] focus:ring-2 focus:ring-[#62331B]/20"
                          placeholder="0,00"
                        />
                      </div>
                      {errors.valuePerSack && (
                        <p className="text-red-500 text-xs mt-1 font-medium">
                          {errors.valuePerSack.message}
                        </p>
                      )}
                    </div>

                    {/* Quantidade */}
                    <div>
                      <label
                        htmlFor="quantity"
                        className="block text-sm font-semibold text-gray-700 mb-2"
                      >
                        Quantidade (sacas)
                      </label>
                      <div className="relative">
                        <Package2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          max={maxQuantity}
                          {...register("quantity", { valueAsNumber: true })}
                          className="pl-10 h-12 text-lg font-medium border-2 focus:border-[#62331B] focus:ring-2 focus:ring-[#62331B]/20"
                          placeholder="1"
                        />
                      </div>
                      {errors.quantity && (
                        <p className="text-red-500 text-xs mt-1 font-medium">
                          {errors.quantity.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Valor Total Destacado */}
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 shadow-md text-center">
                    <p className="text-xs text-white/90 font-medium mb-1">
                      VALOR TOTAL DA PROPOSTA
                    </p>
                    <p className="text-3xl font-bold text-white">
                      R${" "}
                      {totalValue.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  {/* Observações */}
                  <div>
                    <label
                      htmlFor="observations"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Observações (opcional)
                    </label>
                    <textarea
                      id="observations"
                      {...register("observations")}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#62331B] focus:ring-2 focus:ring-[#62331B]/20 resize-none"
                      rows={3}
                      placeholder="Adicione informações adicionais sobre sua proposta..."
                    />
                  </div>

                  {/* Informações de Contato Compactas */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-2">
                      📞 Seus dados de contato
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <p className="text-gray-700">
                        <span className="font-medium">Nome:</span>{" "}
                        {buyerData.name}
                      </p>
                      {buyerData.telefone && (
                        <p className="text-gray-700">
                          <span className="font-medium">Tel:</span>{" "}
                          {buyerData.telefone}
                        </p>
                      )}
                      <p className="text-gray-700 col-span-2 break-all">
                        <span className="font-medium">Email:</span>{" "}
                        {buyerData.email}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Botão de Envio */}
          {(selectedHarvest || selectedGroup) && (
            <Button
              type="submit"
              className="w-full mb-24 h-14 bg-gradient-to-r from-[#62331B] to-[#8B5A3C] text-white hover:from-[#4a2415] hover:to-[#62331B] cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 text-lg font-bold"
            >
              Enviar Proposta de Compra
            </Button>
          )}
        </form>

        {/* Modal de Detalhes da Colheita */}
        {showDetailsModal && selectedHarvest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header do Modal */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-bold text-[#62331B]">
                  Detalhes Completos da Colheita
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetailsModal(false)}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Conteúdo do Modal */}
              <div className="space-y-4 p-4">
                {/* Imagem da Amostra de Análise */}
                {imageUrl && (
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg overflow-hidden border-2 border-amber-200">
                    <div className="bg-amber-100 px-4 py-2 border-b border-amber-200">
                      <h3 className="font-bold text-amber-900 flex items-center gap-2">
                        📸 Imagem da Análise de Grãos
                      </h3>
                    </div>
                    <div className="p-2">
                      <img
                        src={imageUrl}
                        alt="Amostra de grãos para análise"
                        className="w-full h-auto max-h-96 object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Informações do Produtor */}
                <Card className="border-2 border-green-200">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Informações do Produtor
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <p>
                        <span className="font-semibold">Nome:</span>{" "}
                        {selectedHarvest.user?.name || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Email:</span>{" "}
                        {selectedHarvest.user?.email || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Telefone:</span>{" "}
                        {selectedHarvest.user?.telefone || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold">Localização:</span>{" "}
                        {selectedHarvest.user?.cidade || "N/A"} -{" "}
                        {selectedHarvest.user?.estado || "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Dados da Colheita */}
                <Card className="border-2 border-blue-200">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <Package2 className="w-5 h-5" />
                      Dados da Colheita
                    </h3>
                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                      <p>
                        <span className="font-semibold">Data:</span>{" "}
                        {new Date(selectedHarvest.date).toLocaleDateString(
                          "pt-BR"
                        )}
                      </p>
                      <p>
                        <span className="font-semibold">Quantidade:</span>{" "}
                        {selectedHarvest.quantity} sacas
                      </p>
                      <p>
                        <span className="font-semibold">Status:</span>{" "}
                        <span className="text-green-600 font-semibold">
                          Disponível
                        </span>
                      </p>
                    </div>
                    {selectedHarvest.observations && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="font-semibold mb-1">Observações:</p>
                        <p className="text-gray-700">
                          {selectedHarvest.observations}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Análise Completa */}
                {selectedHarvest.analysis && (
                  <>
                    {/* Classificação */}
                    <Card className="border-2 border-amber-200">
                      <CardContent className="p-4">
                        <h3 className="font-bold text-amber-900 mb-3">
                          📊 Classificação dos Grãos
                        </h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-amber-50 rounded-lg p-3">
                              <p className="text-xs text-gray-600 mb-1">Tipo</p>
                              <p className="text-2xl font-bold text-amber-900">
                                {
                                  selectedHarvest.analysis.classification
                                    .summary.type
                                }
                              </p>
                            </div>
                            <div className="bg-red-50 rounded-lg p-3">
                              <p className="text-xs text-gray-600 mb-1">
                                Defeitos
                              </p>
                              <p className="text-2xl font-bold text-red-900">
                                {selectedHarvest.analysis.classification.summary.defectiveBeansPercentage.toFixed(
                                  1
                                )}
                                %
                              </p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                              <p className="text-xs text-gray-600 mb-1">
                                Espécie
                              </p>
                              <p className="text-lg font-bold text-green-900">
                                {
                                  selectedHarvest.analysis.classification
                                    .summary.species
                                }
                              </p>
                            </div>
                          </div>

                          {/* Defeitos Graves */}
                          <div>
                            <h4 className="font-semibold text-sm text-red-800 mb-2">
                              Defeitos Graves
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              <div className="bg-red-50 rounded p-2">
                                <p className="text-gray-600">Mofados</p>
                                <p className="font-bold text-red-900">
                                  {
                                    selectedHarvest.analysis.classification
                                      .details.graveDefects.molded
                                  }
                                </p>
                              </div>
                              <div className="bg-red-50 rounded p-2">
                                <p className="text-gray-600">Queimados</p>
                                <p className="font-bold text-red-900">
                                  {
                                    selectedHarvest.analysis.classification
                                      .details.graveDefects.burned
                                  }
                                </p>
                              </div>
                              <div className="bg-red-50 rounded p-2">
                                <p className="text-gray-600">Germinados</p>
                                <p className="font-bold text-red-900">
                                  {
                                    selectedHarvest.analysis.classification
                                      .details.graveDefects.germinated
                                  }
                                </p>
                              </div>
                              <div className="bg-red-50 rounded p-2">
                                <p className="text-gray-600">
                                  Chochos/Atacados
                                </p>
                                <p className="font-bold text-red-900">
                                  {
                                    selectedHarvest.analysis.classification
                                      .details.graveDefects
                                      .chapped_and_attacked_by_caterpillars
                                  }
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Defeitos Leves */}
                          <div>
                            <h4 className="font-semibold text-sm text-orange-800 mb-2">
                              Defeitos Leves
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              <div className="bg-orange-50 rounded p-2">
                                <p className="text-gray-600">Esmagados</p>
                                <p className="font-bold text-orange-900">
                                  {
                                    selectedHarvest.analysis.classification
                                      .details.lightDefects.crushed
                                  }
                                </p>
                              </div>
                              <div className="bg-orange-50 rounded p-2">
                                <p className="text-gray-600">Danificados</p>
                                <p className="font-bold text-orange-900">
                                  {
                                    selectedHarvest.analysis.classification
                                      .details.lightDefects.damaged
                                  }
                                </p>
                              </div>
                              <div className="bg-orange-50 rounded p-2">
                                <p className="text-gray-600">Imaturos</p>
                                <p className="font-bold text-orange-900">
                                  {
                                    selectedHarvest.analysis.classification
                                      .details.lightDefects.immature
                                  }
                                </p>
                              </div>
                              <div className="bg-orange-50 rounded p-2">
                                <p className="text-gray-600">Quebrados</p>
                                <p className="font-bold text-orange-900">
                                  {
                                    selectedHarvest.analysis.classification
                                      .details.lightDefects.broken_or_split
                                  }
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="font-semibold text-sm mb-1">
                              Explicação:
                            </p>
                            <p className="text-gray-700 text-sm">
                              {
                                selectedHarvest.analysis.classification.summary
                                  .explanation
                              }
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Colorimetria */}
                    <Card className="border-2 border-purple-200">
                      <CardContent className="p-4">
                        <h3 className="font-bold text-purple-900 mb-3">
                          🎨 Análise Colorimétrica
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-purple-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-600 mb-1">
                              Média L*
                            </p>
                            <p className="text-xl font-bold text-purple-900">
                              {selectedHarvest.analysis.colorimetry.averageL.toFixed(
                                2
                              )}
                            </p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-600 mb-1">
                              Desvio Padrão
                            </p>
                            <p className="text-xl font-bold text-purple-900">
                              {selectedHarvest.analysis.colorimetry.standardDeviation.toFixed(
                                2
                              )}
                            </p>
                          </div>
                          <div className="bg-purple-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-600 mb-1">
                              Classificação
                            </p>
                            <p className="text-lg font-bold text-purple-900">
                              {
                                selectedHarvest.analysis.colorimetry
                                  .classification
                              }
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-lg p-3 text-center border-2 border-amber-300">
                            <p className="text-xs text-amber-800 font-bold mb-1">
                              ⭐ NOTA FINAL
                            </p>
                            <p className="text-3xl font-bold text-amber-900">
                              {selectedHarvest.analysis.colorimetry.finalScore.toFixed(
                                1
                              )}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
