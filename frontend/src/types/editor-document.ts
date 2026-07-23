export type EditorCanvasPosition = {
  x: number;
  y: number;
};

export type AssetEditorDocument = {
  prompt: string;
  character?: {
    nodePositions: Record<string, EditorCanvasPosition>;
  };
};
