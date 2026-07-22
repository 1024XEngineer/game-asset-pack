import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteMockProject } from "@/adapters/mock-core-api/repository";
import { assetKeys } from "@/data/asset/keys";
import { generationKeys } from "@/data/generation/keys";
import type { ProjectSummary } from "@/types/project";
import { projectKeys } from "./keys";

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMockProject,
    onSuccess: (_, projectId) => {
      queryClient.setQueryData<ProjectSummary[]>(
        projectKeys.list(),
        (current = []) => current.filter((project) => project.id !== projectId),
      );
      queryClient.removeQueries({ queryKey: assetKeys.library(projectId) });
      queryClient.removeQueries({ queryKey: generationKeys.runs(projectId) });
    },
  });
}
