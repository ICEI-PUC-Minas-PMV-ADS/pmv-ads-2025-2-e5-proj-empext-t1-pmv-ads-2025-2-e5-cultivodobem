import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { ExternalLink, Plus, Trash } from "lucide-react";
import { api } from "../../../../../packages/backend/convex/_generated/api";
import { ensureUserRole, getUserIdFromLocalStorage } from "@/lib/utils";
import { toast } from "sonner";
import type { Id } from "../../../../../packages/backend/convex/_generated/dataModel";

export const Route = createFileRoute("/harvests/")({
  component: HarvestsScreen,
  beforeLoad: () => ensureUserRole("Produtor Rural"),
});

function HarvestsScreen() {
  const harvests = useQuery(api.harvests.getHarvestsByUser, {
    userId: getUserIdFromLocalStorage(),
  });
  const deleteHarvest = useMutation(api.harvests.deleteHarvest);

  const handleDeleteHarvest = async (id: Id<"harvests">) => {
    const deletedId = await deleteHarvest({ id });

    if (deletedId) {
      toast.success("Colheita excluída com sucesso", {
        position: "top-right",
        duration: 3000,
      });
    } else {
      toast.error("Erro ao excluir colheita", {
        position: "top-right",
        duration: 3000,
      });
    }
  };

  return (
    <div className="screen flex flex-col items-center p-4">
      <Link
        to="/harvests/create"
        className="flex flex-row justify-center items-center w-full md:max-w-md bg-cultivo-green-dark gap-2 px-6 py-3 rounded-lg text-white font-bold mt-6"
      >
        <Plus />
        Registrar Nova Colheita
      </Link>
      {harvests &&
        harvests.length > 0 &&
        harvests.map((harvest) => (
          <div
            key={harvest._id}
            className="flex flex-col p-4 md:max-w-md rounded-lg bg-white border border-cultivo-background-darker mt-6 w-full"
            style={{
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="flex flex-row justify-between items-center">
              <h3 className="text-xl text-cultivo-primary font-bold">
                Colheita de {new Date(harvest.date).toLocaleDateString()}
              </h3>
              <Link
                to="/harvests/$id"
                params={{ id: harvest._id }}
                className="flex flex-row items-center gap-2 text-cultivo-green-dark"
              >
                Ver <ExternalLink />
              </Link>
            </div>
            <div className="flex flex-col mt-4">
              <div>
                <p className="text-cultivo-primary text-base">
                  <strong className="font-bold">Quantidade:</strong>{" "}
                  {harvest.quantity} sacas
                </p>
                <p className="text-cultivo-muted text-base mt-2 truncate">
                  {harvest.observations || "Nenhuma observação"}
                </p>
              </div>
              <div className="flex flex-row justify-end mt-4">
                <button
                  className="flex flex-row items-center gap-2 text-red-500 px-4 py-2 cursor-pointer border border-red-300 rounded-lg hover:bg-red-50"
                  onClick={() => handleDeleteHarvest(harvest._id)}
                >
                  <Trash className="w-4 h-4" />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
