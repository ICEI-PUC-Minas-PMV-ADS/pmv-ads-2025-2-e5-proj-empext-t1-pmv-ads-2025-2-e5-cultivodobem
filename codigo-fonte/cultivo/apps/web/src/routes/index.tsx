import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanLine, PackagePlus, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="w-full h-screen flex flex-col items-center p-6 pt-18 bg-cultivo-background">
      <h1 className="font-bold text-xl text-cultivo-primary text-center">
        Painel
      </h1>
      <div
        className="flex flex-col gap-2 p-4 rounded-lg bg-white border border-cultivo-background-darker mt-6 w-full md:max-w-[540px]"
        style={{
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <span className="text-cultivo-muted text-center">
          Cotação do feijão (saca 60kg)
        </span>
        <span className="text-cultivo-green-dark text-center text-4xl font-bold">
          R$ 385,00
        </span>
        <span className="text-sm text-cultivo-muted text-center">
          Atualizado hoje às 19:35
        </span>
      </div>

      <div
        className="flex flex-col gap-4 p-4 rounded-lg bg-white border border-cultivo-background-darker mt-6 w-full md:max-w-[540px]"
        style={{
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 className="font-bold text-xl text-cultivo-primary">
          Ações rápidas
        </h2>
        <Link
          to="/harvest"
          className="flex flex-row justify-center items-center gap-2 bg-cultivo-secondary text-cultivo-primary rounded-lg p-2"
        >
          <PackagePlus />
          Registrar Colheita
        </Link>
        <Link
          to="/classifier"
          className="flex flex-row justify-center items-center gap-2 bg-white border border-cultivo-green-dark text-cultivo-green-dark rounded-lg p-2"
        >
          <ScanLine />
          Classificar Amostra
        </Link>
      </div>

      <div
        className="flex flex-col gap-4 p-4 rounded-lg bg-white border border-cultivo-background-darker mt-6 w-full md:max-w-[540px]"
        style={{
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 className="font-bold text-xl text-cultivo-primary">
          Últimas colheitas
        </h2>

        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-col gap-2">
            <span className="font-bold text-cultivo-primary">
              Colheita de 05/09/2025
            </span>
            <span className="text-cultivo-muted">120 sacas</span>
          </div>
          <ChevronRight className="text-cultivo-primary" />
        </div>
        <Link
          to="/harvest"
          className="text-cultivo-green-dark font-bold text-center"
        >
          Ver todas
        </Link>
      </div>
    </div>
  );
}
