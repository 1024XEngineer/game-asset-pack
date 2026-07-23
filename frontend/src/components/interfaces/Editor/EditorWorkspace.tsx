"use client";

import { useEffect, useState } from "react";
import { useStore } from "zustand";

import { Button } from "@/components/ui/button";
import { useTimeout } from "@/hooks/use-timeout";
import { useEditorWorkspaceStore } from "@/store/editor-workspace-store";
import type { EditorWorkspaceAsset } from "./EditorWorkspaceScreen";
import { defaultEditorPrompt } from "./Editor.constants";
import { CharacterEditorMode } from "./EditorModes/CharacterEditorMode";
import { SceneryEditorMode } from "./EditorModes/SceneryEditorMode";
import { SpriteSheetEditorMode } from "./EditorModes/SpriteSheetEditorMode";
import { EditorHeader } from "./Header/EditorHeader";

export function EditorWorkspace({
  asset,
  projectName,
  onBack,
}: {
  asset?: EditorWorkspaceAsset;
  projectName?: string;
  onBack: () => void;
}) {
  const [status, setStatus] = useState("All changes saved");
  const { schedule: scheduleStatusReset } = useTimeout();
  const prompt = useEditorWorkspaceStore((state) => state.prompt);
  const saveHistory = useEditorWorkspaceStore((state) => state.saveHistory);
  const setPrompt = useEditorWorkspaceStore((state) => state.setPrompt);
  const addSaveHistory = useEditorWorkspaceStore(
    (state) => state.addSaveHistory,
  );
  const resetWorkspace = useEditorWorkspaceStore((state) => state.reset);
  const canUndo = useStore(
    useEditorWorkspaceStore.temporal,
    (state) => state.pastStates.length > 0,
  );
  const canRedo = useStore(
    useEditorWorkspaceStore.temporal,
    (state) => state.futureStates.length > 0,
  );

  useEffect(() => {
    resetWorkspace(defaultEditorPrompt);
    useEditorWorkspaceStore.temporal.getState().clear();
  }, [asset?.id, resetWorkspace]);

  if (!projectName || !asset) {
    return (
      <div className="grid h-full place-items-center bg-[#f7f5f0] px-6 text-[#2d2923]">
        <div className="text-center">
          <p className="font-serif text-2xl">Asset not found</p>
          <Button className="mt-4" onClick={onBack}>
            Back to project
          </Button>
        </div>
      </div>
    );
  }

  const handleAction = (message: string) => {
    setStatus(message);
    scheduleStatusReset(() => setStatus("All changes saved"), 2200);
  };
  const handleSave = (selection: string) => {
    const timestamp = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    addSaveHistory({
      id: `${Date.now()}-${saveHistory.length}`,
      savedAt: timestamp,
      description: prompt.trim() || "No description provided.",
      selection,
    });
    handleAction("Saved just now");
  };

  const renderHeader = (selection: string) => (
    <EditorHeader
      assetName={asset.name}
      version={asset.version}
      projectName={projectName}
      onBack={onBack}
      status={status}
      canUndo={canUndo}
      canRedo={canRedo}
      onUndo={() => {
        useEditorWorkspaceStore.temporal.getState().undo();
        handleAction("Last edit reverted");
      }}
      onRedo={() => {
        useEditorWorkspaceStore.temporal.getState().redo();
        handleAction("Edit restored");
      }}
      onSave={() => handleSave(selection)}
    />
  );
  const modeProps = {
    prompt,
    saveHistory,
    onAction: handleAction,
    onPromptChange: setPrompt,
    renderHeader,
  };

  return (
    <div className="asset-workspace-shell flex h-screen min-h-0 w-screen flex-col overflow-hidden bg-[#f7f5f0] text-[#2d2923] selection:bg-[#d99096] selection:text-[#2d2923]">
      {asset.kind === "character" || asset.kind === "object" ? (
        <CharacterEditorMode {...modeProps} />
      ) : asset.kind === "scenery" ? (
        <SceneryEditorMode {...modeProps} />
      ) : (
        <SpriteSheetEditorMode {...modeProps} kind={asset.kind} />
      )}
    </div>
  );
}
