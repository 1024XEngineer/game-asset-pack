import { Suspense } from "react";

import { AssetDetailWorkspace } from "../../_components/asset-detail-workspace";

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ assetId: string }>;
}) {
  const { assetId } = await params;

  return (
    <Suspense>
      <AssetDetailWorkspace assetId={assetId} />
    </Suspense>
  );
}
