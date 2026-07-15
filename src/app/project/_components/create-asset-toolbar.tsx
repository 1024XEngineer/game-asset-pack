import { Button } from "@/components/ui/button";

import type { AssetKind, ProjectSummary } from "../_data/project-demo-data";
import { AssetKindIcon } from "./asset-kind-icon";
import { CreateAssetDialog } from "./create-asset-dialog";

const labels: Record<AssetKind, string> = {
  character: "Character",
  object: "Object",
  tiles: "Tiles",
};

export function CreateAssetToolbar({
  assetKinds,
  project,
}: {
  assetKinds: AssetKind[];
  project: ProjectSummary;
}) {
  return (
    <CreateAssetDialog project={project}>
      {(openDialog) => (
        <div className="grid grid-cols-1 rounded-2xl border bg-background p-1 shadow-sm sm:grid-cols-3">
          {assetKinds.map((kind) => (
            <Button
              key={kind}
              type="button"
              variant="ghost"
              className="h-10 justify-start rounded-xl px-3 text-sm sm:justify-center lg:px-4"
              onClick={() => openDialog(kind)}
            >
              <AssetKindIcon kind={kind} className="size-5" />
              Create {labels[kind]}
            </Button>
          ))}
        </div>
      )}
    </CreateAssetDialog>
  );
}
