import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, DollarSign, Package, Send, User } from "lucide-react";
import { toast } from "sonner";

interface ProposalFormData {
  produtor: string;
  produto: string;
  quantidade: string;
  preco: string;
  dataEntrega: string;
  condicoesPagamento: string;
  observacoes: string;
}

export function ProposalForm() {
  const [formData, setFormData] = useState<ProposalFormData>({
    produtor: "",
    produto: "Feijão Carioca",
    quantidade: "",
    preco: "",
    dataEntrega: "",
    condicoesPagamento: "À vista",
    observacoes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof ProposalFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (
      !formData.produtor ||
      !formData.quantidade ||
      !formData.preco ||
      !formData.dataEntrega
    ) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simular envio da proposta
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Proposta enviada com sucesso!");

      // Limpar formulário
      setFormData({
        produtor: "",
        produto: "Feijão Carioca",
        quantidade: "",
        preco: "",
        dataEntrega: "",
        condicoesPagamento: "À vista",
        observacoes: "",
      });
    } catch (error) {
      console.error("Erro ao enviar proposta:", error);
      toast.error("Erro ao enviar proposta. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Send className="w-6 h-6 text-green-600" />
          Nova Proposta Comercial
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-400">
          Envie uma proposta de compra para produtores rurais
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Produtor */}
          <div className="space-y-2">
            <Label htmlFor="produtor" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Produtor Rural *
            </Label>
            <Input
              id="produtor"
              type="text"
              placeholder="Nome do produtor ou fazenda"
              value={formData.produtor}
              onChange={(e) => handleInputChange("produtor", e.target.value)}
              required
            />
          </div>
          {/* Produto */}
          <div className="space-y-2">
            <Label htmlFor="produto" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Produto
            </Label>
            <select
              id="produto"
              name="produto"
              value={formData.produto}
              onChange={(e) => handleInputChange("produto", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Selecione o produto</option>
              <option value="Feijão Carioca">Feijão Carioca</option>
              <option value="Feijão Preto">Feijão Preto</option>
              <option value="Feijão Fradinho">Feijão Fradinho</option>
              <option value="Milho">Milho</option>
              <option value="Soja">Soja</option>
              <option value="Outro">Outro</option>
            </select>
          </div>{" "}
          {/* Quantidade e Preço */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade (kg) *</Label>
              <Input
                id="quantidade"
                type="number"
                placeholder="Ex: 1000"
                value={formData.quantidade}
                onChange={(e) =>
                  handleInputChange("quantidade", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preco" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Preço por kg (R$) *
              </Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                placeholder="Ex: 8.50"
                value={formData.preco}
                onChange={(e) => handleInputChange("preco", e.target.value)}
                required
              />
            </div>
          </div>
          {/* Data de Entrega */}
          <div className="space-y-2">
            <Label htmlFor="dataEntrega" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Data de Entrega Desejada *
            </Label>
            <Input
              id="dataEntrega"
              type="date"
              value={formData.dataEntrega}
              onChange={(e) => handleInputChange("dataEntrega", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
          {/* Condições de Pagamento */}
          <div className="space-y-2">
            <Label
              htmlFor="condicoesPagamento"
              className="flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Condições de Pagamento
            </Label>
            <select
              id="condicoesPagamento"
              name="condicoesPagamento"
              value={formData.condicoesPagamento}
              onChange={(e) =>
                handleInputChange("condicoesPagamento", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Selecione as condições</option>
              <option value="À vista">À vista</option>
              <option value="30 dias">30 dias</option>
              <option value="45 dias">45 dias</option>
              <option value="60 dias">60 dias</option>
              <option value="A combinar">A combinar</option>
            </select>
          </div>
          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações Adicionais</Label>
            <textarea
              id="observacoes"
              placeholder="Informações adicionais sobre a proposta, requisitos de qualidade, local de retirada, etc."
              value={formData.observacoes}
              onChange={(e) => handleInputChange("observacoes", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>
          {/* Resumo */}
          {formData.quantidade && formData.preco && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                Resumo da Proposta
              </h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm dark:bg-gray-800 dark:text-gray-200">
                  {formData.produto}: {formData.quantidade} kg
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm dark:bg-gray-800 dark:text-gray-200">
                  Valor Total: R${" "}
                  {(
                    Number.parseFloat(formData.quantidade) *
                    Number.parseFloat(formData.preco)
                  ).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm dark:bg-gray-800 dark:text-gray-200">
                  {formData.condicoesPagamento}
                </span>
              </div>
            </div>
          )}
          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Proposta
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFormData({
                  produtor: "",
                  produto: "Feijão Carioca",
                  quantidade: "",
                  preco: "",
                  dataEntrega: "",
                  condicoesPagamento: "À vista",
                  observacoes: "",
                })
              }
              disabled={isSubmitting}
            >
              Limpar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
