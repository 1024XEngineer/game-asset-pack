import { Viewport } from "pixi-viewport";
import { Container } from "pixi.js";

import { type NodeId } from "../../Editor.constants";
import { DEFAULT_CANVAS_POSITIONS } from "../Canvas.constants";
import { CharacterStageInteraction } from "../Interaction/CharacterStageInteraction";
import { getFrameCount } from "../Interaction/CharacterStageGeometry";
import { CharacterStageRenderer } from "../Renderer/CharacterStageRenderer";
import {
  INITIAL_SCALE,
  MAX_SCALE,
  MIN_SCALE,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "./CharacterStage.constants";
import type {
  CharacterStageContext,
  CharacterStageProps,
} from "./CharacterStage.types";
import { StageRuntime } from "./StageRuntime";

export class CharacterStageRuntime {
  private readonly runtime = new StageRuntime();
  private interaction?: CharacterStageInteraction;
  private resizeObserver?: ResizeObserver;
  private renderer?: CharacterStageRenderer;
  private viewport?: Viewport;
  private props: CharacterStageProps;
  private lastAnimationFrame = performance.now();

  private readonly state: CharacterStageContext["state"] = {
    positions: structuredClone(DEFAULT_CANVAS_POSITIONS) as Record<
      NodeId,
      { x: number; y: number }
    >,
    expanded: new Set(),
    playing: new Set(),
    previewFrames: new Map(),
    marquee: null,
  };

  constructor(props: CharacterStageProps) {
    this.props = props;
  }

  async initialize(host: HTMLElement) {
    await this.runtime.initialize(host);
    const { app } = this.runtime;
    const viewport = new Viewport({
      screenWidth: app.screen.width,
      screenHeight: app.screen.height,
      worldWidth: WORLD_WIDTH,
      worldHeight: WORLD_HEIGHT,
      events: app.renderer.events,
      ticker: app.ticker,
    });
    viewport.eventMode = "static";
    viewport
      .drag({ mouseButtons: "middle" })
      .wheel()
      .clamp({ direction: "all", underflow: "center" })
      .clampZoom({ minScale: MIN_SCALE, maxScale: MAX_SCALE });
    app.stage.addChild(viewport);
    this.viewport = viewport;
    const world = new Container();
    viewport.addChild(world);
    this.renderer = new CharacterStageRenderer(world);

    const context: CharacterStageContext = {
      state: this.state,
      viewport,
      getSelection: () => this.props,
      actions: {
        onSelect: (node) => this.props.onSelect(node),
        onSelectFrame: (node, index) => this.props.onSelectFrame(node, index),
        onSelectFrames: (node, indexes) =>
          this.props.onSelectFrames(node, indexes),
        onSelectNodes: (nodes) => this.props.onSelectNodes(nodes),
        onClearSelection: () => this.props.onClearSelection(),
      },
      render: () => this.render(),
    };
    this.interaction = new CharacterStageInteraction(app.canvas, context);
    this.resizeObserver = new ResizeObserver(() => {
      viewport.resize(app.screen.width, app.screen.height);
      this.render();
    });
    this.resizeObserver.observe(host);
    app.ticker.add(this.updateAnimation);
    this.centerWorld();
    this.syncProps(this.props);
  }

  syncProps(props: CharacterStageProps) {
    this.props = props;
    for (const frame of props.selectedFrames)
      this.state.expanded.add(frame.node);
    this.render();
  }

  destroy() {
    this.runtime.app.ticker.remove(this.updateAnimation);
    this.resizeObserver?.disconnect();
    this.interaction?.destroy();
    this.runtime.destroy();
  }

  private centerWorld() {
    this.viewport?.setZoom(INITIAL_SCALE);
    this.viewport?.moveCenter(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
  }

  private render() {
    this.renderer?.render(this.state, this.props);
  }

  private updateAnimation = () => {
    if (this.state.playing.size === 0) return;
    const now = performance.now();
    if (now - this.lastAnimationFrame < 160) return;
    this.lastAnimationFrame = now;
    for (const node of this.state.playing) {
      this.state.previewFrames.set(
        node,
        ((this.state.previewFrames.get(node) ?? 0) + 1) % getFrameCount(node),
      );
    }
    this.render();
  };
}
