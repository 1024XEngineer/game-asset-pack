import { create } from "zustand";
import { temporal } from "zundo";

export type SaveHistoryEntry = {
  id: string;
  savedAt: string;
  description: string;
  selection: string;
};

type EditorWorkspaceStore = {
  prompt: string;
  saveHistory: SaveHistoryEntry[];
  setPrompt: (prompt: string) => void;
  addSaveHistory: (entry: SaveHistoryEntry) => void;
  reset: (prompt: string) => void;
};

export const useEditorWorkspaceStore = create<EditorWorkspaceStore>()(
  temporal(
    (set) => ({
      prompt: "",
      saveHistory: [],
      setPrompt: (prompt) => set({ prompt }),
      addSaveHistory: (entry) =>
        set((state) => ({ saveHistory: [entry, ...state.saveHistory] })),
      reset: (prompt) => set({ prompt, saveHistory: [] }),
    }),
    {
      limit: 100,
      partialize: (state) => ({
        prompt: state.prompt,
        saveHistory: state.saveHistory,
      }),
    },
  ),
);
