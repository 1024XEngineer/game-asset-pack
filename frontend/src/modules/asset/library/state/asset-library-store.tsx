import { createContext, useContext, useMemo, useState } from "react";

import type { AssetGroupsByProject } from "@/modules/asset/library/model";
import type { ProjectAsset } from "@/modules/asset/model";
import type { AssetKind } from "@/shared/types/asset-kind";

type AssetLibraryStoreValue = {
  assetGroupsByProject: AssetGroupsByProject;
  addAsset: (projectId: string, kind: AssetKind, asset: ProjectAsset) => void;
  copyAsset: (projectId: string, assetId: string) => void;
  deleteAsset: (projectId: string, assetId: string) => void;
  deleteProjectAssets: (projectId: string) => void;
};

const AssetLibraryStoreContext = createContext<AssetLibraryStoreValue | null>(
  null,
);

export function addAssetToProject(
  current: AssetGroupsByProject,
  projectId: string,
  kind: AssetKind,
  asset: ProjectAsset,
): AssetGroupsByProject {
  const groups = current[projectId] ?? [];
  const existingGroup = groups.find((group) => group.kind === kind);

  if (existingGroup) {
    return {
      ...current,
      [projectId]: groups.map((group) =>
        group.kind === kind
          ? { ...group, assets: [...group.assets, asset] }
          : group,
      ),
    };
  }

  return {
    ...current,
    [projectId]: [
      ...groups,
      {
        kind,
        title:
          kind === "ui" ? "UI" : `${kind[0].toUpperCase()}${kind.slice(1)}`,
        accentClassName: "bg-slate-500",
        assets: [asset],
      },
    ],
  };
}

export function copyAssetInProject(
  current: AssetGroupsByProject,
  projectId: string,
  assetId: string,
  copyId = `${assetId}-copy-${crypto.randomUUID()}`,
): AssetGroupsByProject {
  const groups = current[projectId] ?? [];

  return {
    ...current,
    [projectId]: groups.map((group) => {
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
  };
}

export function deleteAssetFromProject(
  current: AssetGroupsByProject,
  projectId: string,
  assetId: string,
): AssetGroupsByProject {
  return {
    ...current,
    [projectId]: (current[projectId] ?? []).map((group) => ({
      ...group,
      assets: group.assets.filter((asset) => asset.id !== assetId),
    })),
  };
}

export function removeProjectAssets(
  current: AssetGroupsByProject,
  projectId: string,
): AssetGroupsByProject {
  const { [projectId]: _, ...remaining } = current;
  return remaining;
}

export function AssetLibraryStoreProvider({
  children,
  initialAssetGroupsByProject,
}: {
  children: React.ReactNode;
  initialAssetGroupsByProject: AssetGroupsByProject;
}) {
  const [assetGroupsByProject, setAssetGroupsByProject] = useState(
    initialAssetGroupsByProject,
  );

  const value = useMemo<AssetLibraryStoreValue>(
    () => ({
      assetGroupsByProject,
      addAsset: (projectId, kind, asset) =>
        setAssetGroupsByProject((current) =>
          addAssetToProject(current, projectId, kind, asset),
        ),
      copyAsset: (projectId, assetId) =>
        setAssetGroupsByProject((current) =>
          copyAssetInProject(current, projectId, assetId),
        ),
      deleteAsset: (projectId, assetId) =>
        setAssetGroupsByProject((current) =>
          deleteAssetFromProject(current, projectId, assetId),
        ),
      deleteProjectAssets: (projectId) =>
        setAssetGroupsByProject((current) =>
          removeProjectAssets(current, projectId),
        ),
    }),
    [assetGroupsByProject],
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
