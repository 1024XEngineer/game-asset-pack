import type { Viewport } from "pixi-viewport";

import type { NodeId } from "../../Editor.constants";
import type { CanvasPosition } from "../Canvas.constants";

export type CharacterSelection = {
  selectedNodes: NodeId[];
  selectedFrames: Array<{ node: NodeId; index: number }>;
};

export type CharacterStageActions = {
  onSelect: (node: NodeId) => void;
  onSelectFrame: (node: NodeId, index: number) => void;
  onSelectFrames: (node: NodeId, indexes: number[]) => void;
  onSelectNodes: (nodes: NodeId[]) => void;
  onClearSelection: () => void;
  onNodePositionChange: (node: NodeId, position: CanvasPosition) => void;
};

export type CharacterStageProps = CharacterSelection &
  CharacterStageActions & {
    nodePositions?: Record<string, CanvasPosition>;
  };

export type Bounds = CanvasPosition & { width: number; height: number };

export type CharacterSceneState = {
  positions: Record<NodeId, CanvasPosition>;
  expanded: Set<NodeId>;
  playing: Set<NodeId>;
  previewFrames: Map<NodeId, number>;
  marquee: { start: CanvasPosition; end: CanvasPosition } | null;
};

export type CharacterStageContext = {
  state: CharacterSceneState;
  viewport: Viewport;
  getSelection: () => CharacterSelection;
  actions: CharacterStageActions;
  render: () => void;
};
