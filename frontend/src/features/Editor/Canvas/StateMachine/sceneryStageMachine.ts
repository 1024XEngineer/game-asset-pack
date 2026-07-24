import { useReducer } from "react";

import type { EditorSceneryLayer } from "@/types/editor-document";

type SceneryStageState = {
  selectedLayers: string[];
  visibleLayers: string[];
};

type SceneryStageEvent =
  | { type: "toggle-layer"; layer: string }
  | { type: "toggle-visibility"; layer: string };

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

export function useSceneryStageMachine(layers: EditorSceneryLayer[]) {
  const [state, dispatch] = useReducer(
    reducer,
    layers,
    (initialLayers): SceneryStageState => ({
      selectedLayers: [],
      visibleLayers: initialLayers.map((layer) => layer.id),
    }),
  );
  return {
    ...state,
    toggleLayer: (layer: string) => dispatch({ type: "toggle-layer", layer }),
    toggleVisibility: (layer: string) =>
      dispatch({ type: "toggle-visibility", layer }),
  };
}
