"use client";

import { ArrowLeft, Braces, Download, Redo2, Save, Undo2 } from "lucide-react";
import { useEffect, useState } from "react";

import { sceneryApi } from "@/lib/api";
import { useSceneryStore } from "@/stores/scenery-store";

export function EditorHeader() {
  const document = useSceneryStore((state) => state.document);
  const status = useSceneryStore((state) => state.saveStatus);
  const undoStack = useSceneryStore((state) => state.undoStack);
  const redoStack = useSceneryStore((state) => state.redoStack);
  const undo = useSceneryStore((state) => state.undo);
  const redo = useSceneryStore((state) => state.redo);
  const saveAll = useSceneryStore((state) => state.saveAll);
  const renameScenery = useSceneryStore((state) => state.renameScenery);
  const [name, setName] = useState(document?.scenery.name ?? "Untitled Scenery");

  useEffect(() => setName(document?.scenery.name ?? "Untitled Scenery"), [document?.scenery.name]);

  if (!document) return null;

  return (
    <header className="editor-header">
      <div className="header-identity">
        <button type="button" className="icon-button ghost" aria-label="Back to project" title="Demo workspace">
          <ArrowLeft size={18} />
        </button>
        <span className="header-divider" />
        <div className="title-block">
          <div className="eyebrow">
            <span>Live demo</span><i>/</i><span>Scenery studio</span>
          </div>
          <div className="title-row">
            <input
              className="scene-name-input"
              value={name}
              aria-label="Scenery name"
              onChange={(event) => setName(event.target.value)}
              onBlur={() => void renameScenery(name)}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
            />
            <span className="version-badge">v1</span>
            <span className="canvas-badge">
              {document.scenery.attributes.width} × {document.scenery.attributes.height}
            </span>
          </div>
        </div>
      </div>

      <div className="header-actions">
        <span className={`save-status ${status === "Error" ? "is-error" : ""}`}>
          <i />{status}
        </span>
        <button
          type="button"
          className="icon-button"
          aria-label="Undo"
          disabled={!undoStack.length}
          onClick={() => void undo()}
        >
          <Undo2 size={17} />
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label="Redo"
          disabled={!redoStack.length}
          onClick={() => void redo()}
        >
          <Redo2 size={17} />
        </button>
        <a
          className="button secondary compact"
          href={sceneryApi.exportJsonUrl(document.scenery.id)}
          target="_blank"
          rel="noreferrer"
          title="Export scene JSON"
        >
          <Braces size={16} /> JSON
        </a>
        <a className="button secondary compact" href={sceneryApi.exportZipUrl(document.scenery.id)}>
          <Download size={16} /> Export
        </a>
        <button type="button" className="button primary compact" onClick={() => void saveAll()}>
          <Save size={16} /> Save
        </button>
      </div>
    </header>
  );
}

