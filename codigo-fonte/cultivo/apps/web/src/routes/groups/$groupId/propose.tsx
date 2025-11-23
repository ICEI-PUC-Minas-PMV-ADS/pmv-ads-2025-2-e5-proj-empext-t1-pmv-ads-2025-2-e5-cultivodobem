import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/groups/$groupId/propose")({
  component: ProposeRedirect,
});

function ProposeRedirect() {
  const navigate = useNavigate();
  const { groupId } = Route.useParams();

  useEffect(() => {
    if (!groupId) return;
    // Redirect to the proposals creation page with groupId in search params
    navigate({ to: "/proposals/create", search: { groupId } });
  }, [groupId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 mt-16">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#62331B] border-r-transparent align-[-0.125em]"></div>
        <p className="mt-4 text-[#62331B] font-medium">Redirecionando para criar proposta...</p>
      </div>
    </div>
  );
}
