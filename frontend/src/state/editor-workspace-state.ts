export type EditorWorkspaceStatus = {
  statusText: string;
  canUndo: boolean;
  canRedo: boolean;
  prompt: string;
};

export const defaultEditorWorkspaceStatus: EditorWorkspaceStatus = {
  statusText: "All changes saved",
  canUndo: true,
  canRedo: false,
  prompt: "",
};
