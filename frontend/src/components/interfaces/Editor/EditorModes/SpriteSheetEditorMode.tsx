import type { AssetKind } from "@/types/asset-kind";

import { StaticAssetTree } from "../AssetTree/StaticAssetTree";
import { SpriteSheetStage } from "../Canvas/SpriteSheetStage";
import {
  STATIC_TILE_POSITIONS,
  useSpriteSheetStageMachine,
} from "../Canvas/StateMachine/spriteSheetStageMachine";
import { Inspector } from "../Inspector/Inspector";
import type { EditorModeProps } from "./types";

export function SpriteSheetEditorMode({
  kind,
  prompt,
  history,
  onAction,
  onPromptChange,
  renderHeader,
}: EditorModeProps & { kind: AssetKind }) {
  const stage = useSpriteSheetStageMachine();
  const selectedItems = [
    ...stage.selectedItems,
    ...stage.selectedTiles.map((tile) => {
      const separator = tile.lastIndexOf(":");
      const item = tile.slice(0, separator);
      const tileIndex = Number(tile.slice(separator + 1));

      return item === "Canvas"
        ? `Tile ${tileIndex + 1}`
        : `${item} / ${STATIC_TILE_POSITIONS[item]?.[tileIndex] ?? `Tile ${tileIndex + 1}`}`;
    }),
  ];
  const selection = selectedItems.length
    ? selectedItems.join(", ")
    : "Nothing selected";

  return (
    <>
      {renderHeader(selection)}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <StaticAssetTree
          kind={kind === "tiles" ? "tiles" : "object"}
          selectedItems={stage.selectedItems}
          selectedTiles={stage.selectedTiles}
          onToggleItem={stage.toggleItem}
          onToggleTile={stage.toggleTile}
        />
        <SpriteSheetStage
          selectedItems={stage.selectedItems}
          selectedTiles={stage.selectedTiles}
          onToggleTile={stage.toggleTile}
        />
        <Inspector
          selectedNodes={[]}
          selectedFrames={[]}
          selectedItems={selectedItems}
          prompt={prompt}
          onPromptChange={onPromptChange}
          onAction={onAction}
          history={history}
        />
      </div>
    </>
  );
}
