import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/not-found")({
  component: NotFoundPage,
});

function NotFoundPage() {
  const navigate = useNavigate();
  const path = typeof window !== "undefined" ? window.location.pathname + window.location.search + window.location.hash : "/";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f3ed] p-4">
      <Card className="bg-white border-none shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-[#7c6a5c] mb-2">404 — Página não encontrada</h1>
        <p className="text-[#7c6a5c] mb-4">O caminho <strong>{path}</strong> não foi encontrado nesta aplicação.</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={() => navigate({ to: "/" } as any)} className="bg-[#ffa726] text-white font-semibold">Ir para Início</Button>
          <Button variant="secondary" onClick={() => window.location.reload()} >Recarregar</Button>
        </div>
      </Card>
    </div>
  );
}
 
