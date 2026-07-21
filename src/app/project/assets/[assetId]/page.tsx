import { Suspense } from "react";

import { Workspace } from "./_components/workspace";

export default async function AssetPage({ params }: { params: Promise<{ assetId: string }> }) {
  const { assetId } = await params;

  return (
    <Suspense>
      <Workspace assetId={assetId} />
    </Suspense>
  );
}
