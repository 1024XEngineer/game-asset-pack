import type { ProjectAsset } from "@/modules/asset/model";
import type { AssetKind } from "@/shared/types/asset-kind";

export type AssetGroup = {
  kind: AssetKind;
  title: string;
  accentClassName: string;
  assets: ProjectAsset[];
};

export type AssetGroupsByProject = Record<string, AssetGroup[]>;
