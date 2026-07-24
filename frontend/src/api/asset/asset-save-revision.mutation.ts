import { useMutation, useQueryClient } from "@tanstack/react-query";

import { assetApi } from "./asset.api";
import { editorKeys } from "@/api/editor/editor.keys";
import type {
  AssetEditorDocument,
  EditorDocumentData,
} from "@/types/editor-document";
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
      assetApi.saveRevision(projectId, assetId, editorDocument),
    onSuccess: async (assetGroups, { assetId, editorDocument, projectId }) => {
      queryClient.setQueryData(assetKeys.library(projectId), assetGroups);
      const savedAsset = assetGroups
        .flatMap((group) => group.assets)
        .find((asset) => asset.id === assetId);
      queryClient.setQueryData(
        editorKeys.document(projectId, assetId),
        (current: EditorDocumentData | undefined) =>
          current && savedAsset
            ? {
                ...current,
                asset: {
                  ...current.asset,
                  version: savedAsset.version,
                  history: structuredClone(savedAsset.history),
                },
                document: structuredClone(editorDocument),
              }
            : current,
      );
      await queryClient.invalidateQueries({
        queryKey: editorKeys.document(projectId, assetId),
      });
    },
  });
}
