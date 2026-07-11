import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import type { ProjectAsset } from "../_data/project-demo-data";
import { AssetPreview } from "./asset-preview";

export function AssetCard({
  asset,
  accentClassName,
}: {
  asset: ProjectAsset;
  accentClassName: string;
}) {
  return (
    <Card className="gap-0 rounded-lg py-0 shadow-sm" size="sm">
      <AssetPreview accentClassName={accentClassName} />
      <CardHeader className="px-3 pt-3">
        <CardTitle className="truncate text-sm">{asset.name}</CardTitle>
        <Badge variant="outline" className="rounded-md">
          {asset.version}
        </Badge>
      </CardHeader>
      <CardContent className="px-3 pt-1">
        <p className="truncate text-xs text-muted-foreground">{asset.description}</p>
      </CardContent>
      <CardFooter className="mt-3 justify-between px-3 py-3">
        <span className="text-xs text-muted-foreground">{asset.status}</span>
        <Button variant="outline" size="xs">
          Open
        </Button>
      </CardFooter>
    </Card>
  );
}
