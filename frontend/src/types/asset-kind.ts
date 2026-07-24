export const assetKinds = [
  "character",
  "object",
  "tiles",
  "scenery",
  "audio",
  "background",
  "ui",
] as const;

export type AssetKind = (typeof assetKinds)[number];

export type CreatableAssetKind = AssetKind;

export const creatableAssetKinds: CreatableAssetKind[] = [
  "character",
  "object",
  "background",
  "ui",
  "audio",
];
