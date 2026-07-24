import type { Viewport } from "pixi-viewport";

import type { EditorCharacterAnimation } from "@/types/editor-document";
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
    animations: EditorCharacterAnimation[];
    nodePositions?: Record<string, CanvasPosition>;
  };

export type Bounds = CanvasPosition & { width: number; height: number };

export type CharacterSceneSnapshot = {
  readonly positions: Readonly<Record<NodeId, Readonly<CanvasPosition>>>;
  readonly expanded: ReadonlySet<NodeId>;
  readonly playing: ReadonlySet<NodeId>;
  readonly previewFrames: ReadonlyMap<NodeId, number>;
  readonly marquee: {
    readonly start: CanvasPosition;
    readonly end: CanvasPosition;
  } | null;
};

export type CharacterSceneState = {
  positions: Record<NodeId, CanvasPosition>;
  expanded: Set<NodeId>;
  playing: Set<NodeId>;
  previewFrames: Map<NodeId, number>;
  marquee: { start: CanvasPosition; end: CanvasPosition } | null;
};

export type CharacterStageContext = {
  viewport: Viewport;
  actions: CharacterStageActions;
  getAnimations: () => EditorCharacterAnimation[];
  getScene: () => CharacterSceneSnapshot;
  moveNode: (node: NodeId, position: CanvasPosition) => void;
  setMarquee: (marquee: CharacterSceneState["marquee"]) => void;
  toggleExpanded: (node: NodeId) => void;
  togglePlaying: (node: NodeId) => void;
  render: () => void;
};
