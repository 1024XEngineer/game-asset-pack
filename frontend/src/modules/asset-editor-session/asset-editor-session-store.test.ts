import { beforeEach, describe, expect, it } from "vitest";

import {
  initializeAssetEditorSession,
  markAssetEditorSessionSaved,
  redoAssetEditorSession,
  undoAssetEditorSession,
  useAssetEditorSessionStore,
} from "./asset-editor-session-store";

beforeEach(() => {
  initializeAssetEditorSession({ prompt: "Base prompt" });
});

describe("asset editor session draft", () => {
  it("clones the initial document and clears prior history", () => {
    const initialDocument = {
      prompt: "New asset",
      character: {
        nodePositions: { prototype: { x: 20, y: 40 } },
      },
    };

    useAssetEditorSessionStore.getState().setPrompt("Temporary edit");
    initializeAssetEditorSession(initialDocument);
    initialDocument.character.nodePositions.prototype.x = 999;

    expect(useAssetEditorSessionStore.getState().document).toEqual({
      prompt: "New asset",
      character: {
        nodePositions: { prototype: { x: 20, y: 40 } },
      },
    });
    expect(
      useAssetEditorSessionStore.temporal.getState().pastStates,
    ).toHaveLength(0);
  });

  it("keeps prompt and canvas position edits in the same undo history", () => {
    useAssetEditorSessionStore.getState().setPrompt("Add a blue scarf");
    useAssetEditorSessionStore
      .getState()
      .setCharacterNodePosition("prototype", { x: 120, y: 160 });

    undoAssetEditorSession();
    expect(useAssetEditorSessionStore.getState().document).toEqual({
      prompt: "Add a blue scarf",
    });

    undoAssetEditorSession();
    expect(useAssetEditorSessionStore.getState().document).toEqual({
      prompt: "Base prompt",
    });

    redoAssetEditorSession();
    redoAssetEditorSession();
    expect(useAssetEditorSessionStore.getState().document).toEqual({
      prompt: "Add a blue scarf",
      character: {
        nodePositions: { prototype: { x: 120, y: 160 } },
      },
    });
  });

  it("keeps a cloned saved baseline outside undo and redo history", () => {
    const savedDocument = { prompt: "Saved prompt" };

    markAssetEditorSessionSaved(savedDocument);
    savedDocument.prompt = "Mutated elsewhere";
    useAssetEditorSessionStore.getState().setPrompt("Unsaved prompt");

    expect(useAssetEditorSessionStore.getState().savedDocument).toEqual({
      prompt: "Saved prompt",
    });

    undoAssetEditorSession();
    expect(useAssetEditorSessionStore.getState().savedDocument).toEqual({
      prompt: "Saved prompt",
    });
  });
});
