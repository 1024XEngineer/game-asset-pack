export const editorKeys = {
  all: ["editor"] as const,
  document: (projectId: string, assetId: string) =>
    [...editorKeys.all, "document", projectId, assetId] as const,
};
