import { useMutation, useQueryClient } from "@tanstack/react-query";

import { saveMockAssetRevision } from "@/adapters/mock-core-api/repository";
import type { AssetEditorDocument } from "@/types/editor-document";
import { assetKeys } from "./keys";

type SaveAssetRevisionInput = {
  projectId: string;
  assetId: string;
  editorDocument: AssetEditorDocument;
};

export function useSaveAssetRevisionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      assetId,
      editorDocument,
    }: SaveAssetRevisionInput) =>
      saveMockAssetRevision(projectId, assetId, editorDocument),
    onSuccess: (assetGroups, { projectId }) => {
      queryClient.setQueryData(assetKeys.library(projectId), assetGroups);
    },
  });
}
