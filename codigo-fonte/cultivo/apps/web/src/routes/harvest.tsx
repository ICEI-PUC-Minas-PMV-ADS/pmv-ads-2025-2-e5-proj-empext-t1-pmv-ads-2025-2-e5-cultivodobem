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
      <h1 className="font-bold text-2xl text-cultivo-primary text-center">
        Minhas Colheitas
      </h1>
      <button className="flex flex-row justify-center items-center w-full md:max-w-md bg-cultivo-green-dark gap-2 px-6 py-3 rounded-lg text-white font-bold mt-6">
        <Plus />
        Registrar Nova Colheita
      </button>
      {harvests.map((harvest) => (
        <a
          key={harvest.id}
          className="flex flex-col p-4 md:max-w-md rounded-lg bg-white border border-cultivo-background-darker mt-6 w-full"
          style={{
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          }}
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
