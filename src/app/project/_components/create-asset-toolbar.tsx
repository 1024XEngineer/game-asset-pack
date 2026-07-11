import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { AssetKind } from "../_data/project-demo-data";
import { AssetKindIcon } from "./asset-kind-icon";

const labels: Record<AssetKind, string> = {
  character: "Character",
  object: "Object",
  tiles: "Tiles",
};

export function CreateAssetToolbar({ assetKinds }: { assetKinds: AssetKind[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-56">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="bg-card pl-8" placeholder="Search assets" />
      </div>
      <div className="flex rounded-lg border bg-card p-1 shadow-sm">
        {assetKinds.map((kind, index) => (
          <Button
            key={kind}
            variant={index === 0 ? "default" : "ghost"}
            size="sm"
            className="rounded-md"
          >
            <AssetKindIcon kind={kind} data-icon="inline-start" />
            Create {labels[kind]}
          </Button>
        ))}
      </div>
    </div>
  );
}
