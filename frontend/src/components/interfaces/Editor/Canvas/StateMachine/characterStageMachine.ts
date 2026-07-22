import { useReducer } from "react";

import type { NodeId } from "../../Editor.constants";

type CharacterStageState = {
  selectedNode: NodeId | null;
  selectedNodes: NodeId[];
  selectedFrames: Array<{ node: NodeId; index: number }>;
};

type CharacterStageEvent =
  | { type: "select-node"; node: NodeId }
  | { type: "select-frame"; node: NodeId; index: number }
  | { type: "select-frames"; node: NodeId; indexes: number[] }
  | { type: "select-nodes"; nodes: NodeId[] }
  | { type: "clear-selection" };

const initialState: CharacterStageState = {
  selectedNode: null,
  selectedNodes: [],
  selectedFrames: [],
};

function reducer(
  _: CharacterStageState,
  event: CharacterStageEvent,
): CharacterStageState {
  switch (event.type) {
    case "select-node":
      return {
        selectedNode: event.node,
        selectedNodes: [event.node],
        selectedFrames: [],
      };
    case "select-frame":
      return {
        selectedNode: event.node,
        selectedNodes: [event.node],
        selectedFrames: [{ node: event.node, index: event.index }],
      };
    case "select-frames":
      return {
        selectedNode: event.node,
        selectedNodes: [event.node],
        selectedFrames: event.indexes.map((index) => ({
          node: event.node,
          index,
        })),
      };
    case "select-nodes":
      return {
        selectedNode: event.nodes[0] ?? null,
        selectedNodes: event.nodes,
        selectedFrames: [],
      };
    case "clear-selection":
      return initialState;
  }
}

export function useCharacterStageMachine() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return {
    ...state,
    selectNode: (node: NodeId) => dispatch({ type: "select-node", node }),
    selectFrame: (node: NodeId, index: number) =>
      dispatch({ type: "select-frame", node, index }),
    selectFrames: (node: NodeId, indexes: number[]) =>
      dispatch({ type: "select-frames", node, indexes }),
    selectNodes: (nodes: NodeId[]) => dispatch({ type: "select-nodes", nodes }),
    clearSelection: () => dispatch({ type: "clear-selection" }),
  };
}
