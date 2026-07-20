"use client";

import Konva from "konva";
import { Expand, Hand, LocateFixed, Minus, MousePointer2, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Group, Image as KonvaImage, Layer, Rect, Stage, Text, Transformer } from "react-konva";

import { mediaUrl } from "@/lib/api";
import { useSceneryStore } from "@/stores/scenery-store";
import type { LayerAsset } from "@/types/scenery";

type Viewport = { x: number; y: number; scale: number };

function useLoadedImage(url: string): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const next = new window.Image();
    next.crossOrigin = "anonymous";
    next.onload = () => setImage(next);
    next.src = url;
    return () => {
      next.onload = null;
    };
  }, [url]);
  return image;
}

function LayerImage({
  layer,
  selected,
  onSelect,
  onNode,
  onCommit,
}: {
  layer: LayerAsset;
  selected: boolean;
  onSelect: () => void;
  onNode: (node: Konva.Image | null) => void;
  onCommit: (node: Konva.Image) => void;
}) {
  const image = useLoadedImage(mediaUrl(layer.resultUrl));
  const { position, scale, size, rotation, opacity } = layer.attributes;
  if (!layer.attributes.visible || !image) return null;

  return (
    <KonvaImage
      ref={onNode}
      image={image}
      name={`layer-${layer.id}`}
      x={position.x + (size.width * scale.x) / 2}
      y={position.y + (size.height * scale.y) / 2}
      width={size.width}
      height={size.height}
      offsetX={size.width / 2}
      offsetY={size.height / 2}
      scaleX={scale.x}
      scaleY={scale.y}
      rotation={rotation}
      opacity={opacity}
      draggable
      shadowColor={selected ? "#d99096" : undefined}
      shadowBlur={selected ? 12 : 0}
      shadowOpacity={selected ? 0.85 : 0}
      onClick={(event) => {
        event.cancelBubble = true;
        onSelect();
      }}
      onTap={(event) => {
        event.cancelBubble = true;
        onSelect();
      }}
      onDragStart={onSelect}
      onDragEnd={(event) => onCommit(event.target as Konva.Image)}
      onTransformEnd={(event) => onCommit(event.target as Konva.Image)}
    />
  );
}

export function SceneryCanvas() {
  const document = useSceneryStore((state) => state.document);
  const selectedLayerId = useSceneryStore((state) => state.selectedLayerId);
  const selectLayer = useSceneryStore((state) => state.selectLayer);
  const patchLayer = useSceneryStore((state) => state.patchLayer);
  const setActiveTab = useSceneryStore((state) => state.setActiveTab);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef(new Map<number, Konva.Image>());
  const [size, setSize] = useState({ width: 900, height: 700 });
  const [viewport, setViewport] = useState<Viewport>({ x: 80, y: 80, scale: 0.45 });
  const [panMode, setPanMode] = useState(false);

  const scenery = document?.scenery;
  const layers = useMemo(
    () =>
      [...(document?.layers ?? [])].sort(
        (a, b) => a.attributes.zIndex - b.attributes.zIndex || a.siblingOrder - b.siblingOrder,
      ),
    [document?.layers],
  );

  const fit = useCallback(() => {
    if (!scenery) return;
    const padding = 112;
    const scale = Math.min(
      (size.width - padding) / scenery.attributes.width,
      (size.height - padding) / scenery.attributes.height,
      1,
    );
    setViewport({
      scale: Math.max(0.08, scale),
      x: (size.width - scenery.attributes.width * scale) / 2,
      y: (size.height - scenery.attributes.height * scale) / 2,
    });
  }, [scenery, size]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fit();
  }, [fit]);

  useEffect(() => {
    const transformer = transformerRef.current;
    const node = selectedLayerId ? nodeRefs.current.get(selectedLayerId) : undefined;
    transformer?.nodes(node ? [node] : []);
    transformer?.getLayer()?.batchDraw();
  }, [selectedLayerId, layers]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.code === "Space" && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();
        setPanMode(true);
      }
    };
    const up = (event: KeyboardEvent) => {
      if (event.code === "Space") setPanMode(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  if (!document || !scenery) return null;

  const commitNode = (layer: LayerAsset, node: Konva.Image) => {
    const scaleX = Math.max(0.01, Math.abs(node.scaleX()));
    const scaleY = Math.max(0.01, Math.abs(node.scaleY()));
    void patchLayer(layer.id, {
      position: {
        x: node.x() - (layer.attributes.size.width * scaleX) / 2,
        y: node.y() - (layer.attributes.size.height * scaleY) / 2,
      },
      scale: { x: scaleX, y: scaleY },
      rotation: node.rotation(),
    });
  };

  const updateZoom = (nextScale: number) => {
    const scale = Math.min(3, Math.max(0.05, nextScale));
    setViewport((current) => ({
      scale,
      x: size.width / 2 - ((size.width / 2 - current.x) / current.scale) * scale,
      y: size.height / 2 - ((size.height / 2 - current.y) / current.scale) * scale,
    }));
  };

  return (
    <section ref={containerRef} className={`canvas-workspace ${panMode ? "is-panning" : ""}`}>
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        x={viewport.x}
        y={viewport.y}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
        draggable={panMode}
        onDragEnd={(event) => {
          // Drag events from layer images bubble to the stage. Only update the
          // viewport when the stage itself was dragged in pan mode; otherwise
          // the layer's position would be mistaken for the stage position.
          if (event.target !== stageRef.current) return;
          setViewport((current) => ({ ...current, x: event.target.x(), y: event.target.y() }));
        }}
        onMouseDown={(event) => {
          if (event.evt.button === 1) setPanMode(true);
          if (event.target === event.target.getStage()) selectLayer(null);
        }}
        onMouseUp={(event) => {
          if (event.evt.button === 1) setPanMode(false);
        }}
        onWheel={(event) => {
          event.evt.preventDefault();
          const stage = stageRef.current;
          const pointer = stage?.getPointerPosition();
          if (!pointer) return;
          const oldScale = viewport.scale;
          const point = {
            x: (pointer.x - viewport.x) / oldScale,
            y: (pointer.y - viewport.y) / oldScale,
          };
          const direction = event.evt.deltaY > 0 ? -1 : 1;
          const scale = Math.min(3, Math.max(0.05, oldScale * (direction > 0 ? 1.12 : 1 / 1.12)));
          setViewport({
            scale,
            x: pointer.x - point.x * scale,
            y: pointer.y - point.y * scale,
          });
        }}
      >
        <Layer>
          <Group>
            <Rect
              x={0}
              y={0}
              width={scenery.attributes.width}
              height={scenery.attributes.height}
              fill="#f7f6f3"
              shadowColor="#382f28"
              shadowBlur={34}
              shadowOpacity={0.18}
              shadowOffsetY={12}
              cornerRadius={10 / viewport.scale}
              listening={false}
            />
            <Group
              clipX={0}
              clipY={0}
              clipWidth={scenery.attributes.width}
              clipHeight={scenery.attributes.height}
            >
              {layers.map((layer) => (
                <LayerImage
                  key={layer.id}
                  layer={layer}
                  selected={selectedLayerId === layer.id}
                  onSelect={() => selectLayer(layer.id)}
                  onNode={(node) => {
                    if (node) nodeRefs.current.set(layer.id, node);
                    else nodeRefs.current.delete(layer.id);
                  }}
                  onCommit={(node) => commitNode(layer, node)}
                />
              ))}
            </Group>
            <Rect
              x={0}
              y={0}
              width={scenery.attributes.width}
              height={scenery.attributes.height}
              stroke="#574d43"
              strokeWidth={1 / viewport.scale}
              opacity={0.22}
              listening={false}
            />
            <Transformer
              ref={transformerRef}
              flipEnabled={false}
              keepRatio={false}
              rotateEnabled
              borderStroke="#c96f78"
              borderStrokeWidth={1.5 / viewport.scale}
              anchorStroke="#c96f78"
              anchorFill="#ffffff"
              anchorCornerRadius={2 / viewport.scale}
              anchorSize={10 / viewport.scale}
              rotateAnchorOffset={28 / viewport.scale}
              enabledAnchors={[
                "top-left",
                "top-center",
                "top-right",
                "middle-left",
                "middle-right",
                "bottom-left",
                "bottom-center",
                "bottom-right",
              ]}
              boundBoxFunc={(oldBox, newBox) =>
                Math.abs(newBox.width) < 4 || Math.abs(newBox.height) < 4 ? oldBox : newBox
              }
            />
          </Group>
        </Layer>
      </Stage>

      {!layers.length ? (
        <div className="canvas-empty-state">
          <span><Expand size={23} /></span>
          <strong>Your scenery canvas is ready</strong>
          <p>Generate isolated PNG layers from the panel on the right, then arrange them here.</p>
          <button type="button" className="button primary" onClick={() => setActiveTab("generate")}>Generate first layer</button>
        </div>
      ) : null}

      <div className="canvas-toolbar" aria-label="Canvas tools">
        <button type="button" className={!panMode ? "active" : ""} onClick={() => setPanMode(false)} title="Select tool">
          <MousePointer2 size={16} />
        </button>
        <button type="button" className={panMode ? "active" : ""} onClick={() => setPanMode((value) => !value)} title="Pan tool (hold Space)">
          <Hand size={16} />
        </button>
        <i />
        <button type="button" onClick={() => updateZoom(viewport.scale / 1.2)} title="Zoom out"><Minus size={16} /></button>
        <span>{Math.round(viewport.scale * 100)}%</span>
        <button type="button" onClick={() => updateZoom(viewport.scale * 1.2)} title="Zoom in"><Plus size={16} /></button>
        <button type="button" onClick={fit} title="Fit scenery"><LocateFixed size={16} /></button>
      </div>
      <div className="canvas-coordinates">
        {scenery.attributes.width} × {scenery.attributes.height} px
      </div>
    </section>
  );
}
