import type { SaveHistoryEntry } from "../editor-workspace-store";

export type EditorModeProps = {
  prompt: string;
  saveHistory: SaveHistoryEntry[];
  onAction: (message: string) => void;
  onPromptChange: (value: string) => void;
  renderHeader: (selection: string) => React.ReactNode;
};
