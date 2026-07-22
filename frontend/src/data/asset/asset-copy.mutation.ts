import { useMutation, useQueryClient } from "@tanstack/react-query";

import { copyMockAsset } from "@/adapters/mock-core-api/repository";
import { assetKeys } from "./keys";

type CopyAssetInput = { projectId: string; assetId: string };

export function useCopyAssetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, assetId }: CopyAssetInput) =>
      copyMockAsset(projectId, assetId),
    onSuccess: (assetGroups, { projectId }) => {
      queryClient.setQueryData(assetKeys.library(projectId), assetGroups);
    },
  });
}
