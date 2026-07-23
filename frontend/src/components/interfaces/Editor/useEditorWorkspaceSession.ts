import { useEffect, useState } from "react";
import { useStore } from "zustand";

import { useTimeout } from "@/hooks/use-timeout";
import { useSaveAssetRevisionMutation } from "@/data/asset/asset-save-revision.mutation";
import {
  initializeEditorWorkspace,
  markEditorWorkspaceSaved,
  redoEditorWorkspace,
  undoEditorWorkspace,
  useEditorWorkspaceStore,
} from "./editor-workspace-store";
import { defaultEditorPrompt } from "./Editor.constants";
import type { EditorWorkspaceAsset } from "./EditorWorkspaceScreen";

const savedStatus = "All changes saved";

export function useEditorWorkspaceSession(
  asset: EditorWorkspaceAsset | undefined,
) {
  const [status, setStatus] = useState(savedStatus);
  const { schedule: scheduleStatusReset } = useTimeout();
  const { mutateAsync: saveRevision } = useSaveAssetRevisionMutation();
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
    const currentRecord = asset?.history.find((record) => record.isCurrent);
    initializeEditorWorkspace(
      currentRecord?.editorDocument ?? { prompt: defaultEditorPrompt },
    );
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
    reportAction,
    save: async () => {
      if (!asset) return;
      setStatus("Saving changes");
      try {
        await saveRevision({
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
