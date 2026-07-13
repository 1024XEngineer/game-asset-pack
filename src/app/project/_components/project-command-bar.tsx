import { WandSparkles } from "lucide-react";

import { Input } from "@/components/ui/input";

import type { AssetKind } from "../_data/project-demo-data";
import { AssetFilters } from "./asset-filters";
import { CreateAssetToolbar } from "./create-asset-toolbar";

export function ProjectCommandBar({
  prompt,
  query,
  selectedKinds,
  assetKinds,
  projectName,
  onPromptChange,
  onQueryChange,
  onSelectedKindsChange,
}: {
  prompt: string;
  query: string;
  selectedKinds: AssetKind[];
  assetKinds: AssetKind[];
  projectName: string;
  onPromptChange: (prompt: string) => void;
  onQueryChange: (query: string) => void;
  onSelectedKindsChange: (kinds: AssetKind[]) => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border bg-card p-2 shadow-sm">
        <WandSparkles className="ml-2 size-5 shrink-0 text-muted-foreground" />
        <Input
          aria-label="Quick create description"
          className="h-10 min-w-0 flex-1 border-0 bg-transparent px-2 shadow-none focus-visible:ring-0"
          placeholder="Describe an asset to create..."
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
        />
        <CreateAssetToolbar assetKinds={assetKinds} prompt={prompt} projectName={projectName} />
      </div>
      <AssetFilters
        query={query}
        selectedKinds={selectedKinds}
        onQueryChange={onQueryChange}
        onSelectedKindsChange={onSelectedKindsChange}
      />
    </div>
  );
}
