import type { AssetRecord } from "@/types/record";
import type {
  EditorCanvasPosition,
  EditorCharacterAnimation,
} from "@/types/record";

export type EditorModeProps = {
  prompt: string;
  history: AssetRecord[];
  characterAnimations: EditorCharacterAnimation[];
  characterNodePositions?: Record<string, EditorCanvasPosition>;
  onAction: (message: string) => void;
  onCharacterPositionChange: (
    nodeId: string,
    position: EditorCanvasPosition,
  ) => void;
  onPromptChange: (value: string) => void;
  renderHeader: (selection: string) => React.ReactNode;
};
