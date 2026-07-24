import { useReducer } from "react";

import type { EditorSpriteSheetItem } from "@/types/record";

type SpriteSheetStageState = {
  selectedItems: string[];
  selectedTiles: string[];
};

type SpriteSheetStageEvent =
  | { type: "toggle-item"; item: string }
  | { type: "toggle-tile"; tile: string };

const initialState: SpriteSheetStageState = {
  selectedItems: [],
  selectedTiles: [],
};

function reduceSpriteSheetStage(
  state: SpriteSheetStageState,
  event: SpriteSheetStageEvent,
  items: EditorSpriteSheetItem[],
): SpriteSheetStageState {
  if (event.type === "toggle-item") {
    const selected = state.selectedItems.includes(event.item);
    return {
      selectedItems: selected
        ? state.selectedItems.filter((item) => item !== event.item)
        : [...state.selectedItems, event.item],
      selectedTiles: selected
        ? state.selectedTiles
        : state.selectedTiles.filter(
            (tile) => !tile.startsWith(`${event.item}:`),
          ),
    };
  }

  const separator = event.tile.lastIndexOf(":");
  const itemId = event.tile.slice(0, separator);
  const item = items.find((candidate) => candidate.id === itemId);
  const itemTiles = item?.tiles.map((_, index) => `${itemId}:${index}`) ?? [];

  if (item && state.selectedItems.includes(itemId)) {
    return {
      selectedItems: state.selectedItems.filter(
        (selectedItem) => selectedItem !== itemId,
      ),
      selectedTiles: [
        ...state.selectedTiles.filter((tile) => !tile.startsWith(`${itemId}:`)),
        ...itemTiles.filter((tile) => tile !== event.tile),
      ],
    };
  }

  const restoresItem =
    item &&
    !state.selectedTiles.includes(event.tile) &&
    itemTiles.length > 0 &&
    itemTiles.every(
      (tile) => tile === event.tile || state.selectedTiles.includes(tile),
    );
  if (restoresItem) {
    return {
      selectedItems: state.selectedItems.includes(itemId)
        ? state.selectedItems
        : [...state.selectedItems, itemId],
      selectedTiles: state.selectedTiles.filter(
        (tile) => !tile.startsWith(`${itemId}:`),
      ),
    };
  }

  return {
    ...state,
    selectedTiles: state.selectedTiles.includes(event.tile)
      ? state.selectedTiles.filter((tile) => tile !== event.tile)
      : [...state.selectedTiles, event.tile],
  };
}

export function useSpriteSheetStageMachine(items: EditorSpriteSheetItem[]) {
  const [state, dispatch] = useReducer(
    (current: SpriteSheetStageState, event: SpriteSheetStageEvent) =>
      reduceSpriteSheetStage(current, event, items),
    initialState,
  );

  return {
    ...state,
    toggleItem: (item: string) => dispatch({ type: "toggle-item", item }),
    toggleTile: (tile: string) => dispatch({ type: "toggle-tile", tile }),
  };
}
