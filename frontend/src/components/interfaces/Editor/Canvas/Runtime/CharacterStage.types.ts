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
};

export type CharacterStageProps = CharacterSelection & CharacterStageActions;

export type Viewport = { x: number; y: number; scale: number };
export type Bounds = CanvasPosition & { width: number; height: number };

export type CharacterSceneState = {
  viewport: Viewport;
  positions: Record<NodeId, CanvasPosition>;
  expanded: Set<NodeId>;
  playing: Set<NodeId>;
  previewFrames: Map<NodeId, number>;
  marquee: { start: CanvasPosition; end: CanvasPosition } | null;
};

export type CharacterStageContext = {
  state: CharacterSceneState;
  getSelection: () => CharacterSelection;
  actions: CharacterStageActions;
  render: () => void;
};
