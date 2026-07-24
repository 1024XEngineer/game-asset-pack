import { createStore } from "zustand";
import { temporal } from "zundo";

import type {
  AssetEditorDocument,
  EditorCanvasPosition,
} from "@/types/editor-document";

import type {
  AssetEditorCommand,
  AssetEditorSaveState,
  AssetEditorSessionSnapshot,
} from "./AssetEditorSession.interface";

type AssetEditorSessionState = {
  document: AssetEditorDocument;
  savedDocument: AssetEditorDocument;
  setPrompt: (prompt: string) => void;
  setCharacterNodePosition: (
    nodeId: string,
    position: EditorCanvasPosition,
  ) => void;
};

export function createAssetEditorSessionStore(
  initialDocument: AssetEditorDocument,
) {
  const document = structuredClone(initialDocument);

  return createStore<AssetEditorSessionState>()(
    temporal(
      (set) => ({
        document,
        savedDocument: structuredClone(initialDocument),
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
      }),
      {
        limit: 100,
        partialize: (state) => ({
          document: state.document,
        }),
      },
    ),
  );
}

export type AssetEditorSessionStore = ReturnType<
  typeof createAssetEditorSessionStore
>;

export function resetAssetEditorSessionStore(
  store: AssetEditorSessionStore,
  document: AssetEditorDocument,
) {
  store.setState({
    document: structuredClone(document),
    savedDocument: structuredClone(document),
  });
  store.temporal.getState().clear();
}

export function markAssetEditorSessionSaved(
  store: AssetEditorSessionStore,
  document: AssetEditorDocument,
) {
  store.setState({ savedDocument: structuredClone(document) });
}

export function dispatchAssetEditorCommand(
  store: AssetEditorSessionStore,
  command: AssetEditorCommand,
) {
  switch (command.type) {
    case "prompt.set":
      store.getState().setPrompt(command.value);
      return;
    case "character.node-position.set":
      store
        .getState()
        .setCharacterNodePosition(command.nodeId, command.position);
      return;
    case "history.undo":
      store.temporal.getState().undo();
      return;
    case "history.redo":
      store.temporal.getState().redo();
  }
}

export function getAssetEditorSessionSnapshot(
  store: AssetEditorSessionStore,
  saveState: AssetEditorSaveState,
): AssetEditorSessionSnapshot {
  const state = store.getState();
  const temporalState = store.temporal.getState();

  return {
    document: state.document,
    dirty:
      JSON.stringify(state.document) !== JSON.stringify(state.savedDocument),
    canUndo: temporalState.pastStates.length > 0,
    canRedo: temporalState.futureStates.length > 0,
    saveState,
  };
}
