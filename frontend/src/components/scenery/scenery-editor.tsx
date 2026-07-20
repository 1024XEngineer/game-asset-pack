"use client";

import { useEffect } from "react";

import { EditorHeader } from "./editor-header";
import { Inspector } from "./inspector";
import { LayerPanel } from "./layer-panel";
import { SceneryCanvasShell } from "./scenery-canvas-shell";
import { useSceneryStore } from "@/stores/scenery-store";

export function SceneryEditor() {
  const initialize = useSceneryStore((state) => state.initialize);
  const loading = useSceneryStore((state) => state.loading);
  const error = useSceneryStore((state) => state.error);
  const clearError = useSceneryStore((state) => state.clearError);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  if (loading) {
    return (
      <main className="loading-screen">
        <div className="loading-mark"><span /><span /><span /></div>
        <p>Opening Scenery Studio…</p>
      </main>
    );
  }

  return (
    <main className="editor-shell">
      <EditorHeader />
      <div className="editor-body">
        <LayerPanel />
        <SceneryCanvasShell />
        <Inspector />
      </div>
      {error ? (
        <div className="error-toast" role="alert">
          <div>
            <strong>Something went wrong</strong>
            <p>{error}</p>
          </div>
          <button type="button" onClick={clearError} aria-label="Dismiss error">×</button>
        </div>
      ) : null}
    </main>
  );
}

