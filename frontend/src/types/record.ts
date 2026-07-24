import type { AssetKind } from "@/types/asset-kind";

export type AssetRecordStatus = "ready" | "generating" | "failed";

export type EditorCanvasPosition = {
  x: number;
  y: number;
};

export type EditorCharacterAnimationId =
  | "idle"
  | "walk"
  | "harvest"
  | "jump"
  | "celebrate";

export type EditorCharacterAnimation = {
  id: EditorCharacterAnimationId;
  label: string;
  frameCount: number;
  audio?: {
    label: string;
    time: string;
  };
};

export type EditorSceneryLayer = {
  id: string;
  label: string;
  detail: string;
  imageUrl: string;
  blendMode: "normal" | "multiply";
};

export type EditorSpriteSheetTile = {
  id: string;
  label: string;
  cells: number[];
};

export type EditorSpriteSheetItem = {
  id: string;
  label: string;
  icon: "bed" | "lamp" | "fence" | "object";
  tiles: EditorSpriteSheetTile[];
};

export type RecordContent = {
  prompt: string;
  character?: {
    prototypeName?: string;
    animations?: EditorCharacterAnimation[];
    nodePositions: Record<string, EditorCanvasPosition>;
  };
  scenery?: {
    layers: EditorSceneryLayer[];
  };
  spriteSheet?: {
    gridSize: number;
    items: EditorSpriteSheetItem[];
  };
};

export type AssetRecord = {
  id: string;
  version: string;
  description: string;
  savedAt?: string;
  status: AssetRecordStatus;
  isCurrent: boolean;
  content?: RecordContent;
};

export type RecordWorkspaceAsset = {
  id: string;
  projectId: string;
  kind: AssetKind;
  name: string;
  version: string;
  history: AssetRecord[];
};

export type RecordData = {
  projectName: string;
  asset: RecordWorkspaceAsset;
  content: RecordContent;
};
