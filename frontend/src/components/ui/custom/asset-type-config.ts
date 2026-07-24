/**
 * Custom Config Module: asset-type-config
 * Configures labels, Lucide icons, and default canvas sizes for each asset kind.
 */

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

import type { CreatableAssetKind } from "@/types/asset-kind";

export type AssetTypeConfig = {
  label: string;
  icon: LucideIcon;
  defaultCanvasSize?: string;
};

const assetTypeConfigs: Record<CreatableAssetKind, AssetTypeConfig> = {
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

export function getAssetTypeConfig(kind: CreatableAssetKind) {
  return assetTypeConfigs[kind];
}
