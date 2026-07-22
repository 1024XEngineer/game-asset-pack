import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createMockProject } from "@/adapters/mock-core-api/repository";
import type { ProjectSummary } from "@/modules/project/model";
import { projectKeys } from "./keys";

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMockProject,
    onSuccess: (project) => {
      queryClient.setQueryData<ProjectSummary[]>(
        projectKeys.list(),
        (current = []) => [...current, project],
      );
    },
  });
}
