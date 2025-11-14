import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../packages/backend/convex/_generated/api";
import { ensureUserRole, getUserIdFromLocalStorage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus } from "lucide-react";

export const Route = createFileRoute("/groups/new")({
  component: NewGroupPage,
  beforeLoad: () => ensureUserRole("Produtor Rural"),
});

function NewGroupPage() {
  const navigate = useNavigate();
  const create = useMutation(api.group.create);
  
  const [form, setForm] = useState({ name: "", description: "", stock: 0 });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    const user = getUserIdFromLocalStorage();
    
    if (!user) {
      setError("Usuário não encontrado. Faça login novamente.");
      return;
    }

    if (!form.name.trim()) {
      setError("Por favor, insira um nome para o grupo.");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const groupId = await create({
        userId: user,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        stock: Number(form.stock) || 0,
        participants: [],
        createdBy: user,
      });
      
      navigate({ to: `/groups/${groupId}` });
    } catch (err) {
      console.error("Create failed", err);
      setError("Erro ao criar grupo. Tente novamente.");
      setIsCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f3ed] py-8 px-4 pt-16">
      <div className="max-w-2xl mx-auto space-y-6">
        <button
          onClick={() => navigate({ to: "/groups" })}
          className="flex items-center gap-2 text-[#7c6a5c] hover:text-[#bfa98a] transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Voltar</span>
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Plus className="text-[#ffa726]" size={32} />
            <h1 className="text-3xl font-bold text-[#7c6a5c]">Criar Novo Grupo</h1>
          </div>
          <p className="text-[#7c6a5c]">
            Crie um grupo para colaborar com outros produtores
          </p>
        </div>

        <Card className="bg-white border-none shadow-lg p-8">
          <form className="space-y-6" onSubmit={onCreate}>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#7c6a5c]">
                Nome do Grupo *
              </label>
              <Input
                placeholder="Ex: Produtores da Região Sul"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-[#f5ede3] border-none text-lg"
                disabled={isCreating}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#7c6a5c]">
                Descrição (opcional)
              </label>
              <textarea
                placeholder="Descreva o propósito do grupo..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-[#f5ede3] border-none rounded-md px-3 py-2 text-base min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-[#ffa726]"
                disabled={isCreating}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#7c6a5c]">
                Estoque Inicial (sacas)
              </label>
              <Input
                type="number"
                placeholder="0"
                value={String(form.stock)}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="bg-[#f5ede3] border-none text-lg"
                disabled={isCreating}
                min="0"
              />
              <p className="text-xs text-[#7c6a5c]/70">
                Quantidade combinada de sacas que o grupo possui
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/groups" })}
                className="flex-1 border-[#7c6a5c] text-[#7c6a5c]"
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#ffa726] text-white font-semibold hover:bg-[#ff9800]"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus size={18} className="mr-2" />
                    Criar Grupo
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="bg-white border-none shadow-lg p-6">
          <h3 className="font-semibold text-[#7c6a5c] mb-3">
            💡 Sobre os Grupos
          </h3>
          <ul className="space-y-2 text-sm text-[#7c6a5c]">
            <li className="flex gap-2">
              <span>•</span>
              <span>Você será o proprietário do grupo e poderá gerenciar membros</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Convite outros produtores através do link de convite</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>O estoque pode ser atualizado a qualquer momento</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Colabore e compartilhe informações com sua equipe</span>
            </li>
          </ul>
        </Card>
      </div>
    </main>
  );
}
