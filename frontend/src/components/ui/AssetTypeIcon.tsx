import type { ComponentProps } from "react";
import {
  getAssetTypeAdapter,
  type CreatableAssetKind,
} from "@/types/asset-kind";

export function AssetTypeIcon({
  kind,
  ...props
}: { kind: CreatableAssetKind } & ComponentProps<
  ReturnType<typeof getAssetTypeAdapter>["icon"]
>) {
  const Icon = getAssetTypeAdapter(kind).icon;

  return <Icon {...props} />;
}
