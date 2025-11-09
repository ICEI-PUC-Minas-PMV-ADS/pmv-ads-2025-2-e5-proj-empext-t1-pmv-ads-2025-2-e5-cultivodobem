import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../../../packages/backend/convex/_generated/api";
import { Card } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import type { Id } from "../../../../../packages/backend/convex/_generated/dataModel";
import { ensureUserRole } from "@/lib/utils";

export const Route = createFileRoute("/groups/$groupId")({
  component: GroupDetails,
  beforeLoad: () => ensureUserRole("Produtor Rural"),
});

function GroupDetails() {
  const { groupId } = Route.useParams();
  const group = useQuery(api.group.getById, { id: groupId as Id<"groups"> });
  const isLoading = group === undefined;

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!group) {
    return <div className="p-4">Group not found</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">{group.name}</h1>
      <Card className="p-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Description</h2>
          <p>{group.description}</p>
        </div>
        <div className="mt-4 space-y-2">
          <h2 className="text-lg font-semibold">Created</h2>
          <p>{new Date(group._creationTime).toLocaleDateString()}</p>
        </div>
      </Card>
    </div>
  );
}
