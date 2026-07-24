import { create } from "zustand";
import { temporal } from "zundo";

import type {
  AssetEditorDocument,
  EditorCanvasPosition,
} from "@/types/editor-document";

type EditorWorkspaceStore = {
  document: AssetEditorDocument;
  savedDocument: AssetEditorDocument;
  setPrompt: (prompt: string) => void;
  setCharacterNodePosition: (
    nodeId: string,
    position: EditorCanvasPosition,
  ) => void;
  reset: (document: AssetEditorDocument) => void;
  markSaved: (document: AssetEditorDocument) => void;
};

export const useEditorWorkspaceStore = create<EditorWorkspaceStore>()(
  temporal(
    (set) => ({
      document: { prompt: "" },
      savedDocument: { prompt: "" },
      setPrompt: (prompt) =>
        set((state) => ({ document: { ...state.document, prompt } })),
      setCharacterNodePosition: (nodeId, position) =>
        set((state) => ({
          document: {
            ...state.document,
            character: {
              nodePositions: {
                ...state.document.character?.nodePositions,
                [nodeId]: position,
              },
            },
          },
        })),
      reset: (document) =>
        set({
          document: structuredClone(document),
          savedDocument: structuredClone(document),
        }),
      markSaved: (document) =>
        set({ savedDocument: structuredClone(document) }),
    }),
    {
      limit: 100,
      partialize: (state) => ({
        document: state.document,
      }),
    },
  ),
);

export function initializeEditorWorkspace(document: AssetEditorDocument) {
  useEditorWorkspaceStore.getState().reset(document);
  useEditorWorkspaceStore.temporal.getState().clear();
}

export function markEditorWorkspaceSaved(document: AssetEditorDocument) {
  useEditorWorkspaceStore.getState().markSaved(document);
}

export function undoEditorWorkspace() {
  useEditorWorkspaceStore.temporal.getState().undo();
}

export function redoEditorWorkspace() {
  useEditorWorkspaceStore.temporal.getState().redo();
}
