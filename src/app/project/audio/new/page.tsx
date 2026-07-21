import { Suspense } from "react";

import { AudioAssetWorkspace } from "../../_components/audio-asset-workspace";

export default function ProjectAudioPage() {
  return (
    <Suspense>
      <AudioAssetWorkspace />
    </Suspense>
  );
}
