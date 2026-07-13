import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { ProjectAsset } from "../_data/project-demo-data";
import { AssetPreview } from "./asset-preview";

export function AssetCard({
  asset,
  accentClassName,
  projectId,
}: {
  asset: ProjectAsset;
  accentClassName: string;
  projectId: string;
}) {
  return (
    <Link
      href={`/project/assets/${asset.id}?project=${projectId}`}
      className="block rounded-lg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <Card className="gap-0 rounded-lg py-0 shadow-sm transition-shadow hover:shadow-md" size="sm">
        <AssetPreview accentClassName={accentClassName} />
        <CardHeader className="px-3 pt-3">
          <CardTitle className="truncate text-sm">{asset.name}</CardTitle>
          <Badge variant="outline" className="rounded-md">
            {asset.version}
          </Badge>
        </CardHeader>
        <CardContent className="px-3 pt-1 pb-3">
          <p className="truncate text-xs text-muted-foreground">{asset.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
