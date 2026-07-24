import { useEffect, useState } from "react";
import { useStore } from "zustand";

import { useTimeout } from "@/hooks/use-timeout";
import { useSaveAssetRevisionMutation } from "@/api/asset/asset-save-revision.mutation";
import {
  initializeAssetEditorSession,
  markAssetEditorSessionSaved,
  redoAssetEditorSession,
  undoAssetEditorSession,
  useAssetEditorSessionStore,
} from "./asset-editor-session-store";
import type {
  AssetEditorDocument,
  EditorWorkspaceAsset,
} from "@/types/editor-document";

const savedStatus = "All changes saved";

export function useAssetEditorSession(
  asset: EditorWorkspaceAsset | undefined,
  initialDocument: AssetEditorDocument | undefined,
) {
  const [status, setStatus] = useState(savedStatus);
  const { schedule: scheduleStatusReset } = useTimeout();
  const saveRevisionMutation = useSaveAssetRevisionMutation();
  const document = useAssetEditorSessionStore((state) => state.document);
  const savedDocument = useAssetEditorSessionStore(
    (state) => state.savedDocument,
  );
  const setPrompt = useAssetEditorSessionStore((state) => state.setPrompt);
  const setCharacterNodePosition = useAssetEditorSessionStore(
    (state) => state.setCharacterNodePosition,
  );
  const canUndo = useStore(
    useAssetEditorSessionStore.temporal,
    (state) => state.pastStates.length > 0,
  );
  const canRedo = useStore(
    useAssetEditorSessionStore.temporal,
    (state) => state.futureStates.length > 0,
  );

  useEffect(() => {
    initializeAssetEditorSession(initialDocument ?? { prompt: "" });
    setStatus(savedStatus);
  }, [asset?.id]);

  const reportAction = (message: string) => {
    setStatus(message);
    scheduleStatusReset(() => setStatus(savedStatus), 2200);
  };
  const hasUnsavedChanges =
    JSON.stringify(document) !== JSON.stringify(savedDocument);

  return {
    canRedo,
    canUndo,
    document,
    isSaving: saveRevisionMutation.isPending,
    reportAction,
    save: async () => {
      if (!asset) return;
      setStatus("Saving changes");
      try {
        await saveRevisionMutation.mutateAsync({
          projectId: asset.projectId,
          assetId: asset.id,
          editorDocument: document,
        });
        markAssetEditorSessionSaved(document);
        reportAction("Saved just now");
      } catch {
        reportAction("Save failed");
      }
    },
    setCharacterNodePosition,
    setPrompt,
    status:
      status === savedStatus && hasUnsavedChanges ? "Unsaved changes" : status,
    redo: () => {
      redoAssetEditorSession();
      reportAction("Edit restored");
    },
    undo: () => {
      undoAssetEditorSession();
      reportAction("Last edit reverted");
    },
  };
}
