import { createFileRoute } from "@tanstack/react-router";

import { QuickGeneratePage } from "@/pages/quick-generation/QuickGeneratePage";

export const Route = createFileRoute("/generate")({
  component: QuickGeneratePage,
});
