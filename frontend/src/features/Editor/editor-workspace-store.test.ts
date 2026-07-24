import { beforeEach, describe, expect, it } from "vitest";

import {
  initializeEditorWorkspace,
  redoEditorWorkspace,
  undoEditorWorkspace,
  useEditorWorkspaceStore,
} from "./editor-workspace-store";

beforeEach(() => {
  initializeEditorWorkspace({ prompt: "Base prompt" });
});

describe("editor workspace draft", () => {
  it("keeps prompt and canvas position edits in the same undo history", () => {
    useEditorWorkspaceStore.getState().setPrompt("Add a blue scarf");
    useEditorWorkspaceStore
      .getState()
      .setCharacterNodePosition("prototype", { x: 120, y: 160 });

    undoEditorWorkspace();
    expect(useEditorWorkspaceStore.getState().document).toEqual({
      prompt: "Add a blue scarf",
    });

    undoEditorWorkspace();
    expect(useEditorWorkspaceStore.getState().document).toEqual({
      prompt: "Base prompt",
    });

    redoEditorWorkspace();
    redoEditorWorkspace();
    expect(useEditorWorkspaceStore.getState().document).toEqual({
      prompt: "Add a blue scarf",
      character: {
        nodePositions: { prototype: { x: 120, y: 160 } },
      },
    });
  });
});
