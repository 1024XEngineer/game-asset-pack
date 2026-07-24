import { createFileRoute } from "@tanstack/react-router";

import { AudioStudioPage } from "@/pages/audio/AudioStudioPage";

export const Route = createFileRoute("/audio")({
  component: AudioStudioPage,
});
