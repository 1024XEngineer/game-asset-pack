import { Box, Grid3X3, UserRound, Volume2 } from "lucide-react";
import type { ComponentProps } from "react";

import type { CreatableAssetKind } from "../_data/project-demo-data";

export function AssetKindIcon({
  kind,
  ...props
}: { kind: CreatableAssetKind } & ComponentProps<typeof UserRound>) {
  const Icon = {
    character: UserRound,
    object: Box,
    tiles: Grid3X3,
    audio: Volume2,
  }[kind];

  return <Icon {...props} />;
}
