import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addMockAsset } from "@/adapters/mock-core-api/repository";
import type { ProjectAsset } from "@/types/asset";
import type { AssetKind } from "@/types/asset-kind";
import { assetKeys } from "./keys";

type AddAssetInput = {
  projectId: string;
  kind: AssetKind;
  asset: ProjectAsset;
};

export function useAddAssetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, kind, asset }: AddAssetInput) =>
      addMockAsset(projectId, kind, asset),
    onSuccess: (assetGroups, { projectId }) => {
      queryClient.setQueryData(assetKeys.library(projectId), assetGroups);
    },
  });
}
