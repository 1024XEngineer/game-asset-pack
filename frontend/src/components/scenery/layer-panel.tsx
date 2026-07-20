"use client";

import { Eye, EyeOff, GripVertical, ImagePlus, Layers3, Trash2, TriangleAlert } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { mediaUrl } from "@/lib/api";
import { useSceneryStore } from "@/stores/scenery-store";

const roleLabels: Record<string, string> = {
  sky: "Base background",
  distant: "Distant layer",
  midground: "Midground layer",
  foreground: "Foreground layer",
  atmosphere: "Atmosphere layer",
};

type DragState = {
  layerId: number;
  initialIds: number[];
  orderedIds: number[];
};

function sameOrder(left: number[], right: number[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

export function LayerPanel() {
  const document = useSceneryStore((state) => state.document);
  const selectedLayerId = useSceneryStore((state) => state.selectedLayerId);
  const selectLayer = useSceneryStore((state) => state.selectLayer);
  const toggleVisibility = useSceneryStore((state) => state.toggleVisibility);
  const deleteLayer = useSceneryStore((state) => state.deleteLayer);
  const reorderLayers = useSceneryStore((state) => state.reorderLayers);
  const setActiveTab = useSceneryStore((state) => state.setActiveTab);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const rowRefs = useRef(new Map<number, HTMLDivElement>());

  const sortedLayers = useMemo(
    () =>
      [...(document?.layers ?? [])].sort(
        (a, b) => b.attributes.zIndex - a.attributes.zIndex || b.siblingOrder - a.siblingOrder,
      ),
    [document?.layers],
  );

  const displayLayers = useMemo(() => {
    if (!dragState) return sortedLayers;
    const byId = new Map(sortedLayers.map((layer) => [layer.id, layer]));
    return dragState.orderedIds.flatMap((id) => {
      const layer = byId.get(id);
      return layer ? [layer] : [];
    });
  }, [dragState, sortedLayers]);

  if (!document) return null;

  const updateDragState = (next: DragState | null) => {
    dragStateRef.current = next;
    setDragState(next);
  };

  const beginDrag = (event: React.PointerEvent<HTMLDivElement>, layerId: number) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if ((event.target as HTMLElement).closest("[data-no-reorder]")) return;
    const orderedIds = sortedLayers.map((layer) => layer.id);
    selectLayer(layerId);
    event.currentTarget.setPointerCapture(event.pointerId);
    updateDragState({ layerId, initialIds: orderedIds, orderedIds });
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = dragStateRef.current;
    if (!current) return;
    event.preventDefault();
    const remaining = current.orderedIds.filter((id) => id !== current.layerId);
    let insertionIndex = remaining.length;
    for (let index = 0; index < remaining.length; index += 1) {
      const bounds = rowRefs.current.get(remaining[index])?.getBoundingClientRect();
      if (bounds && event.clientY < bounds.top + bounds.height / 2) {
        insertionIndex = index;
        break;
      }
    }
    const orderedIds = [...remaining];
    orderedIds.splice(insertionIndex, 0, current.layerId);
    if (!sameOrder(orderedIds, current.orderedIds)) {
      updateDragState({ ...current, orderedIds });
    }
  };

  const endDrag = (commit: boolean) => {
    const current = dragStateRef.current;
    updateDragState(null);
    if (commit && current && !sameOrder(current.initialIds, current.orderedIds)) {
      // The left panel is front-to-back; the API stores bottom-to-top order.
      void reorderLayers([...current.orderedIds].reverse());
    }
  };

  const moveWithKeyboard = (layerId: number, direction: -1 | 1) => {
    const orderedIds = sortedLayers.map((layer) => layer.id);
    const from = orderedIds.indexOf(layerId);
    const to = Math.max(0, Math.min(orderedIds.length - 1, from + direction));
    if (from === to) return;
    orderedIds.splice(from, 1);
    orderedIds.splice(to, 0, layerId);
    void reorderLayers([...orderedIds].reverse());
  };

  return (
    <aside className="layer-panel">
      <div className="panel-title-row">
        <div className="panel-kicker"><Layers3 size={14} /> Layers</div>
        <button
          type="button"
          className="mini-button"
          onClick={() => setActiveTab("generate")}
          title="Generate a new layer"
        >
          <ImagePlus size={14} /> Add
        </button>
      </div>

      <div className={`layer-list ${dragState ? "is-reordering" : ""}`} role="list" aria-label="Scenery layers">
        {displayLayers.length ? (
          displayLayers.map((layer) => {
            const selected = selectedLayerId === layer.id;
            const transparentWarning =
              layer.metadata.role !== "sky" && !layer.metadata.hasTransparentPixels;
            return (
              <div
                key={layer.id}
                ref={(node) => {
                  if (node) rowRefs.current.set(layer.id, node);
                  else rowRefs.current.delete(layer.id);
                }}
                role="listitem"
                className={`layer-row ${selected ? "selected" : ""} ${dragState?.layerId === layer.id ? "dragging" : ""}`}
                onPointerDown={(event) => beginDrag(event, layer.id)}
                onPointerMove={moveDrag}
                onPointerUp={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }
                  endDrag(true);
                }}
                onPointerCancel={() => endDrag(false)}
              >
                <button
                  type="button"
                  className="drag-handle"
                  aria-label={`Reorder ${layer.name}`}
                  title="Drag to change layer order"
                  onKeyDown={(event) => {
                    if (event.key === "ArrowUp") {
                      event.preventDefault();
                      moveWithKeyboard(layer.id, -1);
                    } else if (event.key === "ArrowDown") {
                      event.preventDefault();
                      moveWithKeyboard(layer.id, 1);
                    }
                  }}
                >
                  <GripVertical size={15} />
                </button>
                <button
                  type="button"
                  className="layer-select"
                  aria-pressed={selected}
                  onClick={() => selectLayer(layer.id)}
                >
                  <span className="layer-thumb checkerboard">
                    {/* Generated media is intentionally not optimized by Next so local URLs work. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mediaUrl(layer.resultUrl)} alt="" />
                  </span>
                  <span className="layer-copy">
                    <strong>{layer.name}</strong>
                    <small>{roleLabels[layer.metadata.role] ?? "Scenery layer"}</small>
                  </span>
                </button>
                {transparentWarning ? (
                  <span className="warning-icon" title="This generated layer is fully opaque">
                    <TriangleAlert size={14} />
                  </span>
                ) : null}
                <button
                  type="button"
                  className="row-icon-button"
                  data-no-reorder
                  aria-label={`${layer.attributes.visible ? "Hide" : "Show"} ${layer.name}`}
                  onClick={() => void toggleVisibility(layer.id)}
                >
                  {layer.attributes.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  type="button"
                  className="row-icon-button danger"
                  data-no-reorder
                  aria-label={`Delete ${layer.name}`}
                  onClick={() => {
                    if (window.confirm(`Delete “${layer.name}”?`)) void deleteLayer(layer.id);
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })
        ) : (
          <div className="empty-layers">
            <span><ImagePlus size={21} /></span>
            <strong>No layers yet</strong>
            <p>Describe a scenery layer and generate your first PNG.</p>
            <button type="button" className="button primary" onClick={() => setActiveTab("generate")}>Generate layer</button>
          </div>
        )}
      </div>

      <div className="layer-panel-footer">
        <span>{document.layers.length} layer{document.layers.length === 1 ? "" : "s"}</span>
        <span>Front layers appear on top</span>
      </div>
    </aside>
  );
}
