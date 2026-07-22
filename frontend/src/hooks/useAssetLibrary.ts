import { useMemo, useState } from "react";

import type { AssetGroup } from "@/models/asset-library";
import { assetKinds, type AssetKind } from "@/shared/types/asset-kind";

export function useAssetLibrary(assetGroups: AssetGroup[], query: string) {
  const [selectedKinds, setSelectedKinds] = useState<AssetKind[]>([
    ...assetKinds,
  ]);
  const filteredAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return assetGroups
      .filter((group) => selectedKinds.includes(group.kind))
      .flatMap((group) =>
        group.assets
          .filter((asset) =>
            [asset.name, asset.description, asset.version].some((value) =>
              value.toLowerCase().includes(normalizedQuery),
            ),
          )
          .map((asset) => ({
            ...asset,
            accentClassName: group.accentClassName,
            kind: group.kind,
            kindLabel: group.title,
          })),
      );
  }, [assetGroups, query, selectedKinds]);

  return { filteredAssets, selectedKinds, setSelectedKinds };
}
