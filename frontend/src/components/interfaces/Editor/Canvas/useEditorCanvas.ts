import { useRef, useState } from "react";
import { DEFAULT_CANVAS_POSITIONS, type CanvasPosition } from "./Canvas.constants";

export function useEditorCanvas() {
  const [positions, setPositions] = useState(DEFAULT_CANVAS_POSITIONS);
  const [canvasScale, setCanvasScale] = useState(0.64);
  const [isMiddlePanning, setIsMiddlePanning] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const getCanvasPoint = (clientX: number, clientY: number): CanvasPosition => {
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) return { x: 0, y: 0 };

    return {
      x: (clientX - bounds.left) / canvasScale,
      y: (clientY - bounds.top) / canvasScale,
    };
  };

  return {
    positions,
    setPositions,
    canvasScale,
    setCanvasScale,
    isMiddlePanning,
    setIsMiddlePanning,
    canvasRef,
    getCanvasPoint,
  };
}
