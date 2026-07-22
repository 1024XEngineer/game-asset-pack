import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateMockProject } from "@/adapters/mock-core-api/repository";
import type { ProjectSummary } from "@/modules/project/model";
import { projectKeys } from "./keys";

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMockProject,
    onSuccess: (project) => {
      queryClient.setQueryData<ProjectSummary[]>(
        projectKeys.list(),
        (current = []) =>
          current.map((item) => (item.id === project.id ? project : item)),
      );
    },
  });
}
