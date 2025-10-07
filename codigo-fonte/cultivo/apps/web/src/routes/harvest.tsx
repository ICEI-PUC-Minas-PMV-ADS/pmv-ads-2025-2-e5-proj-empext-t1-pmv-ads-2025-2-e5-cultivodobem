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
    <div className="flex flex-col pt-18">
      <button className="flex flex-row justify-center items-center w-[80%] mx-auto mb-8 bg-cultivo-secondary gap-2 px-6 py-3 rounded-lg text-cultivo-primary font-bold hover:cursor-pointer hover:opacity-90 transition">
        <Plus />
        Registrar Nova Colheita
      </button>
      {harvests.map((harvest) => (
        <a
          key={harvest.id}
          className="bg-white rounded-lg p-4 mb-4 mx-auto w-[80%] h-[124px] drop-shadow-md drop-shadow-black/30 hover:drop-shadow-black/50 hover:cursor-pointer transition"
        >
          <h3 className="text-xl text-cultivo-primary font-bold">
            Colheita de {harvest.date}
          </h3>
          <p className="text-cultivo-primary text-base mt-4">
            <strong className="font-bold">Quantidade:</strong>{" "}
            {harvest.quantity} sacas
          </p>
          {harvest.observations && (
            <p className="text-cultivo-muted text-base mt-2 truncate">
              {harvest.observations}
            </p>
          )}
        </a>
      ))}
    </div>
  );
}
