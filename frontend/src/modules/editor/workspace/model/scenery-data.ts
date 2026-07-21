export const SCENERY_LAYERS = [
  { id: "sky", label: "Sky", detail: "Background layer" },
  { id: "wind", label: "Wind", detail: "Atmosphere layer" },
  { id: "nearby-trees", label: "Nearby trees", detail: "Foreground layer" },
] as const;

export type SceneryLayerId = (typeof SCENERY_LAYERS)[number]["id"];
