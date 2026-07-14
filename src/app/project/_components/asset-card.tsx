import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { ProjectAsset } from "../_data/project-demo-data";
import type { AssetKind } from "../_data/project-demo-data";
import { AssetKindIcon } from "./asset-kind-icon";
import { AssetPreview } from "./asset-preview";

export function AssetCard({
  asset,
  accentClassName,
  kind,
  kindLabel,
  projectId,
}: {
  asset: ProjectAsset;
  accentClassName: string;
  kind: AssetKind;
  kindLabel: string;
  projectId: string;
}) {
  return (
    <Link
      href={`/project/assets/${asset.id}?project=${projectId}`}
      className="block rounded-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <Card
        className="gap-0 rounded-xl py-0 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        size="sm"
      >
        <AssetPreview accentClassName={accentClassName} className="aspect-[4/3]" />
        <CardHeader className="px-3 pt-3">
          <CardTitle className="truncate text-sm font-semibold">{asset.name}</CardTitle>
          <Badge variant="outline" className="rounded-md font-normal">
            {asset.version}
          </Badge>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-2">
          <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <AssetKindIcon kind={kind} className="size-3.5" />
            <span className="truncate">{kindLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="shrink-0">{asset.canvasSize.replace(" px", "")}</span>
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
