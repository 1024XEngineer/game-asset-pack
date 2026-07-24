import { describe, expect, it } from "vitest";

import {
  createAssetEditorSessionStore,
  dispatchAssetEditorCommand,
  getAssetEditorSessionSnapshot,
  markAssetEditorSessionSaved,
  resetAssetEditorSessionStore,
} from "./asset-editor-session-store";

const idleSaveState = { phase: "idle" } as const;

describe("asset editor session commands", () => {
  it("creates an isolated clean snapshot", () => {
    const initialDocument = {
      prompt: "Base prompt",
      character: {
        nodePositions: { prototype: { x: 20, y: 40 } },
      },
    };
    const store = createAssetEditorSessionStore(initialDocument);

    initialDocument.character.nodePositions.prototype.x = 999;

    expect(getAssetEditorSessionSnapshot(store, idleSaveState)).toEqual({
      document: {
        prompt: "Base prompt",
        character: {
          nodePositions: { prototype: { x: 20, y: 40 } },
        },
      },
      dirty: false,
      canUndo: false,
      canRedo: false,
      saveState: idleSaveState,
    });
  });

  it("applies document commands as one undo step each", () => {
    const store = createAssetEditorSessionStore({ prompt: "Base prompt" });

    dispatchAssetEditorCommand(store, {
      type: "prompt.set",
      value: "Add a blue scarf",
    });
    dispatchAssetEditorCommand(store, {
      type: "character.node-position.set",
      nodeId: "prototype",
      position: { x: 120, y: 160 },
    });

    expect(getAssetEditorSessionSnapshot(store, idleSaveState)).toMatchObject({
      document: {
        prompt: "Add a blue scarf",
        character: {
          nodePositions: { prototype: { x: 120, y: 160 } },
        },
      },
      dirty: true,
      canUndo: true,
      canRedo: false,
    });

    dispatchAssetEditorCommand(store, { type: "history.undo" });
    expect(store.getState().document).toEqual({
      prompt: "Add a blue scarf",
    });

    dispatchAssetEditorCommand(store, { type: "history.undo" });
    expect(getAssetEditorSessionSnapshot(store, idleSaveState)).toMatchObject({
      document: { prompt: "Base prompt" },
      dirty: false,
      canUndo: false,
      canRedo: true,
    });

    dispatchAssetEditorCommand(store, { type: "history.redo" });
    dispatchAssetEditorCommand(store, { type: "history.redo" });
    expect(store.getState().document).toEqual({
      prompt: "Add a blue scarf",
      character: {
        nodePositions: { prototype: { x: 120, y: 160 } },
      },
    });
  });

  it("resets the draft, saved baseline, and history together", () => {
    const store = createAssetEditorSessionStore({ prompt: "Base prompt" });
    dispatchAssetEditorCommand(store, {
      type: "prompt.set",
      value: "Temporary edit",
    });

    resetAssetEditorSessionStore(store, { prompt: "Replacement document" });

    expect(getAssetEditorSessionSnapshot(store, idleSaveState)).toEqual({
      document: { prompt: "Replacement document" },
      dirty: false,
      canUndo: false,
      canRedo: false,
      saveState: idleSaveState,
    });
  });

  it("marks a cloned save baseline without changing history", () => {
    const store = createAssetEditorSessionStore({ prompt: "Base prompt" });
    dispatchAssetEditorCommand(store, {
      type: "prompt.set",
      value: "Saved prompt",
    });
    const savedDocument = structuredClone(store.getState().document);

    markAssetEditorSessionSaved(store, savedDocument);
    savedDocument.prompt = "Mutated elsewhere";

    expect(getAssetEditorSessionSnapshot(store, idleSaveState)).toMatchObject({
      document: { prompt: "Saved prompt" },
      dirty: false,
      canUndo: true,
    });
  });
});
