import type { AssetKind } from "@/types/asset-kind";

import { EditorWorkspace } from "./EditorWorkspace";

export type EditorWorkspaceAsset = {
  id: string;
  kind: AssetKind;
  name: string;
  version: string;
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
  return <EditorWorkspace asset={asset} projectName={projectName} onBack={onBack} />;
}
