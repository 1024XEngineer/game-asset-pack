import {
  CharacterCanvas,
  getCharacterNodeLabel,
} from "@/modules/character-canvas";

import { AssetTree } from "../AssetTree/AssetTree";
import { useCharacterStageMachine } from "../Canvas/StateMachine/characterStageMachine";
import { Inspector } from "../Inspector/Inspector";
import type { EditorModeProps } from "./types";

export function CharacterEditorMode({
  prompt,
  history,
  characterAnimations,
  characterNodePositions,
  onAction,
  onCharacterPositionChange,
  onPromptChange,
  renderHeader,
}: EditorModeProps) {
  const stage = useCharacterStageMachine();
  const selection = stage.selectedNodes.length
    ? stage.selectedNodes
        .map((node) => getCharacterNodeLabel(node, characterAnimations))
        .join(", ")
    : "Nothing selected";

  return (
    <>
      {renderHeader(selection)}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <AssetTree
          animations={characterAnimations}
          selectedNode={stage.selectedNode}
          selectedFrames={stage.selectedFrames}
          onSelect={stage.selectNode}
          onSelectFrame={stage.selectFrame}
        />
        <CharacterCanvas
          animations={characterAnimations}
          selectedNodes={stage.selectedNodes}
          selectedFrames={stage.selectedFrames}
          nodePositions={characterNodePositions}
          onSelect={stage.selectNode}
          onSelectFrame={stage.selectFrame}
          onSelectFrames={stage.selectFrames}
          onSelectNodes={stage.selectNodes}
          onClearSelection={stage.clearSelection}
          onNodePositionChange={onCharacterPositionChange}
        />
        <Inspector
          selectedNodes={stage.selectedNodes}
          selectedFrames={stage.selectedFrames}
          prompt={prompt}
          onPromptChange={onPromptChange}
          onAction={onAction}
          history={history}
        />
      </div>
    </>
  );
}
