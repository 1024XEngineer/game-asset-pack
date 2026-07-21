import { createContext, useContext, useMemo, useState } from "react";

import type { AssetGroup } from "@/modules/asset/library/model";

type AssetLibraryStoreValue = {
  assetGroups: AssetGroup[];
  copyAsset: (assetId: string) => void;
  deleteAsset: (assetId: string) => void;
};

const AssetLibraryStoreContext = createContext<AssetLibraryStoreValue | null>(
  null,
);

export function AssetLibraryStoreProvider({
  children,
  initialAssetGroups,
}: {
  children: React.ReactNode;
  initialAssetGroups: AssetGroup[];
}) {
  const [assetGroups, setAssetGroups] = useState(initialAssetGroups);

  const value = useMemo<AssetLibraryStoreValue>(
    () => ({
      assetGroups,
      copyAsset: (assetId) => {
        const copyId = `${assetId}-copy-${crypto.randomUUID()}`;
        setAssetGroups((current) =>
          current.map((group) => {
            const assetIndex = group.assets.findIndex(
              (asset) => asset.id === assetId,
            );
            if (assetIndex < 0) return group;

            const asset = group.assets[assetIndex];
            const copiedAsset = {
              ...asset,
              id: copyId,
              name: `${asset.name} Copy`,
              history: asset.history.map((entry) => ({
                ...entry,
                id: `${copyId}-history-${entry.version}`,
              })),
              animations: asset.animations.map((animation) => ({
                ...animation,
                id: `${copyId}-animation-${animation.id}`,
              })),
            };

            return {
              ...group,
              assets: [
                ...group.assets.slice(0, assetIndex + 1),
                copiedAsset,
                ...group.assets.slice(assetIndex + 1),
              ],
            };
          }),
        );
      },
      deleteAsset: (assetId) =>
        setAssetGroups((current) =>
          current.map((group) => ({
            ...group,
            assets: group.assets.filter((asset) => asset.id !== assetId),
          })),
        ),
    }),
    [assetGroups],
  );

  return (
    <AssetLibraryStoreContext value={value}>
      {children}
    </AssetLibraryStoreContext>
  );
}

export function useAssetLibraryStore() {
  const value = useContext(AssetLibraryStoreContext);
  if (!value)
    throw new Error(
      "useAssetLibraryStore must be used within AssetLibraryStoreProvider",
    );
  return value;
}
