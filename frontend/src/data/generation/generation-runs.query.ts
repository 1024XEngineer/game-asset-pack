import { useQuery } from "@tanstack/react-query";

import { listMockGenerationRuns } from "@/adapters/mock-core-api/generation-repository";
import { generationKeys } from "./keys";

export function useGenerationRunsQuery(projectId: string | undefined) {
  return useQuery({
    queryKey: generationKeys.runs(projectId ?? "unselected"),
    queryFn: () => listMockGenerationRuns(projectId!),
    enabled: Boolean(projectId),
  });
}
