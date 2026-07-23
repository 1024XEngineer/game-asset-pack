import { SceneryLayerTree } from "../AssetTree/SceneryLayerTree";
import { SceneryStage } from "../Canvas/SceneryStage";
import { useSceneryStageMachine } from "../Canvas/StateMachine/sceneryStageMachine";
import { Inspector } from "../Inspector/Inspector";
import type { EditorModeProps } from "./types";

export function SceneryEditorMode({
  prompt,
  history,
  onAction,
  onPromptChange,
  renderHeader,
}: EditorModeProps) {
  const stage = useSceneryStageMachine();
  const selection = stage.selectedLayers.length
    ? stage.selectedLayers.join(", ")
    : "Nothing selected";

  return (
    <>
      {renderHeader(selection)}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <SceneryLayerTree
          selectedLayers={stage.selectedLayers}
          visibleLayers={stage.visibleLayers}
          onToggleLayer={stage.toggleLayer}
          onToggleVisibility={stage.toggleVisibility}
        />
        <SceneryStage
          selectedLayers={stage.selectedLayers}
          visibleLayers={stage.visibleLayers}
        />
        <Inspector
          selectedNodes={[]}
          selectedFrames={[]}
          selectedItems={stage.selectedLayers}
          prompt={prompt}
          onPromptChange={onPromptChange}
          onAction={onAction}
          history={history}
        />
      </div>
    </>
  );
}
