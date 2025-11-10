import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../../../packages/backend/convex/_generated/api";
import { ensureUserRole, getUserIdFromLocalStorage } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/groups/participating")({
  component: RouteComponent,
  beforeLoad: () => ensureUserRole("Produtor Rural"),
});

function RouteComponent() {
  const userId = getUserIdFromLocalStorage();
  const groups = useQuery(api.group.list);

  if (!userId) return <div className="p-4">Usuário não autenticado.</div>;

  const myGroups = (groups ?? []).filter((g: any) =>
    (g.participants ?? []).some((p: any) => String(p) === String(userId))
  );

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Grupos que participo</h1>
      {!groups && <div>Carregando...</div>}
      {groups && myGroups.length === 0 && (
        <div>Você ainda não participa de nenhum grupo.</div>
      )}
      <ul className="groups-list">
        {myGroups.map((g: any) => (
          <li key={g._id} className="group-item">
            <div>
              <div className="group-name">{g.name}</div>
              <div className="group-desc">{g.description}</div>
              <div className="group-stock">Estoque: {g.stock}</div>
            </div>
            <div className="group-actions">
              <Button onClick={() => (window.location.href = "/groups/")}>
                Ver todos
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
