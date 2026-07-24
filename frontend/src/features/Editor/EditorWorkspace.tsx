import { useEffect, useState } from "react";

import type {
  EditorCanvasPosition,
  EditorDocumentData,
} from "@/types/editor-document";
import { useAssetEditorSession } from "@/modules/asset-editor-session";
import { useTimeout } from "@/hooks/use-timeout";

import { CharacterEditorMode } from "./EditorModes/CharacterEditorMode";
import { SceneryEditorMode } from "./EditorModes/SceneryEditorMode";
import { SpriteSheetEditorMode } from "./EditorModes/SpriteSheetEditorMode";
import { EditorHeader } from "./Header/EditorHeader";

export function EditorWorkspace({
  data,
  onBack,
}: {
  data: EditorDocumentData;
  onBack: () => void;
}) {
  const { asset, projectName } = data;
  const session = useAssetEditorSession({
    target: {
      projectId: asset.projectId,
      assetId: asset.id,
    },
    initialDocument: data.document,
  });
  const { snapshot } = session;
  const [notice, setNotice] = useState<string | null>(null);
  const { schedule: scheduleNoticeReset } = useTimeout();

  useEffect(() => {
    setNotice(null);
  }, [asset.projectId, asset.id]);

  const reportAction = (message: string) => {
    setNotice(message);
    scheduleNoticeReset(() => setNotice(null), 2200);
  };
  const status =
    snapshot.saveState.phase === "saving"
      ? "Saving changes"
      : (notice ??
        (snapshot.saveState.phase === "failed"
          ? snapshot.saveState.message
          : snapshot.dirty
            ? "Unsaved changes"
            : "All changes saved"));
  const undo = () => {
    session.dispatch({ type: "history.undo" });
    reportAction("Last edit reverted");
  };
  const redo = () => {
    session.dispatch({ type: "history.redo" });
    reportAction("Edit restored");
  };
  const save = async () => {
    const result = await session.save();
    if (result.status === "saved") reportAction("Saved just now");
    if (result.status === "failed") reportAction("Save failed");
  };

  const renderHeader = (_selection: string) => (
    <EditorHeader
      assetName={asset.name}
      version={asset.version}
      projectName={projectName}
      onBack={onBack}
      status={status}
      canUndo={snapshot.canUndo}
      canRedo={snapshot.canRedo}
      isSaving={snapshot.saveState.phase === "saving"}
      onUndo={undo}
      onRedo={redo}
      onSave={() => void save()}
    />
  );
  const modeProps = {
    prompt: snapshot.document.prompt,
    history: asset.history,
    characterNodePositions: snapshot.document.character?.nodePositions,
    characterAnimations: snapshot.document.character?.animations ?? [],
    onAction: reportAction,
    onCharacterPositionChange: (
      nodeId: string,
      position: EditorCanvasPosition,
    ) =>
      session.dispatch({
        type: "character.node-position.set",
        nodeId,
        position,
      }),
    onPromptChange: (value: string) =>
      session.dispatch({ type: "prompt.set", value }),
    renderHeader,
  };

  return (
    <div className="asset-workspace-shell flex h-screen min-h-0 w-screen flex-col overflow-hidden bg-[#f7f5f0] text-[#2d2923] selection:bg-[#d99096] selection:text-[#2d2923]">
      {asset.kind === "character" || asset.kind === "object" ? (
        <CharacterEditorMode {...modeProps} />
      ) : asset.kind === "scenery" ? (
        <SceneryEditorMode
          {...modeProps}
          layers={snapshot.document.scenery?.layers ?? []}
        />
      ) : (
        <SpriteSheetEditorMode
          {...modeProps}
          spriteSheet={snapshot.document.spriteSheet}
        />
      )}
    </div>
  );
}
