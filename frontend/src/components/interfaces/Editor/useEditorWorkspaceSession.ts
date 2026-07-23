import { useEffect, useState } from "react";
import { useStore } from "zustand";

import { useTimeout } from "@/hooks/use-timeout";
import {
  initializeEditorWorkspace,
  redoEditorWorkspace,
  saveEditorWorkspace,
  undoEditorWorkspace,
  useEditorWorkspaceStore,
} from "./editor-workspace-store";
import { defaultEditorPrompt } from "./Editor.constants";

const savedStatus = "All changes saved";

export function useEditorWorkspaceSession(assetId: string | undefined) {
  const [status, setStatus] = useState(savedStatus);
  const { schedule: scheduleStatusReset } = useTimeout();
  const prompt = useEditorWorkspaceStore((state) => state.prompt);
  const saveHistory = useEditorWorkspaceStore((state) => state.saveHistory);
  const setPrompt = useEditorWorkspaceStore((state) => state.setPrompt);
  const canUndo = useStore(
    useEditorWorkspaceStore.temporal,
    (state) => state.pastStates.length > 0,
  );
  const canRedo = useStore(
    useEditorWorkspaceStore.temporal,
    (state) => state.futureStates.length > 0,
  );

  useEffect(() => {
    initializeEditorWorkspace(defaultEditorPrompt);
    setStatus(savedStatus);
  }, [assetId]);

  const reportAction = (message: string) => {
    setStatus(message);
    scheduleStatusReset(() => setStatus(savedStatus), 2200);
  };

  return {
    canRedo,
    canUndo,
    prompt,
    reportAction,
    save: (selection: string) => {
      saveEditorWorkspace(selection);
      reportAction("Saved just now");
    },
    saveHistory,
    setPrompt,
    status,
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
