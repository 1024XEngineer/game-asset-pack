import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteMockAsset } from "@/adapters/mock-core-api/repository";
import { assetKeys } from "./keys";

type DeleteAssetInput = { projectId: string; assetId: string };

export function useDeleteAssetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, assetId }: DeleteAssetInput) =>
      deleteMockAsset(projectId, assetId),
    onSuccess: (assetGroups, { projectId }) => {
      queryClient.setQueryData(assetKeys.library(projectId), assetGroups);
    },
  });
}
