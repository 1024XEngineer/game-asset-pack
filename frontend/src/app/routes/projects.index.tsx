import { createFileRoute } from "@tanstack/react-router";

import { ProjectLibraryPage } from "@/pages/projects/ProjectLibraryPage";

export const Route = createFileRoute("/projects/")({
  component: ProjectLibraryPage,
});
