import { describe, expect, it } from "vitest";

import type { NodeId } from "../character-node";
import type { EditorCharacterAnimation } from "@/types/editor-document";
import {
  DEFAULT_CANVAS_POSITIONS,
  type CanvasPosition,
} from "../CharacterCanvas.constants";
import type { CharacterSceneSnapshot } from "../Runtime/CharacterCanvas.types";
import {
  getCharacterNodeLayout,
  hitTestCharacterScene,
} from "./CharacterStageGeometry";

const animations: EditorCharacterAnimation[] = [
  { id: "idle", label: "Idle", frameCount: 6 },
  { id: "walk", label: "Walk", frameCount: 8 },
  { id: "harvest", label: "Harvest", frameCount: 12 },
  { id: "jump", label: "Jump", frameCount: 10 },
  { id: "celebrate", label: "Celebrate", frameCount: 8 },
];

function createScene(expanded: NodeId[] = []): CharacterSceneSnapshot {
  return {
    positions: DEFAULT_CANVAS_POSITIONS as CharacterSceneSnapshot["positions"],
    expanded: new Set(expanded),
    playing: new Set(),
    previewFrames: new Map(),
    marquee: null,
  };
}

function center(bounds: {
  x: number;
  y: number;
  width: number;
  height: number;
}): CanvasPosition {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
}

describe("character stage geometry", () => {
  it("uses the rendered node bounds as the collapsed hit area", () => {
    const scene = createScene();
    const layout = getCharacterNodeLayout("idle", scene.positions.idle, false);

    expect(layout.bounds.height).toBe(300);
    expect(
      hitTestCharacterScene(scene, {
        x: layout.bounds.x + 10,
        y: layout.bounds.y + layout.bounds.height - 10,
      }),
    ).toEqual({ kind: "node", node: "idle" });
  });

  it("derives control hit targets from the same layout used for drawing", () => {
    const scene = createScene();
    const layout = getCharacterNodeLayout("idle", scene.positions.idle, false);

    expect(hitTestCharacterScene(scene, center(layout.playControl!))).toEqual({
      kind: "play",
      node: "idle",
    });
    expect(hitTestCharacterScene(scene, center(layout.expandControl!))).toEqual(
      { kind: "expand", node: "idle" },
    );
  });

  it("maps every expanded frame to its matching hit target", () => {
    const scene = createScene(["walk"]);
    const layout = getCharacterNodeLayout(
      "walk",
      scene.positions.walk,
      true,
      animations,
    );

    expect(layout.frames).toHaveLength(8);
    layout.frames.forEach((frame, index) => {
      expect(hitTestCharacterScene(scene, center(frame), animations)).toEqual({
        kind: "frame",
        node: "walk",
        index,
      });
    });
  });

  it("does not expose controls for nodes that do not render them", () => {
    const scene = createScene();
    const layout = getCharacterNodeLayout(
      "prototype",
      scene.positions.prototype,
      false,
    );

    expect(layout.playControl).toBeUndefined();
    expect(layout.expandControl).toBeUndefined();
    expect(hitTestCharacterScene(scene, center(layout.bounds))).toEqual({
      kind: "node",
      node: "prototype",
    });
  });
});
