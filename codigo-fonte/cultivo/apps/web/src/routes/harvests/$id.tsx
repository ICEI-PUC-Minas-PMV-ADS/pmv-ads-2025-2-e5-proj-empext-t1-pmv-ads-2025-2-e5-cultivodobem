import { Skeleton } from "@/components/ui/skeleton";
import { ensureAuthenticated } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useConvex, useQuery } from "convex/react";
import { ShareIcon } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../../../packages/backend/convex/_generated/api";
import type {
  Doc,
  Id,
} from "../../../../../packages/backend/convex/_generated/dataModel";
import type { Analysis } from "../../../../../packages/backend/content/types";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/harvests/$id")({
  component: RouteComponent,
  beforeLoad: ensureAuthenticated,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const convex = useConvex();

  const [harvest, setHarvest] = useState<Doc<"harvests"> | null>(null);
  const [analysis, setAnalysis] = useState<Doc<"analysis"> | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);
      const harvestData = await convex.query(api.harvests.getHarvestById, {
        id: id as Id<"harvests">,
      });
      setHarvest(harvestData);
      const analysis = await convex.query(api.analysis.getAnalysisById, {
        id: harvestData?.analysisId as Id<"analysis">,
      });
      setAnalysis(analysis);
      const imageUrl = await convex.query(api.upload.getFileUrl, {
        fileId: analysis?.imageId as Id<"_storage">,
      });
      setImageUrl(imageUrl);
      setIsLoading(false);
    };

    bootstrap();
  }, [id]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!analysis || !harvest || !imageUrl) {
    return <div>Colheita não encontrada</div>;
  }

  const formatPercentage = (percentage: number) => {
    return Intl.NumberFormat("pt-BR", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(percentage / 100);
  };

  const infos = [
    {
      label: "Data da análise",
      value: new Date(analysis.createdAt).toLocaleDateString("pt-BR"),
    },
    {
      label: "Espécie",
      value: analysis.classification.summary.species,
    },

    {
      label: "Tipo",
      value: `${analysis.classification.summary.type === 0 ? "Fora de tipo" : `Tipo ${analysis.classification.summary.type}`}`,
    },

    {
      label: "Percentual de grãos defeituosos",
      value: formatPercentage(
        analysis.classification.summary.defectiveBeansPercentage
      ),
    },
    {
      label: "Enquadramento de cor",
      value: analysis.colorimetry.classification,
    },
    {
      label: "Avaliação da cor",
      value: Intl.NumberFormat("pt-BR", {
        style: "decimal",
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(analysis.colorimetry.finalScore),
    },
  ];

  const defects = [
    {
      label: "Mofados",
      value: formatPercentage(
        analysis.classification.details.graveDefects.molded
      ),
    },
    {
      label: "Ardidos",
      value: formatPercentage(
        analysis.classification.details.graveDefects.burned
      ),
    },
    {
      label: "Germinados",
      value: formatPercentage(
        analysis.classification.details.graveDefects.germinated
      ),
    },
    {
      label: "Carunchados e/ou atacados por lagartas",
      value: formatPercentage(
        analysis.classification.details.graveDefects
          .chapped_and_attacked_by_caterpillars
      ),
    },
    {
      label: "Quebrados",
      value: formatPercentage(
        analysis.classification.details.lightDefects.broken_or_split
      ),
    },
    {
      label: "Danificados",
      value: formatPercentage(
        analysis.classification.details.lightDefects.damaged
      ),
    },
    {
      label: "Imaturos",
      value: formatPercentage(
        analysis.classification.details.lightDefects.immature
      ),
    },
  ];

  const getScoreTextStyle = (value: string) => {
    let style = "font-bold text-lg ";
    const valueNumber = parseFloat(value);
    if (valueNumber > 7.5) style += "text-cultivo-green-dark";
    else if (valueNumber > 6.5) style += "text-cultivo-secondary";
    else style += "text-red-600";
    return style;
  };

  const getTypeTextStyle = (value: string) => {
    if (value === "Fora de tipo") return "text-red-600";
    if (value === "Tipo 1") return "text-cultivo-green-dark";
    return "text-cultivo-secondary";
  };

  const getDefectTextStyle = (value: string) => {
    if (value === "0,0%") return "text-cultivo-green-dark";
    return "text-cultivo-secondary";
  };

  const shareHarvest = () => {
    const url = `${window.location.origin}/harvests/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência", {
      position: "top-right",
      duration: 3000,
    });
  };

  if (!harvest) {
    return <div>Colheita não encontrada</div>;
  }

  return (
    <div className="screen w-full flex flex-col items-center p-6 bg-cultivo-background">
      <h1 className="font-bold text-2xl text-cultivo-primary text-center">
        Detalhes da colheita
      </h1>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Imagem da amostra"
          className="w-full  md:max-w-md aspect-square object-cover rounded-lg mt-8"
        />
      ) : (
        <Skeleton className="w-full md:max-w-md aspect-square object-cover rounded-lg mt-8" />
      )}
      {analysis ? (
        <div className="w-full md:max-w-md mt-6">
          <div className="flex flex-row justify-between items-center">
            <h2 className="font-bold text-xl text-cultivo-primary">
              Resumo da análise
            </h2>

            <button
              className="border border-cultivo-green-dark text-cultivo-green-dark px-4 py-2 rounded-lg flex items-center gap-2 ml-auto cursor-pointer"
              onClick={shareHarvest}
            >
              Compartilhar
              <ShareIcon size={16} />
            </button>
          </div>

          <div
            className="flex flex-col p-4 rounded-lg bg-white border border-cultivo-background-darker mt-4 w-full"
            style={{
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div
              className={
                "flex flex-row gap-4 border-b border-cultivo-background-darker py-2"
              }
            >
              <p className="text-cultivo-primary font-bold flex-1 text-lg">
                Data da colheita
              </p>
              <p className={`flex-1`}>
                {new Date(harvest?.date).toLocaleDateString()}
              </p>
            </div>
            <div
              className={
                "flex flex-row gap-4 border-b border-cultivo-background-darker py-2"
              }
            >
              <p className="text-cultivo-primary font-bold flex-1 text-lg">
                Quantidade de sacas (60kg)
              </p>
              <p className={`flex-1`}>{harvest?.quantity} {harvest?.quantity > 1 ? "sacas" : "saca"}</p>
            </div>
            <div
              className={
                "flex flex-row gap-4 border-b border-cultivo-background-darker py-2"
              }
            >
              <p className="text-cultivo-primary font-bold flex-1 text-lg">
                Observações
              </p>
              <p className="text-cultivo-primary flex-1">
                {harvest?.observations || "Nenhuma observação"}
              </p>
            </div>
          </div>

          <div
            className="flex flex-col p-4 rounded-lg bg-white border border-cultivo-background-darker mt-4 w-full"
            style={{
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            {infos.map((info, index) => (
              <div
                key={info.label}
                className={`flex flex-row gap-4 ${index === infos.length - 1 ? "" : "border-b border-cultivo-background-darker"} py-2`}
              >
                <p className="text-cultivo-primary font-bold flex-1 text-lg">
                  {info.label}
                </p>
                <p
                  className={`flex-1 ${info.label === "Avaliação da cor" ? getScoreTextStyle(info.value) : info.label === "Tipo" ? getTypeTextStyle(info.value) : ""}`}
                >
                  {info.value}
                </p>
              </div>
            ))}

            <p className="text-cultivo-primary flex-1">
              {analysis.classification.summary.explanation}
            </p>
          </div>
          <h2 className="font-bold text-xl text-cultivo-primary mt-6">
            Detalhamento de defeitos
          </h2>
          <div
            className="flex flex-col p-4 rounded-lg bg-white border border-cultivo-background-darker mt-4 w-full"
            style={{
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            {defects.map((defect, index) => (
              <div
                key={defect.label}
                className={`flex flex-row gap-4 ${index === defects.length - 1 ? "" : "border-b border-cultivo-background-darker"} py-2`}
              >
                <p className="text-cultivo-primary font-bold flex-1 text-lg">
                  {defect.label}
                </p>
                <p className={`flex-1 ${getDefectTextStyle(defect.value)}`}>
                  {defect.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Skeleton className="w-full aspect-square object-cover rounded-lg" />
      )}
    </div>
  );
}
