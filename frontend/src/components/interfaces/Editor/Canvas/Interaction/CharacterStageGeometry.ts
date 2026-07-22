import { nodeMeta, type NodeId } from "../../Editor.constants";
import type { CanvasPosition } from "../Canvas.constants";
import {
  COLLAPSED_HEIGHT,
  EXPANDED_WIDTH,
  FRAME_GAP,
  FRAME_SIZE,
  NODE_WIDTH,
} from "../Runtime/CharacterStage.constants";
import type { Bounds } from "../Runtime/CharacterStage.types";

export function getFrameCount(node: NodeId) {
  return Number.parseInt(nodeMeta[node].count ?? "1", 10) || 1;
}

export function getExpandedHeight(node: NodeId) {
  return (
    48 + Math.ceil(getFrameCount(node) / 4) * (FRAME_SIZE + FRAME_GAP) + 48
  );
}

export function getNodeBounds(
  node: NodeId,
  position: CanvasPosition,
  expanded: boolean,
): Bounds {
  return {
    ...position,
    width: expanded ? EXPANDED_WIDTH : NODE_WIDTH,
    height: expanded ? getExpandedHeight(node) : COLLAPSED_HEIGHT,
  };
}

export function getFrameBounds(
  position: CanvasPosition,
  index: number,
): Bounds {
  return {
    x: position.x + 8 + (index % 4) * (FRAME_SIZE + FRAME_GAP),
    y: position.y + 48 + Math.floor(index / 4) * (FRAME_SIZE + FRAME_GAP),
    width: FRAME_SIZE,
    height: FRAME_SIZE,
  };
}

export function contains(bounds: Bounds, point: CanvasPosition) {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
}

export function intersects(left: Bounds, right: Bounds) {
  return (
    left.x < right.x + right.width &&
    left.x + left.width > right.x &&
    left.y < right.y + right.height &&
    left.y + left.height > right.y
  );
}

export function normalizeBounds(
  start: CanvasPosition,
  end: CanvasPosition,
): Bounds {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    width: Math.abs(end.x - start.x),
    height: Math.abs(end.y - start.y),
  };
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
