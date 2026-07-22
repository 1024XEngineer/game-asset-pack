import type { LucideIcon } from "lucide-react";
import {
  Box,
  Grid3X3,
  Image,
  Mountain,
  PanelsTopLeft,
  UserRound,
  Volume2,
} from "lucide-react";

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

export type AssetTypeAdapter = {
  label: string;
  icon: LucideIcon;
  defaultCanvasSize?: string;
};

export const assetTypeAdapters: Record<CreatableAssetKind, AssetTypeAdapter> = {
  character: {
    label: "Character",
    icon: UserRound,
    defaultCanvasSize: "32 × 32 px",
  },
  object: { label: "Object", icon: Box, defaultCanvasSize: "32 × 32 px" },
  tiles: { label: "Tiles", icon: Grid3X3, defaultCanvasSize: "16 × 16 px" },
  scenery: { label: "Scenery", icon: Mountain },
  audio: { label: "Audio", icon: Volume2 },
  background: { label: "Background", icon: Image },
  ui: { label: "UI", icon: PanelsTopLeft },
};

export function getAssetTypeAdapter(kind: CreatableAssetKind) {
  return assetTypeAdapters[kind];
}
