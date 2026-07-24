import type { EditorDocumentData } from "@/types/editor-document";

import { CharacterEditorMode } from "./EditorModes/CharacterEditorMode";
import { SceneryEditorMode } from "./EditorModes/SceneryEditorMode";
import { SpriteSheetEditorMode } from "./EditorModes/SpriteSheetEditorMode";
import { EditorHeader } from "./Header/EditorHeader";
import { useEditorWorkspaceSession } from "./useEditorWorkspaceSession";

export function EditorWorkspace({
  data,
  onBack,
}: {
  data: EditorDocumentData;
  onBack: () => void;
}) {
  const { asset, projectName } = data;
  const workspace = useEditorWorkspaceSession(asset, data.document);

  const renderHeader = (_selection: string) => (
    <EditorHeader
      assetName={asset.name}
      version={asset.version}
      projectName={projectName}
      onBack={onBack}
      status={workspace.status}
      canUndo={workspace.canUndo}
      canRedo={workspace.canRedo}
      isSaving={workspace.isSaving}
      onUndo={workspace.undo}
      onRedo={workspace.redo}
      onSave={() => void workspace.save()}
    />
  );
  const modeProps = {
    prompt: workspace.document.prompt,
    history: asset.history,
    characterNodePositions: workspace.document.character?.nodePositions,
    characterAnimations: workspace.document.character?.animations ?? [],
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
        <SceneryEditorMode
          {...modeProps}
          layers={workspace.document.scenery?.layers ?? []}
        />
      ) : (
        <SpriteSheetEditorMode
          {...modeProps}
          spriteSheet={workspace.document.spriteSheet}
        />
      )}
    </div>
  );
}
