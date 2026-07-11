import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { AssetGroup } from "../_data/project-demo-data";
import { AssetCard } from "./asset-card";
import { AssetKindIcon } from "./asset-kind-icon";

export function AssetSection({ group }: { group: AssetGroup }) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2">
        <AssetKindIcon kind={group.kind} className="size-4 text-muted-foreground" />
        <h2 className="text-base font-semibold">{group.title}</h2>
        <Badge variant="secondary">{group.assets.length}</Badge>
      </div>
      <div className="grid gap-3 xl:grid-cols-3">
        {group.assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} accentClassName={group.accentClassName} />
        ))}
      </div>
    </section>
  );
}

export function AssetSummaryCard({ group }: { group: AssetGroup }) {
  return (
    <Card className="rounded-lg shadow-sm" size="sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "grid size-8 place-items-center rounded-md text-white",
              group.accentClassName,
            )}
          >
            <AssetKindIcon kind={group.kind} className="size-4" />
          </span>
          <div>
            <CardTitle className="text-sm">{group.title}</CardTitle>
            <p className="text-xs text-muted-foreground">{group.assets.length} assets</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 text-xs text-muted-foreground">
        Project context enabled
      </CardContent>
    </Card>
  );
}
