export type QuickGenerationAsset = {
  id: string;
  prompt: string;
  referenceImage: string;
  size: string;
  previewClassName: string;
};

export const quickGenerationSizes = [
  "32 × 32 px",
  "64 × 64 px",
  "128 × 128 px",
  "256 × 256 px",
  "512 × 512 px",
];

export const initialQuickGenerationAssets: QuickGenerationAsset[] = [
  {
    id: "mushroom-courier",
    prompt:
      "A cheerful mushroom courier with a red cap, tiny satchel, and readable silhouette.",
    referenceImage: "",
    size: "64 × 64 px",
    previewClassName:
      "bg-[radial-gradient(circle_at_35%_28%,#f4c665_0,transparent_25%),linear-gradient(145deg,#243847,#708d78)]",
  },
  {
    id: "moonlit-lantern",
    prompt:
      "A small brass lantern glowing with cool blue moonlight and subtle engraved details.",
    referenceImage: "",
    size: "128 × 128 px",
    previewClassName:
      "bg-[radial-gradient(circle_at_55%_40%,#a9d5ff_0,transparent_24%),linear-gradient(145deg,#151d3a,#58608d)]",
  },
  {
    id: "forest-gate",
    prompt:
      "An ancient moss-covered stone gate framed by roots and tiny luminous flowers.",
    referenceImage: "",
    size: "256 × 256 px",
    previewClassName:
      "bg-[radial-gradient(circle_at_65%_30%,#d2e893_0,transparent_22%),linear-gradient(145deg,#20372b,#66835e)]",
  },
];
