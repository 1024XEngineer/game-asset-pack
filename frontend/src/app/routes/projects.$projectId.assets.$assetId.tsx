import { createFileRoute } from "@tanstack/react-router";

import { EditorPage } from "@/pages/projects/EditorPage";

export const Route = createFileRoute("/projects/$projectId/assets/$assetId")({
  component: EditorPage,
});
