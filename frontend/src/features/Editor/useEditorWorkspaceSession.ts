import { useEffect, useState } from "react";
import { useStore } from "zustand";

import { useTimeout } from "@/hooks/use-timeout";
import { useSaveAssetRevisionMutation } from "@/api/asset/asset-save-revision.mutation";
import {
  initializeEditorWorkspace,
  markEditorWorkspaceSaved,
  redoEditorWorkspace,
  undoEditorWorkspace,
  useEditorWorkspaceStore,
} from "./editor-workspace-store";
import type {
  AssetEditorDocument,
  EditorWorkspaceAsset,
} from "@/types/editor-document";

const savedStatus = "All changes saved";

export function useEditorWorkspaceSession(
  asset: EditorWorkspaceAsset | undefined,
  initialDocument: AssetEditorDocument | undefined,
) {
  const [status, setStatus] = useState(savedStatus);
  const { schedule: scheduleStatusReset } = useTimeout();
  const saveRevisionMutation = useSaveAssetRevisionMutation();
  const document = useEditorWorkspaceStore((state) => state.document);
  const savedDocument = useEditorWorkspaceStore((state) => state.savedDocument);
  const setPrompt = useEditorWorkspaceStore((state) => state.setPrompt);
  const setCharacterNodePosition = useEditorWorkspaceStore(
    (state) => state.setCharacterNodePosition,
  );
  const canUndo = useStore(
    useEditorWorkspaceStore.temporal,
    (state) => state.pastStates.length > 0,
  );
  const canRedo = useStore(
    useEditorWorkspaceStore.temporal,
    (state) => state.futureStates.length > 0,
  );

  useEffect(() => {
    initializeEditorWorkspace(initialDocument ?? { prompt: "" });
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
        markEditorWorkspaceSaved(document);
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
      redoEditorWorkspace();
      reportAction("Edit restored");
    },
    undo: () => {
      undoEditorWorkspace();
      reportAction("Last edit reverted");
    },
  };
}
