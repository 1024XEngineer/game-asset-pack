import { useMutation, useQueryClient } from "@tanstack/react-query";

import { mockGenerationLifecycle } from "@/adapters/mock-core-api/generation-lifecycle";
import type {
  GenerationInput,
  GenerationLifecycleUpdate,
} from "./generation-lifecycle";
import type { GenerationRun } from "@/types/generation";
import { assetKeys } from "@/data/asset/keys";
import { generationKeys } from "./keys";

export function useEnqueueGenerationMutation() {
  const queryClient = useQueryClient();

  const projectUpdate = (update: GenerationLifecycleUpdate) => {
    const queryKey = generationKeys.runs(
      update.kind === "run-upserted" ? update.run.projectId : update.projectId,
    );
    if (
      update.kind === "run-removed" &&
      queryClient.getQueryData(queryKey) === undefined
    ) {
      return;
    }

    queryClient.setQueryData<GenerationRun[]>(queryKey, (current = []) =>
      update.kind === "run-upserted"
        ? [...current.filter((run) => run.id !== update.run.id), update.run]
        : current.filter((run) => run.id !== update.runId),
    );
  };

  return useMutation({
    mutationFn: (input: GenerationInput) =>
      mockGenerationLifecycle.enqueue(input, projectUpdate),
    onSuccess: ({ assetGroups, run }) => {
      if (!assetGroups) return;
      queryClient.setQueryData(assetKeys.library(run.projectId), assetGroups);
    },
  });
}
