import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { ShareIcon } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ensureAuthenticated } from "@/lib/utils";
import { api } from "../../../../../packages/backend/convex/_generated/api";
import type { Id } from "../../../../../packages/backend/convex/_generated/dataModel";

export const Route = createFileRoute("/classifier/$id")({
	component: ViewSampleClassification,
	beforeLoad: ensureAuthenticated,
});

function ViewSampleClassification() {
	const { id } = Route.useParams();

	const analysis = useQuery(api.analysis.getAnalysisById, {
		id: id as Id<"analysis">,
	});

	const imageUrl = useQuery(api.upload.getFileUrl, {
		fileId: analysis?.imageId as Id<"_storage">,
	});

	if (!analysis) {
		return <div>Análise não encontrada</div>;
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
				analysis.classification.summary.defectiveBeansPercentage,
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
				analysis.classification.details.graveDefects.molded,
			),
		},
		{
			label: "Ardidos",
			value: formatPercentage(
				analysis.classification.details.graveDefects.burned,
			),
		},
		{
			label: "Germinados",
			value: formatPercentage(
				analysis.classification.details.graveDefects.germinated,
			),
		},
		{
			label: "Carunchados e/ou atacados por lagartas",
			value: formatPercentage(
				analysis.classification.details.graveDefects
					.chapped_and_attacked_by_caterpillars,
			),
		},
		{
			label: "Quebrados",
			value: formatPercentage(
				analysis.classification.details.lightDefects.broken_or_split,
			),
		},
		{
			label: "Danificados",
			value: formatPercentage(
				analysis.classification.details.lightDefects.damaged,
			),
		},
		{
			label: "Imaturos",
			value: formatPercentage(
				analysis.classification.details.lightDefects.immature,
			),
		},
	];

	const getScoreTextStyle = (value: string) => {
		let style = "font-bold text-lg ";
		const valueNumber = Number.parseFloat(value);
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

	const shareAnalysis = () => {
		const url = `${window.location.origin}/classifier/${id}`;
		navigator.clipboard.writeText(url);
		toast.success("Link copiado para a área de transferência", {
			position: "top-right",
			duration: 3000,
		});
	};

	return (
		<div className="screen flex w-full flex-col items-center bg-cultivo-background p-6">
			<h1 className="text-center font-bold text-2xl text-cultivo-primary">
				Resultado da análise
			</h1>
			{imageUrl ? (
				<img
					src={imageUrl}
					alt="Imagem da amostra"
					className="mt-8 aspect-square w-full rounded-lg object-cover md:max-w-md"
				/>
			) : (
				<Skeleton className="mt-8 aspect-square w-full rounded-lg object-cover md:max-w-md" />
			)}
			{analysis ? (
				<div className="mt-6 w-full md:max-w-md">
					<div className="flex flex-row items-center justify-between">
						<h2 className="font-bold text-cultivo-primary text-xl">
							Resumo da análise
						</h2>

						<button
							className="ml-auto flex cursor-pointer items-center gap-2 rounded-lg border border-cultivo-green-dark px-4 py-2 text-cultivo-green-dark"
							onClick={shareAnalysis}
						>
							Compartilhar
							<ShareIcon size={16} />
						</button>
					</div>
					<div
						className="mt-4 flex w-full flex-col rounded-lg border border-cultivo-background-darker bg-white p-4"
						style={{
							boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
						}}
					>
						{infos.map((info, index) => (
							<div
								key={info.label}
								className={`flex flex-row gap-4 ${index === infos.length - 1 ? "" : "border-cultivo-background-darker border-b"} py-2`}
							>
								<p className="flex-1 font-bold text-cultivo-primary text-lg">
									{info.label}
								</p>
								<p
									className={`flex-1 ${info.label === "Avaliação da cor" ? getScoreTextStyle(info.value) : info.label === "Tipo" ? getTypeTextStyle(info.value) : ""}`}
								>
									{info.value}
								</p>
							</div>
						))}

						<p className="flex-1 text-cultivo-primary">
							{analysis.classification.summary.explanation}
						</p>
					</div>
					<h2 className="mt-6 font-bold text-cultivo-primary text-xl">
						Detalhamento de defeitos
					</h2>
					<div
						className="mt-4 flex w-full flex-col rounded-lg border border-cultivo-background-darker bg-white p-4"
						style={{
							boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
						}}
					>
						{defects.map((defect, index) => (
							<div
								key={defect.label}
								className={`flex flex-row gap-4 ${index === defects.length - 1 ? "" : "border-cultivo-background-darker border-b"} py-2`}
							>
								<p className="flex-1 font-bold text-cultivo-primary text-lg">
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
				<Skeleton className="aspect-square w-full rounded-lg object-cover" />
			)}
		</div>
	);
}
