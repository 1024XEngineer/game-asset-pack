export type AssetKind = "character" | "object" | "tiles";

export type AssetHistoryStatus = "ready" | "generating" | "failed";

export type AssetHistoryEntry = {
  id: string;
  version: string;
  description: string;
  status: AssetHistoryStatus;
  isCurrent: boolean;
};

export type AssetAnimation = {
  id: string;
  name: string;
  frameCount: number;
  status: AssetHistoryStatus;
};

export type ProjectAsset = {
  id: string;
  name: string;
  description: string;
  version: string;
  canvasSize: string;
  perspective: string;
  tags: string[];
  history: AssetHistoryEntry[];
  animations: AssetAnimation[];
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

function createHistory(
  assetId: string,
  currentVersion: string,
  currentDescription: string,
): AssetHistoryEntry[] {
  const currentNumber = Number.parseInt(currentVersion.replace("v", ""), 10);
  const descriptions = [
    currentDescription,
    "Adjusted contrast and edge cleanup",
    "Initial generated concept",
  ];

  return Array.from({ length: Math.min(3, Math.max(1, currentNumber)) }, (_, index) => {
    const version = `v${currentNumber - index}`;

    return {
      id: `${assetId}-history-${version}`,
      version,
      description: descriptions[index],
      status: "ready" as const,
      isCurrent: index === 0,
    };
  });
}

function createAsset(asset: Omit<ProjectAsset, "history" | "animations">): ProjectAsset {
  return {
    ...asset,
    history: createHistory(asset.id, asset.version, asset.description),
    animations: [],
  };
}

export const assetGroups: AssetGroup[] = [
  {
    kind: "character",
    title: "Character",
    accentClassName: "bg-rose-500",
    assets: [
      createAsset({
        id: "forager-hero",
        name: "Forager Hero",
        description: "Idle, walk, harvest",
        version: "v4",
        canvasSize: "32 × 32 px",
        perspective: "Top-down",
        tags: ["hero", "orchard"],
      }),
      createAsset({
        id: "lantern-merchant",
        name: "Lantern Merchant",
        description: "Front view draft",
        version: "v2",
        canvasSize: "32 × 32 px",
        perspective: "Front view",
        tags: ["npc", "merchant"],
      }),
      createAsset({
        id: "moss-slime",
        name: "Moss Slime",
        description: "Bounce animation",
        version: "v6",
        canvasSize: "32 × 32 px",
        perspective: "Top-down",
        tags: ["creature", "enemy"],
      }),
    ],
  },
  {
    kind: "object",
    title: "Object",
    accentClassName: "bg-amber-500",
    assets: [
      createAsset({
        id: "copper-watering-can",
        name: "Copper Watering Can",
        description: "32x32 item sprite",
        version: "v3",
        canvasSize: "32 × 32 px",
        perspective: "Top-down",
        tags: ["tool", "copper"],
      }),
      createAsset({
        id: "blueberry-crate",
        name: "Blueberry Crate",
        description: "4 color variants",
        version: "v1",
        canvasSize: "32 × 32 px",
        perspective: "Three-quarter",
        tags: ["prop", "storage"],
      }),
      createAsset({
        id: "weathered-signpost",
        name: "Weathered Signpost",
        description: "Directional prop",
        version: "v5",
        canvasSize: "32 × 32 px",
        perspective: "Front view",
        tags: ["prop", "wood"],
      }),
    ],
  },
  {
    kind: "tiles",
    title: "Tiles",
    accentClassName: "bg-emerald-500",
    assets: [
      createAsset({
        id: "orchard-ground-set",
        name: "Orchard Ground Set",
        description: "Grass, dirt, path edges",
        version: "v7",
        canvasSize: "16 × 16 px",
        perspective: "Top-down",
        tags: ["terrain", "ground"],
      }),
      createAsset({
        id: "stone-wall-corners",
        name: "Stone Wall Corners",
        description: "Autotile pieces",
        version: "v2",
        canvasSize: "16 × 16 px",
        perspective: "Top-down",
        tags: ["terrain", "wall"],
      }),
      createAsset({
        id: "pond-rim-tiles",
        name: "Pond Rim Tiles",
        description: "Water border kit",
        version: "v3",
        canvasSize: "16 × 16 px",
        perspective: "Top-down",
        tags: ["terrain", "water"],
      }),
    ],
  },
];
