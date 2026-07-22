import type { AssetKind } from "@/shared/types/asset-kind";

import { Workspace } from "./workspace";

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
  return <Workspace asset={asset} projectName={projectName} onBack={onBack} />;
}
