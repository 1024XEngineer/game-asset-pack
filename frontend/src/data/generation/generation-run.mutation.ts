import { useMutation, useQueryClient } from "@tanstack/react-query";

import { completeMockGeneration } from "@/adapters/mock-core-api/generation";
import {
  createMockGenerationRun,
  removeMockGenerationRun,
  updateMockGenerationRun,
} from "@/adapters/mock-core-api/generation-repository";
import {
  addMockAsset,
  hasMockProject,
} from "@/adapters/mock-core-api/repository";
import type { CreationRequest, GenerationRun } from "@/types/generation";
import { assetKeys } from "@/data/asset/keys";
import { generationKeys } from "./keys";

type GenerationInput = { projectId: string; request: CreationRequest };

export function useEnqueueGenerationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, request }: GenerationInput) => {
      const queuedRun = createMockGenerationRun({ ...request, projectId });
      queryClient.setQueryData<GenerationRun[]>(
        generationKeys.runs(projectId),
        (current = []) => [...current, queuedRun],
      );

      const processingRun = updateMockGenerationRun({
        ...queuedRun,
        status: "processing",
      });
      queryClient.setQueryData<GenerationRun[]>(
        generationKeys.runs(projectId),
        (current = []) =>
          current.map((run) =>
            run.id === processingRun.id ? processingRun : run,
          ),
      );

      try {
        const generated = await completeMockGeneration(processingRun);
        if (!hasMockProject(projectId)) {
          removeMockGenerationRun(processingRun.id);
          return { run: processingRun };
        }
        const assetGroups = await addMockAsset(
          projectId,
          generated.kind,
          generated.asset,
        );
        removeMockGenerationRun(processingRun.id);
        return { assetGroups, run: processingRun };
      } catch (error) {
        const failedRun = updateMockGenerationRun({
          ...processingRun,
          status: "failed",
        });
        queryClient.setQueryData<GenerationRun[]>(
          generationKeys.runs(projectId),
          (current = []) =>
            current.map((run) => (run.id === failedRun.id ? failedRun : run)),
        );
        throw error;
      }
    },
    onSuccess: ({ assetGroups, run }) => {
      if (!assetGroups) return;
      queryClient.setQueryData(assetKeys.library(run.projectId), assetGroups);
      queryClient.setQueryData<GenerationRun[]>(
        generationKeys.runs(run.projectId),
        (current = []) => current.filter((item) => item.id !== run.id),
      );
    },
  });
}
