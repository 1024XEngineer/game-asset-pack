import { useReducer } from "react";

export const STATIC_TILE_POSITIONS: Record<string, string[]> = {
  Bed: ["Top left", "Top right", "Bottom left", "Bottom right"],
  "Street lamp": ["Top", "Center", "Bottom"],
  "Street fence": ["Left end", "Center left", "Center right", "Right end"],
  Object: ["Center"],
};

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

function reducer(
  state: SpriteSheetStageState,
  event: SpriteSheetStageEvent,
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
  const item = event.tile.slice(0, separator);
  if (item !== "Canvas" && state.selectedItems.includes(item)) {
    const remaining = (STATIC_TILE_POSITIONS[item] ?? [])
      .map((_, index) => `${item}:${index}`)
      .filter((tile) => tile !== event.tile);
    return {
      selectedItems: state.selectedItems.filter(
        (selectedItem) => selectedItem !== item,
      ),
      selectedTiles: [
        ...state.selectedTiles.filter((tile) => !tile.startsWith(`${item}:`)),
        ...remaining,
      ],
    };
  }

  const itemTiles = (STATIC_TILE_POSITIONS[item] ?? []).map(
    (_, index) => `${item}:${index}`,
  );
  const restoresItem =
    item !== "Canvas" &&
    !state.selectedTiles.includes(event.tile) &&
    itemTiles.length > 0 &&
    itemTiles.every(
      (tile) => tile === event.tile || state.selectedTiles.includes(tile),
    );
  if (restoresItem) {
    return {
      selectedItems: state.selectedItems.includes(item)
        ? state.selectedItems
        : [...state.selectedItems, item],
      selectedTiles: state.selectedTiles.filter(
        (tile) => !tile.startsWith(`${item}:`),
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

export function useSpriteSheetStageMachine() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return {
    ...state,
    toggleItem: (item: string) => dispatch({ type: "toggle-item", item }),
    toggleTile: (tile: string) => dispatch({ type: "toggle-tile", tile }),
  };
}
