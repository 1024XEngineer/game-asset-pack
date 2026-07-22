import type { CreatableAssetKind } from "@/types/asset-kind";

export type CreationRequest = {
  kind: CreatableAssetKind;
  name: string;
  prompt: string;
  canvasSize: string;
  perspective?: "top-down" | "side-on" | "isometric";
  directionCount?: "1" | "4" | "8";
  reference?: File;
  useProjectContext: boolean;
  backgroundType?: "scenery" | "tiles";
  style?: string;
  aspectRatio?: string;
  layers?: { description: string }[];
  tiles?: { description: string; reference?: File }[];
  components?: { name: string; description: string; isCustom: boolean }[];
};

export type GenerationRun = CreationRequest & {
  id: string;
  projectId: string;
  status: "queued" | "processing" | "failed";
};
