import { Maximize2, Minimize2, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { animationAudio, nodeMeta, type NodeId } from "../_data/asset-demo-data";
import { PixelCharacter } from "./pixel-character";

type EditorStageProps = {
  selectedNodes: NodeId[];
  selectedFrames: Array<{ node: NodeId; index: number }>;
  onSelect: (node: NodeId) => void;
  onSelectFrame: (node: NodeId, index: number) => void;
  onSelectFrames: (node: NodeId, indexes: number[]) => void;
  onSelectNodes: (nodes: NodeId[]) => void;
  onClearSelection: () => void;
};

type PreviewFrame = {
  id: string;
  direction: string;
  frame: number;
};

type CanvasPosition = {
  x: number;
  y: number;
};

const CANVAS_NODES = [
  "prototype",
  "idle",
  "walk",
  "harvest",
  "jump",
  "celebrate",
] as const satisfies readonly NodeId[];
const ANIMATION_NODES = new Set<NodeId>(["idle", "walk", "harvest", "jump", "celebrate"]);
const DEFAULT_POSITIONS: Record<(typeof CANVAS_NODES)[number], CanvasPosition> = {
  prototype: { x: 160, y: 160 },
  idle: { x: 490, y: 160 },
  walk: { x: 900, y: 160 },
  harvest: { x: 1310, y: 160 },
  jump: { x: 520, y: 700 },
  celebrate: { x: 1060, y: 700 },
};

export function EditorStage({
  selectedNodes,
  selectedFrames,
  onSelect,
  onSelectFrame,
  onSelectFrames,
  onSelectNodes,
  onClearSelection,
}: EditorStageProps) {
  const [positions, setPositions] = useState(DEFAULT_POSITIONS);
  const [canvasScale, setCanvasScale] = useState(0.64);
  const [marquee, setMarquee] = useState<{ start: CanvasPosition; end: CanvasPosition } | null>(
    null,
  );
  const [isMiddlePanning, setIsMiddlePanning] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const getCanvasPoint = (clientX: number, clientY: number) => {
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) return { x: 0, y: 0 };

    return {
      x: (clientX - bounds.left) / canvasScale,
      y: (clientY - bounds.top) / canvasScale,
    };
  };

  return (
    <main
      onPointerDownCapture={(event) => {
        if (event.button === 1) setIsMiddlePanning(true);
      }}
      onPointerUpCapture={(event) => {
        if (event.button === 1) setIsMiddlePanning(false);
      }}
      onPointerCancelCapture={() => setIsMiddlePanning(false)}
      className={`min-h-0 min-w-0 flex-1 overflow-hidden bg-[#eeece7] ${isMiddlePanning ? "cursor-grabbing" : "cursor-default"}`}
    >
      <TransformWrapper
        initialScale={0.64}
        minScale={0.3}
        maxScale={2.5}
        centerOnInit
        limitToBounds={false}
        wheel={{ step: 0.12 }}
        panning={{ velocityDisabled: true, allowLeftClickPan: false, allowMiddleClickPan: true }}
        doubleClick={{ mode: "toggle", step: 1.5 }}
        onTransform={(_, state) => setCanvasScale(state.scale)}
      >
        <TransformComponent wrapperClass="!h-full !w-full" contentClass="!h-auto !w-auto">
          <div
            ref={canvasRef}
            onPointerDown={(event) => {
              if (event.button !== 0 || event.target !== event.currentTarget) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              const start = getCanvasPoint(event.clientX, event.clientY);
              setMarquee({ start, end: start });
            }}
            onPointerMove={(event) => {
              if (!marquee) return;
              setMarquee((current) =>
                current ? { ...current, end: getCanvasPoint(event.clientX, event.clientY) } : null,
              );
            }}
            onPointerUp={(event) => {
              if (!marquee) return;
              event.currentTarget.releasePointerCapture(event.pointerId);
              const end = getCanvasPoint(event.clientX, event.clientY);
              const left = Math.min(marquee.start.x, end.x);
              const right = Math.max(marquee.start.x, end.x);
              const top = Math.min(marquee.start.y, end.y);
              const bottom = Math.max(marquee.start.y, end.y);
              const selected = CANVAS_NODES.filter((node) => {
                const position = positions[node];
                return (
                  position.x < right &&
                  position.x + 224 > left &&
                  position.y < bottom &&
                  position.y + 260 > top
                );
              });

              setMarquee(null);
              if (selected[0]) {
                onSelectNodes(selected);
              } else {
                onClearSelection();
              }
            }}
            className="relative h-[72rem] w-[110rem] touch-none bg-[#eeece7] [background-image:linear-gradient(rgba(52,42,32,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(52,42,32,.08)_1px,transparent_1px)] [background-size:32px_32px]"
          >
            {marquee ? (
              <span
                className="pointer-events-none absolute border border-[#b86b70] bg-[#b86b70]/10"
                style={{
                  left: Math.min(marquee.start.x, marquee.end.x),
                  top: Math.min(marquee.start.y, marquee.end.y),
                  width: Math.abs(marquee.end.x - marquee.start.x),
                  height: Math.abs(marquee.end.y - marquee.start.y),
                }}
              />
            ) : null}
            {CANVAS_NODES.map((node) => (
              <CanvasAsset
                key={node}
                node={node}
                selected={selectedNodes.includes(node)}
                selectedFrames={selectedFrames}
                onSelect={(selectedNode) => {
                  onSelect(selectedNode);
                }}
                onSelectFrame={(selectedNode, index) => {
                  onSelectFrame(selectedNode, index);
                }}
                onSelectFrames={(selectedNode, indexes) => {
                  onSelectFrames(selectedNode, indexes);
                }}
                position={positions[node]}
                canvasScale={canvasScale}
                onMove={(position) => setPositions((current) => ({ ...current, [node]: position }))}
              />
            ))}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </main>
  );
}

function CanvasAsset({
  node,
  selected,
  selectedFrames,
  onSelect,
  onSelectFrame,
  onSelectFrames,
  position,
  canvasScale,
  onMove,
}: {
  node: NodeId;
  selected: boolean;
  selectedFrames: Array<{ node: NodeId; index: number }>;
  onSelect: (node: NodeId) => void;
  onSelectFrame: (node: NodeId, index: number) => void;
  onSelectFrames: (node: NodeId, indexes: number[]) => void;
  position: CanvasPosition;
  canvasScale: number;
  onMove: (position: CanvasPosition) => void;
}) {
  const isAnimation = ANIMATION_NODES.has(node);
  const audio = animationAudio[node];
  const frames = createPreviewFrames(node);
  const [previewFrame, setPreviewFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [frameMarquee, setFrameMarquee] = useState<{
    pointerId: number;
    start: CanvasPosition;
    end: CanvasPosition;
  } | null>(null);
  const [dragStart, setDragStart] = useState<{
    pointerId: number;
    clientX: number;
    clientY: number;
    position: CanvasPosition;
  } | null>(null);
  const frameGridRef = useRef<HTMLDivElement>(null);
  const selectedFrameIndexes = selectedFrames
    .filter((selectedFrame) => selectedFrame.node === node)
    .map((selectedFrame) => selectedFrame.index);
  const selectedFrameIndex = selectedFrameIndexes[0] ?? previewFrame;
  const activeFrame = frames[selectedFrameIndex] ?? frames[0];

  const getFramePoint = (clientX: number, clientY: number) => {
    const bounds = frameGridRef.current?.getBoundingClientRect();
    if (!bounds) return { x: 0, y: 0 };

    return {
      x: (clientX - bounds.left) / canvasScale,
      y: (clientY - bounds.top) / canvasScale,
    };
  };

  useEffect(() => {
    if (selectedFrameIndexes.length > 0) {
      setIsExpanded(true);
    }
  }, [node, selectedFrameIndexes.length]);

  useEffect(() => {
    if (!isPlaying || isExpanded || frames.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setPreviewFrame((current) => (current + 1) % frames.length);
    }, 160);

    return () => window.clearInterval(timer);
  }, [frames.length, isExpanded, isPlaying]);

  return (
    <section
      aria-label={`${nodeMeta[node].label} canvas item`}
      className={`canvas-asset absolute touch-none transition-transform ${isExpanded ? "w-[28rem]" : "w-56"} ${selected ? "scale-[1.03]" : "hover:scale-[1.02]"}`}
      style={{ left: position.x, top: position.y }}
    >
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onSelect(node)}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          event.stopPropagation();
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragStart({
            pointerId: event.pointerId,
            clientX: event.clientX,
            clientY: event.clientY,
            position,
          });
          onSelect(node);
        }}
        onPointerMove={(event) => {
          if (!dragStart || dragStart.pointerId !== event.pointerId) return;
          onMove({
            x: Math.max(
              24,
              Math.min(
                isExpanded ? 1288 : 1512,
                dragStart.position.x + (event.clientX - dragStart.clientX) / canvasScale,
              ),
            ),
            y: Math.max(
              24,
              Math.min(
                isExpanded ? 320 : 868,
                dragStart.position.y + (event.clientY - dragStart.clientY) / canvasScale,
              ),
            ),
          });
        }}
        onPointerUp={(event) => {
          if (dragStart?.pointerId !== event.pointerId) return;
          event.currentTarget.releasePointerCapture(event.pointerId);
          setDragStart(null);
        }}
        className="flex w-full flex-col items-center gap-3 text-left"
      >
        <span
          className={`rounded-md border bg-white/90 px-2.5 py-1 font-mono text-[11px] text-[#51493f] shadow-sm ${selected ? "border-[#b86b70] ring-2 ring-[#b86b70]/20" : "border-black/10"}`}
        >
          {nodeMeta[node].label}
        </span>
        {!isExpanded ? (
          <span className="grid h-48 w-full place-items-center">
            <PixelCharacter
              direction={activeFrame.direction}
              frame={activeFrame.frame}
              className="h-36 w-[6.4rem] gap-[2px]"
            />
          </span>
        ) : null}
      </button>

      {isExpanded ? (
        <div
          ref={frameGridRef}
          onPointerDown={(event) => {
            if (event.button !== 0 || event.target !== event.currentTarget) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            const start = getFramePoint(event.clientX, event.clientY);
            setFrameMarquee({ pointerId: event.pointerId, start, end: start });
          }}
          onPointerMove={(event) => {
            if (!frameMarquee || frameMarquee.pointerId !== event.pointerId) return;
            setFrameMarquee((current) =>
              current ? { ...current, end: getFramePoint(event.clientX, event.clientY) } : null,
            );
          }}
          onPointerUp={(event) => {
            if (!frameMarquee || frameMarquee.pointerId !== event.pointerId) return;
            event.currentTarget.releasePointerCapture(event.pointerId);
            const end = getFramePoint(event.clientX, event.clientY);
            const left = Math.min(frameMarquee.start.x, end.x);
            const right = Math.max(frameMarquee.start.x, end.x);
            const top = Math.min(frameMarquee.start.y, end.y);
            const bottom = Math.max(frameMarquee.start.y, end.y);
            const frameIndexes = Array.from(
              event.currentTarget.querySelectorAll<HTMLButtonElement>("button[data-frame-index]"),
            ).flatMap((button) => {
              const bounds = button.getBoundingClientRect();
              const gridBounds = event.currentTarget.getBoundingClientRect();
              const frameLeft = (bounds.left - gridBounds.left) / canvasScale;
              const frameRight = (bounds.right - gridBounds.left) / canvasScale;
              const frameTop = (bounds.top - gridBounds.top) / canvasScale;
              const frameBottom = (bounds.bottom - gridBounds.top) / canvasScale;
              const index = Number(button.dataset.frameIndex);

              return frameLeft < right &&
                frameRight > left &&
                frameTop < bottom &&
                frameBottom > top
                ? [index]
                : [];
            });

            setFrameMarquee(null);
            if (frameIndexes.length > 0) onSelectFrames(node, frameIndexes);
          }}
          className="relative mt-3 grid w-full grid-cols-4 gap-4"
        >
          {frameMarquee ? (
            <span
              className="pointer-events-none absolute z-10 border border-[#b86b70] bg-[#b86b70]/10"
              style={{
                left: Math.min(frameMarquee.start.x, frameMarquee.end.x),
                top: Math.min(frameMarquee.start.y, frameMarquee.end.y),
                width: Math.abs(frameMarquee.end.x - frameMarquee.start.x),
                height: Math.abs(frameMarquee.end.y - frameMarquee.start.y),
              }}
            />
          ) : null}
          {frames.map((frame, index) => (
            <button
              key={frame.id}
              data-frame-index={index}
              type="button"
              aria-label={`${nodeMeta[node].label} frame ${index + 1}`}
              aria-pressed={selectedFrameIndexes.includes(index)}
              onClick={() => {
                onSelectFrame(node, index);
              }}
              className={`grid h-48 place-items-center transition-transform hover:scale-105 ${selectedFrameIndexes.includes(index) ? "ring-2 ring-[#b86b70] ring-offset-2 ring-offset-[#eeece7]" : ""}`}
            >
              <PixelCharacter
                direction={frame.direction}
                frame={frame.frame}
                className="h-36 w-[6.4rem] gap-[2px]"
              />
            </button>
          ))}
        </div>
      ) : null}

      {audio ? <AudioWaveform label={audio.label} /> : null}

      {isAnimation ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={isExpanded}
            onClick={() => {
              onSelect(node);
              setIsPlaying((current) => !current);
            }}
            className="inline-flex h-8 items-center gap-2 rounded-md border border-black/10 px-3 text-xs font-medium text-[#51493f] transition-colors hover:bg-black/[.04] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={() => {
              onSelect(node);
              setIsPlaying(false);
              setIsExpanded((current) => !current);
            }}
            className="inline-flex h-8 items-center gap-2 rounded-md border border-black/10 px-3 text-xs font-medium text-[#51493f] transition-colors hover:bg-black/[.04]"
          >
            {isExpanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        </div>
      ) : null}
    </section>
  );
}

function AudioWaveform({ label }: { label: string }) {
  const bars = [
    34, 52, 72, 48, 88, 62, 42, 76, 56, 92, 46, 70, 38, 64, 84, 54, 74, 44, 66, 90, 58, 36, 76, 50,
  ];

  return (
    <div
      aria-label={`Attached audio: ${label}`}
      className="mt-4 flex h-16 items-center justify-center gap-1 overflow-hidden rounded-lg border border-black/10 bg-white/70 px-3"
    >
      {bars.map((height, index) => (
        <span
          key={`${height}-${index}`}
          className="w-px rounded-full bg-[#81786d]/45"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
}

function createPreviewFrames(node: NodeId): PreviewFrame[] {
  const frameCount = Number.parseInt(nodeMeta[node].count ?? "1", 10) || 1;

  return Array.from({ length: frameCount }, (_, index) => ({
    id: `${node}-${index + 1}`,
    direction: "south",
    frame: index,
  }));
}
