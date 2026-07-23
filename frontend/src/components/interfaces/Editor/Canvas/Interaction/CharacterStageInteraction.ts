import type { NodeId } from "../../Editor.constants";
import {
  ANIMATION_NODES,
  CANVAS_NODES,
  type CanvasPosition,
} from "../Canvas.constants";
import {
  contains,
  getExpandedHeight,
  getFrameBounds,
  getFrameCount,
  getNodeBounds,
  intersects,
  normalizeBounds,
} from "./CharacterStageGeometry";
import {
  EXPANDED_WIDTH,
  FRAME_GAP,
  FRAME_SIZE,
  INITIAL_SCALE,
  NODE_WIDTH,
} from "../Runtime/CharacterStage.constants";
import type {
  Bounds,
  CharacterStageContext,
} from "../Runtime/CharacterStage.types";

type DragState =
  | {
      kind: "node";
      pointerId: number;
      start: CanvasPosition;
      node: NodeId;
      position: CanvasPosition;
    }
  | {
      kind: "marquee";
      pointerId: number;
      start: CanvasPosition;
      end: CanvasPosition;
    }
  | {
      kind: "frame-marquee";
      pointerId: number;
      start: CanvasPosition;
      end: CanvasPosition;
      node: NodeId;
    };

type HitTarget =
  | { kind: "node"; node: NodeId }
  | { kind: "frame"; node: NodeId; index: number }
  | { kind: "frame-grid"; node: NodeId }
  | { kind: "play"; node: NodeId }
  | { kind: "expand"; node: NodeId };

export class CharacterStageInteraction {
  private drag: DragState | null = null;
  private lastClick = { time: 0, x: 0, y: 0 };
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CharacterStageContext;

  constructor(canvas: HTMLCanvasElement, context: CharacterStageContext) {
    this.canvas = canvas;
    this.context = context;
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerup", this.finishPointer);
    canvas.addEventListener("pointercancel", this.finishPointer);
    canvas.addEventListener("contextmenu", this.onContextMenu);
  }

  destroy() {
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.finishPointer);
    this.canvas.removeEventListener("pointercancel", this.finishPointer);
    this.canvas.removeEventListener("contextmenu", this.onContextMenu);
  }

  private onPointerDown = (event: PointerEvent) => {
    this.canvas.focus();
    const screen = this.screenPoint(event);
    const point = this.worldPoint(screen);
    if (event.button === 1) return;
    if (event.button !== 0) return;
    if (this.handleDoubleClick(screen)) return;

    const hit = this.hitTest(point);
    if (hit?.kind === "play") return this.togglePlaying(hit.node);
    if (hit?.kind === "expand") return this.toggleExpanded(hit.node);
    if (hit?.kind === "frame")
      return this.context.actions.onSelectFrame(hit.node, hit.index);
    if (hit?.kind === "frame-grid") {
      this.capture(event);
      this.drag = {
        kind: "frame-marquee",
        pointerId: event.pointerId,
        start: point,
        end: point,
        node: hit.node,
      };
    } else if (hit?.kind === "node") {
      this.capture(event);
      this.context.actions.onSelect(hit.node);
      this.drag = {
        kind: "node",
        pointerId: event.pointerId,
        start: point,
        node: hit.node,
        position: { ...this.context.state.positions[hit.node] },
      };
    } else {
      this.capture(event);
      this.drag = {
        kind: "marquee",
        pointerId: event.pointerId,
        start: point,
        end: point,
      };
    }
    this.syncMarquee();
  };

  private onPointerMove = (event: PointerEvent) => {
    if (!this.drag || this.drag.pointerId !== event.pointerId) return;
    const screen = this.screenPoint(event);
    const point = this.worldPoint(screen);
    if (this.drag.kind === "node") this.moveNode(this.drag, point);
    else this.drag.end = point;
    this.syncMarquee();
  };

  private finishPointer = (event: PointerEvent) => {
    if (!this.drag || this.drag.pointerId !== event.pointerId) return;
    const completed = this.drag;
    if (completed.kind === "marquee")
      this.completeNodeSelection(completed.start, completed.end);
    if (completed.kind === "frame-marquee")
      this.completeFrameSelection(
        completed.node,
        completed.start,
        completed.end,
      );
    if (completed.kind === "node")
      this.context.actions.onNodePositionChange(
        completed.node,
        this.context.state.positions[completed.node],
      );
    this.drag = null;
    if (this.canvas.hasPointerCapture(event.pointerId))
      this.canvas.releasePointerCapture(event.pointerId);
    this.syncMarquee();
  };

  private onContextMenu = (event: MouseEvent) => event.preventDefault();

  private hitTest(point: CanvasPosition): HitTarget | null {
    const { positions, expanded } = this.context.state;
    for (const node of [...CANVAS_NODES].reverse()) {
      const position = positions[node];
      const isExpanded = expanded.has(node);
      if (isExpanded) {
        for (let index = getFrameCount(node) - 1; index >= 0; index -= 1) {
          if (contains(getFrameBounds(position, index), point))
            return { kind: "frame", node, index };
        }
        const frameGrid: Bounds = {
          x: position.x + 8,
          y: position.y + 48,
          width: EXPANDED_WIDTH - 16,
          height:
            Math.ceil(getFrameCount(node) / 4) * (FRAME_SIZE + FRAME_GAP) -
            FRAME_GAP,
        };
        if (contains(frameGrid, point)) return { kind: "frame-grid", node };
      }
      if (ANIMATION_NODES.has(node)) {
        const controlsY = isExpanded ? getExpandedHeight(node) - 40 : 252;
        if (
          !isExpanded &&
          contains(
            {
              x: position.x + 37,
              y: position.y + controlsY,
              width: 68,
              height: 32,
            },
            point,
          )
        ) {
          return { kind: "play", node };
        }
        if (
          contains(
            {
              x: position.x + 113,
              y: position.y + controlsY,
              width: 84,
              height: 32,
            },
            point,
          )
        ) {
          return { kind: "expand", node };
        }
      }
      if (
        contains(
          {
            ...position,
            width: isExpanded ? EXPANDED_WIDTH : NODE_WIDTH,
            height: isExpanded ? 34 : 232,
          },
          point,
        )
      ) {
        return { kind: "node", node };
      }
    }
    return null;
  }

  private togglePlaying(node: NodeId) {
    this.context.actions.onSelect(node);
    if (!this.context.state.expanded.has(node)) {
      if (this.context.state.playing.has(node))
        this.context.state.playing.delete(node);
      else this.context.state.playing.add(node);
    }
    this.context.render();
  }

  private toggleExpanded(node: NodeId) {
    this.context.actions.onSelect(node);
    this.context.state.playing.delete(node);
    if (this.context.state.expanded.has(node))
      this.context.state.expanded.delete(node);
    else this.context.state.expanded.add(node);
    this.context.render();
  }

  private handleDoubleClick(screen: CanvasPosition) {
    const now = performance.now();
    const isDouble =
      now - this.lastClick.time < 280 &&
      Math.hypot(screen.x - this.lastClick.x, screen.y - this.lastClick.y) < 5;
    this.lastClick = isDouble
      ? { time: 0, x: 0, y: 0 }
      : { time: now, x: screen.x, y: screen.y };
    if (!isDouble) return false;
    const focus = this.context.viewport.toWorld(screen);
    const scale = this.context.viewport.scale.x < 1 ? 1 : INITIAL_SCALE;
    this.context.viewport.setZoom(scale);
    this.context.viewport.moveCenter(focus);
    this.context.render();
    return true;
  }

  private moveNode(
    drag: Extract<DragState, { kind: "node" }>,
    point: CanvasPosition,
  ) {
    this.context.state.positions[drag.node] = {
      x: drag.position.x + point.x - drag.start.x,
      y: drag.position.y + point.y - drag.start.y,
    };
  }

  private completeNodeSelection(start: CanvasPosition, end: CanvasPosition) {
    const bounds = normalizeBounds(start, end);
    const selected = CANVAS_NODES.filter((node) =>
      intersects(
        bounds,
        getNodeBounds(
          node,
          this.context.state.positions[node],
          this.context.state.expanded.has(node),
        ),
      ),
    );
    if (selected.length > 0) this.context.actions.onSelectNodes(selected);
    else this.context.actions.onClearSelection();
  }

  private completeFrameSelection(
    node: NodeId,
    start: CanvasPosition,
    end: CanvasPosition,
  ) {
    const bounds = normalizeBounds(start, end);
    const indexes = Array.from(
      { length: getFrameCount(node) },
      (_, index) => index,
    ).filter((index) =>
      intersects(
        bounds,
        getFrameBounds(this.context.state.positions[node], index),
      ),
    );
    if (indexes.length > 0) this.context.actions.onSelectFrames(node, indexes);
  }

  private syncMarquee() {
    this.context.state.marquee =
      this.drag?.kind === "marquee" || this.drag?.kind === "frame-marquee"
        ? { start: this.drag.start, end: this.drag.end }
        : null;
    this.context.render();
  }

  private screenPoint(event: PointerEvent): CanvasPosition {
    const bounds = this.canvas.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }

  private worldPoint(point: CanvasPosition): CanvasPosition {
    return this.context.viewport.toWorld(point);
  }

  private capture(event: PointerEvent) {
    this.canvas.setPointerCapture(event.pointerId);
  }
}
