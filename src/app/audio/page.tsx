import { Suspense } from "react";

import { AudioAssetWorkspace } from "../project/_components/audio-asset-workspace";

export default function AudioPage() {
  return (
    <Suspense>
      <AudioAssetWorkspace />
    </Suspense>
  );
}
