import type { AssetKind } from "@/types/asset-kind";
import type { AssetRecord } from "@/types/asset-record";

import { EditorWorkspace } from "./EditorWorkspace";

export type EditorWorkspaceAsset = {
  id: string;
  projectId: string;
  kind: AssetKind;
  name: string;
  version: string;
  history: AssetRecord[];
};

export function EditorWorkspaceScreen({
  asset,
  projectName,
  onBack,
}: {
  asset?: EditorWorkspaceAsset;
  projectName?: string;
  onBack: () => void;
}) {
  return (
    <EditorWorkspace asset={asset} projectName={projectName} onBack={onBack} />
  );
}
