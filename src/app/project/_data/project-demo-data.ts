export type AssetKind = "character" | "object" | "tiles";

export type ProjectAsset = {
  id: string;
  name: string;
  description: string;
  version: string;
};

export type AssetGroup = {
  kind: AssetKind;
  title: string;
  accentClassName: string;
  assets: ProjectAsset[];
};

export type ProjectSummary = {
  id: string;
  name: string;
  style: string;
  assetCount: number;
};

export const projectSummaries: ProjectSummary[] = [
  {
    id: "moonlit-orchard",
    name: "Moonlit Orchard",
    style: "Cozy pixel RPG",
    assetCount: 24,
  },
  {
    id: "iron-harbor",
    name: "Iron Harbor",
    style: "Industrial platformer",
    assetCount: 18,
  },
  {
    id: "mushroom-courier",
    name: "Mushroom Courier",
    style: "Tiny adventure demo",
    assetCount: 31,
  },
];

export const createAssetKinds: AssetKind[] = ["character", "object", "tiles"];

export const assetGroups: AssetGroup[] = [
  {
    kind: "character",
    title: "Character",
    accentClassName: "bg-rose-500",
    assets: [
      {
        id: "forager-hero",
        name: "Forager Hero",
        description: "Idle, walk, harvest",
        version: "v4",
      },
      {
        id: "lantern-merchant",
        name: "Lantern Merchant",
        description: "Front view draft",
        version: "v2",
      },
      {
        id: "moss-slime",
        name: "Moss Slime",
        description: "Bounce animation",
        version: "v6",
      },
    ],
  },
  {
    kind: "object",
    title: "Object",
    accentClassName: "bg-amber-500",
    assets: [
      {
        id: "copper-watering-can",
        name: "Copper Watering Can",
        description: "32x32 item sprite",
        version: "v3",
      },
      {
        id: "blueberry-crate",
        name: "Blueberry Crate",
        description: "4 color variants",
        version: "v1",
      },
      {
        id: "weathered-signpost",
        name: "Weathered Signpost",
        description: "Directional prop",
        version: "v5",
      },
    ],
  },
  {
    kind: "tiles",
    title: "Tiles",
    accentClassName: "bg-emerald-500",
    assets: [
      {
        id: "orchard-ground-set",
        name: "Orchard Ground Set",
        description: "Grass, dirt, path edges",
        version: "v7",
      },
      {
        id: "stone-wall-corners",
        name: "Stone Wall Corners",
        description: "Autotile pieces",
        version: "v2",
      },
      {
        id: "pond-rim-tiles",
        name: "Pond Rim Tiles",
        description: "Water border kit",
        version: "v3",
      },
    ],
  },
];
