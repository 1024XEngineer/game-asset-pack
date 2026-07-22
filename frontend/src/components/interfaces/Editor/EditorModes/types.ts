import type { SaveHistoryEntry } from "@/state/editor-workspace-state";

export type EditorModeProps = {
  prompt: string;
  saveHistory: SaveHistoryEntry[];
  onAction: (message: string) => void;
  onPromptChange: (value: string) => void;
  renderHeader: (selection: string) => React.ReactNode;
};
