import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/harvest")({
	component: HarvestScreen,
});

function HarvestScreen() {
	const harvests = [
		{
			id: 1,
			date: "05/09/2025",
			quantity: 120,
			observations: "Grãos de boa qualidade.",
		},
		{
			id: 2,
			date: "05/09/2025",
			quantity: 120,
			observations:
				"lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
		},
	];

	return (
		<div className="screen flex flex-col items-center p-4">
			<h1 className="text-center font-bold text-2xl text-cultivo-primary">
				Minhas Colheitas
			</h1>
			<button className="mt-6 flex w-full flex-row items-center justify-center gap-2 rounded-lg bg-cultivo-green-dark px-6 py-3 font-bold text-white md:max-w-md">
				<Plus />
				Registrar Nova Colheita
			</button>
			{harvests.map((harvest) => (
				<a
					key={harvest.id}
					className="mt-6 flex w-full flex-col rounded-lg border border-cultivo-background-darker bg-white p-4 md:max-w-md"
					style={{
						boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
					}}
				>
					<h3 className="font-bold text-cultivo-primary text-xl">
						Colheita de {harvest.date}
					</h3>
					<p className="mt-4 text-base text-cultivo-primary">
						<strong className="font-bold">Quantidade:</strong>{" "}
						{harvest.quantity} sacas
					</p>
					{harvest.observations && (
						<p className="mt-2 truncate text-base text-cultivo-muted">
							{harvest.observations}
						</p>
					)}
				</a>
			))}
		</div>
	);
}
