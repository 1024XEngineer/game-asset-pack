import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { AssetKind } from "../_data/project-demo-data";
import { AssetKindIcon } from "./asset-kind-icon";
import { CreateAssetDialog } from "./create-asset-dialog";

const labels: Record<AssetKind, string> = {
  character: "Character",
  object: "Object",
  tiles: "Tiles",
};

export function CreateAssetToolbar({
  assetKinds,
  prompt,
  projectName,
}: {
  assetKinds: AssetKind[];
  prompt: string;
  projectName: string;
}) {
  return (
    <CreateAssetDialog initialPrompt={prompt} projectName={projectName}>
      {(openDialog) => (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button size="lg" className="rounded-xl px-4" />}>
            Create
            <ChevronDown data-icon="inline-end" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {assetKinds.map((kind) => (
              <DropdownMenuItem key={kind} onClick={() => openDialog(kind)}>
                <AssetKindIcon kind={kind} />
                Create {labels[kind]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </CreateAssetDialog>
  );
}
