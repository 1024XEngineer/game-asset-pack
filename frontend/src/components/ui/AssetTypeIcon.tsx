import type { ComponentProps } from "react";
import type { CreatableAssetKind } from "@/types/asset-kind";
import { getAssetTypeConfig } from "./asset-type-config";

export function AssetTypeIcon({
  kind,
  ...props
}: { kind: CreatableAssetKind } & ComponentProps<
  ReturnType<typeof getAssetTypeConfig>["icon"]
>) {
  const Icon = getAssetTypeConfig(kind).icon;

  return <Icon {...props} />;
}
