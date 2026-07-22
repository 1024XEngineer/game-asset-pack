"use client";

import { useState } from "react";

import { Button } from "@/shared/ui/button";
import type { EditorWorkspaceAsset } from "./EditorWorkspaceScreen";
import {
  defaultEditorPrompt,
  nodeMeta,
  type NodeId,
} from "@/states/editor";
import { EditorStage } from "./canvas";
import { EditorHeader } from "./header";
import { Inspector, type SaveHistoryEntry } from "./inspector";
import { SCENERY_LAYERS, type SceneryLayerId } from "@/states/editor";
import { SceneryLayerTree } from "./scenery-layer-tree";
import { SceneryStage } from "./scenery-stage";
import { SpriteSheetStage } from "./sprite-sheet-stage";
import { StaticAssetTree } from "./static-asset-tree";
import { AssetTree } from "./tree";

const STATIC_TILE_POSITIONS: Record<string, string[]> = {
  Bed: ["Top left", "Top right", "Bottom left", "Bottom right"],
  "Street lamp": ["Top", "Center", "Bottom"],
  "Street fence": ["Left end", "Center left", "Center right", "Right end"],
  Object: ["Center"],
};

export function Workspace({
  asset,
  projectName,
  onBack,
}: {
  asset?: EditorWorkspaceAsset;
  projectName?: string;
  onBack: () => void;
}) {
  const [selectedNode, setSelectedNode] = useState<NodeId | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<NodeId[]>([]);
  const [selectedFrames, setSelectedFrames] = useState<
    Array<{ node: NodeId; index: number }>
  >([]);
  const [status, setStatus] = useState("All changes saved");
  const [canUndo, setCanUndo] = useState(true);
  const [canRedo, setCanRedo] = useState(false);
  const [prompt, setPrompt] = useState(defaultEditorPrompt);
  const [saveHistory, setSaveHistory] = useState<SaveHistoryEntry[]>([]);
  const [selectedStaticItems, setSelectedStaticItems] = useState<string[]>([]);
  const [selectedStaticTiles, setSelectedStaticTiles] = useState<string[]>([]);
  const [selectedSceneryLayers, setSelectedSceneryLayers] = useState<
    SceneryLayerId[]
  >([]);
  const [visibleSceneryLayers, setVisibleSceneryLayers] = useState<
    SceneryLayerId[]
  >(() => SCENERY_LAYERS.map((layer) => layer.id));
  const usesCharacterEditor =
    asset?.kind === "character" || asset?.kind === "object";
  const usesSceneryEditor = asset?.kind === "scenery";
  const staticSelections = [
    ...selectedStaticItems,
    ...selectedStaticTiles.map((tile) => {
      const separator = tile.lastIndexOf(":");
      const item = tile.slice(0, separator);
      const tileIndex = Number(tile.slice(separator + 1));
      return item === "Canvas"
        ? `Tile ${tileIndex + 1}`
        : `${item} / ${STATIC_TILE_POSITIONS[item]?.[tileIndex] ?? `Tile ${tileIndex + 1}`}`;
    }),
  ];
  const editorSelections = usesSceneryEditor
    ? selectedSceneryLayers
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
  const handleSelectNode = (node: NodeId) => {
    setSelectedNode(node);
    setSelectedNodes([node]);
    setSelectedFrames([]);
  };
  const handleSelectFrame = (node: NodeId, index: number) => {
    setSelectedNode(node);
    setSelectedNodes([node]);
    setSelectedFrames([{ node, index }]);
  };
  const handleSelectFrames = (node: NodeId, indexes: number[]) => {
    setSelectedNode(node);
    setSelectedNodes([node]);
    setSelectedFrames(indexes.map((index) => ({ node, index })));
  };
  const handleSelectNodes = (nodes: NodeId[]) => {
    setSelectedNodes(nodes);
    setSelectedNode(nodes[0] ?? null);
    setSelectedFrames([]);
  };
  const handleToggleStaticTile = (tile: string) => {
    const separator = tile.lastIndexOf(":");
    const item = tile.slice(0, separator);

    if (item !== "Canvas" && selectedStaticItems.includes(item)) {
      const remainingTiles = (STATIC_TILE_POSITIONS[item] ?? [])
        .map((_, index) => `${item}:${index}`)
        .filter((itemTile) => itemTile !== tile);

      setSelectedStaticItems((current) =>
        current.filter((selectedItem) => selectedItem !== item),
      );
      setSelectedStaticTiles((current) => [
        ...current.filter(
          (selectedTile) => !selectedTile.startsWith(`${item}:`),
        ),
        ...remainingTiles,
      ]);
      return;
    }

    const itemTiles = (STATIC_TILE_POSITIONS[item] ?? []).map(
      (_, index) => `${item}:${index}`,
    );
    const restoresCompleteItem =
      item !== "Canvas" &&
      !selectedStaticTiles.includes(tile) &&
      itemTiles.length > 0 &&
      itemTiles.every((itemTile) =>
        itemTile === tile ? true : selectedStaticTiles.includes(itemTile),
      );

    if (restoresCompleteItem) {
      setSelectedStaticTiles((current) =>
        current.filter((selectedTile) => !selectedTile.startsWith(`${item}:`)),
      );
      setSelectedStaticItems((current) =>
        current.includes(item) ? current : [...current, item],
      );
      return;
    }

    setSelectedStaticTiles((current) =>
      current.includes(tile)
        ? current.filter((selectedTile) => selectedTile !== tile)
        : [...current, tile],
    );
  };
  const handleToggleStaticItem = (item: string) => {
    if (selectedStaticItems.includes(item)) {
      setSelectedStaticItems((current) =>
        current.filter((selectedItem) => selectedItem !== item),
      );
      return;
    }

    setSelectedStaticItems((current) => [...current, item]);
    setSelectedStaticTiles((current) =>
      current.filter((selectedTile) => !selectedTile.startsWith(`${item}:`)),
    );
  };
  const handleToggleSceneryLayer = (layer: SceneryLayerId) => {
    setSelectedSceneryLayers((current) =>
      current.includes(layer)
        ? current.filter((selectedLayer) => selectedLayer !== layer)
        : [...current, layer],
    );
  };
  const handleToggleSceneryVisibility = (layer: SceneryLayerId) => {
    setVisibleSceneryLayers((current) =>
      current.includes(layer)
        ? current.filter((visibleLayer) => visibleLayer !== layer)
        : [...current, layer],
    );
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
          : selectedNodes.length
            ? selectedNodes.map((node) => nodeMeta[node].label).join(", ")
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
            selectedNode={selectedNode}
            selectedFrames={selectedFrames}
            onSelect={handleSelectNode}
            onSelectFrame={handleSelectFrame}
          />
        ) : usesSceneryEditor ? (
          <SceneryLayerTree
            selectedLayers={selectedSceneryLayers}
            visibleLayers={visibleSceneryLayers}
            onToggleLayer={handleToggleSceneryLayer}
            onToggleVisibility={handleToggleSceneryVisibility}
          />
        ) : (
          <StaticAssetTree
            kind={asset.kind === "tiles" ? "tiles" : "object"}
            selectedItems={selectedStaticItems}
            selectedTiles={selectedStaticTiles}
            onToggleItem={handleToggleStaticItem}
            onToggleTile={handleToggleStaticTile}
          />
        )}
        {usesCharacterEditor ? (
          <EditorStage
            selectedNodes={selectedNodes}
            selectedFrames={selectedFrames}
            onSelect={handleSelectNode}
            onSelectFrame={handleSelectFrame}
            onSelectFrames={handleSelectFrames}
            onSelectNodes={handleSelectNodes}
            onClearSelection={() => {
              setSelectedNode(null);
              setSelectedNodes([]);
              setSelectedFrames([]);
            }}
          />
        ) : usesSceneryEditor ? (
          <SceneryStage
            selectedLayers={selectedSceneryLayers}
            visibleLayers={visibleSceneryLayers}
          />
        ) : (
          <SpriteSheetStage
            selectedItems={selectedStaticItems}
            selectedTiles={selectedStaticTiles}
            onToggleTile={handleToggleStaticTile}
          />
        )}
        <Inspector
          selectedNodes={selectedNodes}
          selectedFrames={selectedFrames}
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
