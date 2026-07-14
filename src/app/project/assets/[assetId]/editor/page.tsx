import { Suspense } from "react";

import { AssetEditorWorkspace } from "../../../_components/asset-editor-workspace";

export default async function AssetEditorPage({
  params,
}: {
  params: Promise<{ assetId: string }>;
}) {
  const { assetId } = await params;

  return (
    <Suspense>
      <AssetEditorWorkspace assetId={assetId} />
    </Suspense>
  );
}
