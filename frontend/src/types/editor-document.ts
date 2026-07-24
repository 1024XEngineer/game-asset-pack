import type { AssetKind } from "@/types/asset-kind";
import type { AssetRecord } from "@/types/asset-record";

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

export type AssetEditorDocument = {
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

export type EditorWorkspaceAsset = {
  id: string;
  projectId: string;
  kind: AssetKind;
  name: string;
  version: string;
  history: AssetRecord[];
};

export type EditorDocumentData = {
  projectName: string;
  asset: EditorWorkspaceAsset;
  document: AssetEditorDocument;
};
