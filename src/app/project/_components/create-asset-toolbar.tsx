import { Button } from "@/components/ui/button";

import type { CreatableAssetKind, ProjectSummary } from "../_data/project-demo-data";
import { AssetKindIcon } from "./asset-kind-icon";
import { CreateAssetDialog, type CreationRequest } from "./create-asset-dialog";

const labels: Record<CreatableAssetKind, string> = {
  character: "Character",
  object: "Object",
  tiles: "Tiles",
  scenery: "Scenery",
  background: "Background",
  ui: "UI",
  audio: "Audio",
};

export function CreateAssetToolbar({
  assetKinds,
  onCreate,
  project,
}: {
  assetKinds: CreatableAssetKind[];
  onCreate: (request: CreationRequest) => void;
  project: ProjectSummary;
}) {
  return (
    <CreateAssetDialog project={project} onCreate={onCreate}>
      {(openDialog) => (
        <div className="grid grid-cols-1 rounded-2xl border bg-background p-1 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
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
