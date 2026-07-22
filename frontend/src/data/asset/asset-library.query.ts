import { useQuery } from "@tanstack/react-query";

import { listMockAssetGroups } from "@/adapters/mock-core-api/repository";
import { assetKeys } from "./keys";

export function useAssetLibraryQuery(projectId: string | undefined) {
  return useQuery({
    queryKey: assetKeys.library(projectId ?? "unselected"),
    queryFn: () => listMockAssetGroups(projectId!),
    enabled: Boolean(projectId),
  });
}
