"use client";

import dynamic from "next/dynamic";

const SceneryCanvas = dynamic(
  () => import("./scenery-canvas").then((module) => module.SceneryCanvas),
  { ssr: false, loading: () => <div className="canvas-loading">Preparing canvas…</div> },
);

export function SceneryCanvasShell() {
  return <SceneryCanvas />;
}

