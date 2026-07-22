import { useReducer } from "react";

import { SCENERY_LAYERS, type SceneryLayerId } from "../../Editor.constants";

type SceneryStageState = {
  selectedLayers: SceneryLayerId[];
  visibleLayers: SceneryLayerId[];
};

type SceneryStageEvent =
  | { type: "toggle-layer"; layer: SceneryLayerId }
  | { type: "toggle-visibility"; layer: SceneryLayerId };

const initialState: SceneryStageState = {
  selectedLayers: [],
  visibleLayers: SCENERY_LAYERS.map((layer) => layer.id),
};

function toggle<T>(values: T[], value: T) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function reducer(
  state: SceneryStageState,
  event: SceneryStageEvent,
): SceneryStageState {
  switch (event.type) {
    case "toggle-layer":
      return {
        ...state,
        selectedLayers: toggle(state.selectedLayers, event.layer),
      };
    case "toggle-visibility":
      return {
        ...state,
        visibleLayers: toggle(state.visibleLayers, event.layer),
      };
  }
}

export function useSceneryStageMachine() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return {
    ...state,
    toggleLayer: (layer: SceneryLayerId) =>
      dispatch({ type: "toggle-layer", layer }),
    toggleVisibility: (layer: SceneryLayerId) =>
      dispatch({ type: "toggle-visibility", layer }),
  };
}
