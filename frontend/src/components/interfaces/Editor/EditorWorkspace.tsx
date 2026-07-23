import { Button } from "@/components/ui/button";
import type { EditorWorkspaceAsset } from "./EditorWorkspaceScreen";
import { CharacterEditorMode } from "./EditorModes/CharacterEditorMode";
import { SceneryEditorMode } from "./EditorModes/SceneryEditorMode";
import { SpriteSheetEditorMode } from "./EditorModes/SpriteSheetEditorMode";
import { EditorHeader } from "./Header/EditorHeader";
import { useEditorWorkspaceSession } from "./useEditorWorkspaceSession";

export function EditorWorkspace({
  asset,
  projectName,
  onBack,
}: {
  asset?: EditorWorkspaceAsset;
  projectName?: string;
  onBack: () => void;
}) {
  const workspace = useEditorWorkspaceSession(asset);

  if (!projectName || !asset) {
    return (
      <div className="grid h-full place-items-center bg-[#f7f5f0] px-6 text-[#2d2923]">
        <div className="text-center">
          <p className="font-serif text-2xl">Asset not found</p>
          <Button className="mt-4" onClick={onBack}>
            Back to project
          </Button>
        </div>
      </div>
    );
  }

  const renderHeader = (_selection: string) => (
    <EditorHeader
      assetName={asset.name}
      version={asset.version}
      projectName={projectName}
      onBack={onBack}
      status={workspace.status}
      canUndo={workspace.canUndo}
      canRedo={workspace.canRedo}
      onUndo={workspace.undo}
      onRedo={workspace.redo}
      onSave={() => void workspace.save()}
    />
  );
  const modeProps = {
    prompt: workspace.document.prompt,
    history: asset.history,
    characterNodePositions: workspace.document.character?.nodePositions,
    onAction: workspace.reportAction,
    onCharacterPositionChange: workspace.setCharacterNodePosition,
    onPromptChange: workspace.setPrompt,
    renderHeader,
  };

  return (
    <div className="asset-workspace-shell flex h-screen min-h-0 w-screen flex-col overflow-hidden bg-[#f7f5f0] text-[#2d2923] selection:bg-[#d99096] selection:text-[#2d2923]">
      {asset.kind === "character" || asset.kind === "object" ? (
        <CharacterEditorMode {...modeProps} />
      ) : asset.kind === "scenery" ? (
        <SceneryEditorMode {...modeProps} />
      ) : (
        <SpriteSheetEditorMode {...modeProps} kind={asset.kind} />
      )}
    </div>
  );
}
