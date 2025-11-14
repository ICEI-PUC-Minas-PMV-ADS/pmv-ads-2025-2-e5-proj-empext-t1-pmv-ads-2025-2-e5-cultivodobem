import Loader from "@/components/loader";
import { ensureAuthenticated } from "@/lib/utils";
import { getBeansQuotation } from "@/services/scrap-cepea";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanLine } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  beforeLoad: ensureAuthenticated,
});

function HomeComponent() {
  const [beanQuotation, setBeanQuotation] = useState<any>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        const rawData = await getBeansQuotation();
        setBeanQuotation(JSON.parse(rawData));
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  return (
    <div className="screen flex flex-col items-center p-4">
      {loading || !beanQuotation?.indicators?.length ? (
        <div className="flex flex-row gap-4 justify-center items-center">
          <Loader />
          <span className="text-sm text-cultivo-muted">
            Atualizando cotações...
          </span>
        </div>
      ) : (
        <div
          className="flex flex-col gap-2 p-4 rounded-lg bg-white border border-cultivo-background-darker w-full md:max-w-[540px]"
          style={{
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <span className="text-cultivo-primary text-center">
            Cotação do feijão (saca 60kg) - Minas Gerais
          </span>
          <span className="text-cultivo-green-dark text-center text-4xl font-bold">
            R$ {beanQuotation?.indicators?.[0]?.rows?.[0]?.["Valor R$/sc"]}
          </span>
          <span className="text-sm text-cultivo-muted text-center">
            Feijão Carioca - peneira 12 e/ou notas 9+
          </span>
          <span className="text-sm text-cultivo-muted text-center">
            Atualizado em:{" "}
            {beanQuotation?.indicators?.[0]?.rows?.[0]?.col_1?.replaceAll(
              "-",
              "/"
            )}{" "}
            (fonte: CEPEA/CNA)
          </span>
          <span className="text-sm text-cultivo-muted text-center"></span>
        </div>
      )}

      <div
        className="mt-6 flex w-full flex-col gap-4 rounded-lg border border-cultivo-background-darker bg-white p-4 md:max-w-[540px]"
        style={{
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2 className="font-bold text-cultivo-primary text-xl">
          Ações rápidas
        </h2>
        {/* <Link
          to="/harvest"
          className="flex flex-row justify-center items-center gap-2 bg-cultivo-secondary text-cultivo-primary rounded-lg p-2"
        >
          <PackagePlus />
          Registrar Colheita
        </Link> */}
        <Link
          to="/classifier"
          className="flex flex-row items-center justify-center gap-2 rounded-lg border border-cultivo-green-dark bg-white p-2 text-cultivo-green-dark"
        >
          <ScanLine />
          Classificar Amostra
        </Link>
      </div>

      {/* <div
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
      </div> */}
    </div>
  );
}
