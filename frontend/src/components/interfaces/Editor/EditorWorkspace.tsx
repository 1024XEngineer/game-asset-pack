"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { EditorWorkspaceAsset } from "./EditorWorkspaceScreen";
import { defaultEditorPrompt, nodeMeta } from "./Editor.constants";
import { CharacterStage } from "./Canvas/CharacterStage";
import { SceneryStage } from "./Canvas/SceneryStage";
import { SpriteSheetStage } from "./Canvas/SpriteSheetStage";
import { useCharacterStageMachine } from "./Canvas/StateMachine/characterStageMachine";
import { useSceneryStageMachine } from "./Canvas/StateMachine/sceneryStageMachine";
import {
  STATIC_TILE_POSITIONS,
  useSpriteSheetStageMachine,
} from "./Canvas/StateMachine/spriteSheetStageMachine";
import { EditorHeader } from "./Header/EditorHeader";
import { Inspector, type SaveHistoryEntry } from "./Inspector/Inspector";
import { AssetTree } from "./AssetTree/AssetTree";
import { SceneryLayerTree } from "./AssetTree/SceneryLayerTree";
import { StaticAssetTree } from "./AssetTree/StaticAssetTree";

export function EditorWorkspace({
  asset,
  projectName,
  onBack,
}: {
  asset?: EditorWorkspaceAsset;
  projectName?: string;
  onBack: () => void;
}) {
  const characterStage = useCharacterStageMachine();
  const sceneryStage = useSceneryStageMachine();
  const spriteSheetStage = useSpriteSheetStageMachine();
  const [status, setStatus] = useState("All changes saved");
  const [canUndo, setCanUndo] = useState(true);
  const [canRedo, setCanRedo] = useState(false);
  const [prompt, setPrompt] = useState(defaultEditorPrompt);
  const [saveHistory, setSaveHistory] = useState<SaveHistoryEntry[]>([]);
  const usesCharacterEditor =
    asset?.kind === "character" || asset?.kind === "object";
  const usesSceneryEditor = asset?.kind === "scenery";
  const staticSelections = [
    ...spriteSheetStage.selectedItems,
    ...spriteSheetStage.selectedTiles.map((tile) => {
      const separator = tile.lastIndexOf(":");
      const item = tile.slice(0, separator);
      const tileIndex = Number(tile.slice(separator + 1));
      return item === "Canvas"
        ? `Tile ${tileIndex + 1}`
        : `${item} / ${STATIC_TILE_POSITIONS[item]?.[tileIndex] ?? `Tile ${tileIndex + 1}`}`;
    }),
  ];
  const editorSelections = usesSceneryEditor
    ? sceneryStage.selectedLayers
    : staticSelections;

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
    window.setTimeout(() => setStatus("All changes saved"), 2200);
  };
  const handleSave = () => {
    const timestamp = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    setSaveHistory((current) => [
      {
        id: `${Date.now()}-${current.length}`,
        savedAt: timestamp,
        description: prompt.trim() || "No description provided.",
        selection: editorSelections.length
          ? editorSelections.join(", ")
          : characterStage.selectedNodes.length
            ? characterStage.selectedNodes
                .map((node) => nodeMeta[node].label)
                .join(", ")
            : "Nothing selected",
      },
      ...current,
    ]);
    handleAction("Saved just now");
  };

  return (
    <div className="asset-workspace-shell flex h-screen min-h-0 w-screen flex-col overflow-hidden bg-[#f7f5f0] text-[#2d2923] selection:bg-[#d99096] selection:text-[#2d2923]">
      <EditorHeader
        assetName={asset.name}
        version={asset.version}
        projectName={projectName}
        onBack={onBack}
        status={status}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => {
          setCanUndo(false);
          setCanRedo(true);
          handleAction("Last edit reverted");
        }}
        onRedo={() => {
          setCanUndo(true);
          setCanRedo(false);
          handleAction("Edit restored");
        }}
        onSave={handleSave}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        {usesCharacterEditor ? (
          <AssetTree
            selectedNode={characterStage.selectedNode}
            selectedFrames={characterStage.selectedFrames}
            onSelect={characterStage.selectNode}
            onSelectFrame={characterStage.selectFrame}
          />
        ) : usesSceneryEditor ? (
          <SceneryLayerTree
            selectedLayers={sceneryStage.selectedLayers}
            visibleLayers={sceneryStage.visibleLayers}
            onToggleLayer={sceneryStage.toggleLayer}
            onToggleVisibility={sceneryStage.toggleVisibility}
          />
        ) : (
          <StaticAssetTree
            kind={asset.kind === "tiles" ? "tiles" : "object"}
            selectedItems={spriteSheetStage.selectedItems}
            selectedTiles={spriteSheetStage.selectedTiles}
            onToggleItem={spriteSheetStage.toggleItem}
            onToggleTile={spriteSheetStage.toggleTile}
          />
        )}
        {usesCharacterEditor ? (
          <CharacterStage
            selectedNodes={characterStage.selectedNodes}
            selectedFrames={characterStage.selectedFrames}
            onSelect={characterStage.selectNode}
            onSelectFrame={characterStage.selectFrame}
            onSelectFrames={characterStage.selectFrames}
            onSelectNodes={characterStage.selectNodes}
            onClearSelection={characterStage.clearSelection}
          />
        ) : usesSceneryEditor ? (
          <SceneryStage
            selectedLayers={sceneryStage.selectedLayers}
            visibleLayers={sceneryStage.visibleLayers}
          />
        ) : (
          <SpriteSheetStage
            selectedItems={spriteSheetStage.selectedItems}
            selectedTiles={spriteSheetStage.selectedTiles}
            onToggleTile={spriteSheetStage.toggleTile}
          />
        )}
        <Inspector
          selectedNodes={characterStage.selectedNodes}
          selectedFrames={characterStage.selectedFrames}
          prompt={prompt}
          onPromptChange={setPrompt}
          onAction={handleAction}
          saveHistory={saveHistory}
          selectedItems={usesCharacterEditor ? undefined : editorSelections}
        />
      </div>
    </div>
  );
}
