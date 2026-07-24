import { create } from "zustand";
import { temporal } from "zundo";

import type {
  AssetEditorDocument,
  EditorCanvasPosition,
} from "@/types/editor-document";

type AssetEditorSessionStore = {
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

export const useAssetEditorSessionStore = create<AssetEditorSessionStore>()(
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

export function initializeAssetEditorSession(document: AssetEditorDocument) {
  useAssetEditorSessionStore.getState().reset(document);
  useAssetEditorSessionStore.temporal.getState().clear();
}

export function markAssetEditorSessionSaved(document: AssetEditorDocument) {
  useAssetEditorSessionStore.getState().markSaved(document);
}

export function undoAssetEditorSession() {
  useAssetEditorSessionStore.temporal.getState().undo();
}

export function redoAssetEditorSession() {
  useAssetEditorSessionStore.temporal.getState().redo();
}
