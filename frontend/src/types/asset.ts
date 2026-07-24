import type { AssetKind } from "@/types/asset-kind";
import type { AssetRecord, AssetRecordStatus } from "@/types/asset-record";

export type Asset = {
  id: string;
  name: string;
  kind: AssetKind;
  version: string;
  size: string;
  description: string;
  tags: string[];
  accent: string;
};

export type AssetAnimation = {
  id: string;
  name: string;
  frameCount: number;
  status: AssetRecordStatus;
};

export type SceneryLayer = {
  id: string;
  label: string;
  detail: string;
  imageUrl: string;
  blendMode: "normal" | "multiply";
};

export type SceneryAssetData = {
  layers: SceneryLayer[];
};

export type ProjectAsset = {
  id: string;
  name: string;
  description: string;
  version: string;
  canvasSize: string;
  perspective: string;
  tags: string[];
  history: AssetRecord[];
  animations: AssetAnimation[];
  scenery?: SceneryAssetData;
};
