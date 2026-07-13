import { Button } from "@/components/ui/button";

import type { AssetKind } from "../_data/project-demo-data";
import { AssetKindIcon } from "./asset-kind-icon";
import { CreateAssetDialog } from "./create-asset-dialog";

const labels: Record<AssetKind, string> = {
  character: "Character",
  object: "Object",
  tiles: "Tiles",
};

export function CreateAssetToolbar({ assetKinds }: { assetKinds: AssetKind[] }) {
  return (
    <CreateAssetDialog>
      {(openDialog) => (
        <div className="flex rounded-lg border bg-card p-1 shadow-sm">
          {assetKinds.map((kind) => (
            <Button
              key={kind}
              variant="outline"
              size="sm"
              className="rounded-md border-transparent bg-transparent"
              onClick={() => openDialog(kind)}
            >
              <AssetKindIcon kind={kind} data-icon="inline-start" />
              Create {labels[kind]}
            </Button>
          ))}
        </div>
      )}
    </CreateAssetDialog>
  );
}
