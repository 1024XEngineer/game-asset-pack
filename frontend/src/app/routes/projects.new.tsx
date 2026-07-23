import { createFileRoute } from "@tanstack/react-router";

import { NewProjectPage } from "@/pages/projects/NewProjectPage";

export const Route = createFileRoute("/projects/new")({
  component: NewProjectPage,
});
