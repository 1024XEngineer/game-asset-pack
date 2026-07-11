import { Box, Grid3X3, UserRound } from "lucide-react";
import type { ComponentProps } from "react";

import type { AssetKind } from "../_data/project-demo-data";

export function AssetKindIcon({
  kind,
  ...props
}: { kind: AssetKind } & ComponentProps<typeof UserRound>) {
  const Icon = {
    character: UserRound,
    object: Box,
    tiles: Grid3X3,
  }[kind];

  return <Icon {...props} />;
}
