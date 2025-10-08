import { createFileRoute } from "@tanstack/react-router";
import { Feed } from "@/components/Feed";

export const Route = createFileRoute("/feed")({
  component: FeedPage,
});

function FeedPage() {
  return <Feed />;
}
