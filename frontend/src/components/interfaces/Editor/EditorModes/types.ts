import type { AssetRecord } from "@/types/asset-record";
import type { EditorCanvasPosition } from "@/types/editor-document";

export type EditorModeProps = {
  prompt: string;
  history: AssetRecord[];
  characterNodePositions?: Record<string, EditorCanvasPosition>;
  onAction: (message: string) => void;
  onCharacterPositionChange: (
    nodeId: string,
    position: EditorCanvasPosition,
  ) => void;
  onPromptChange: (value: string) => void;
  renderHeader: (selection: string) => React.ReactNode;
};
