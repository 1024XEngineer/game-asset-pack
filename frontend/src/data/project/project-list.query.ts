import { useQuery } from "@tanstack/react-query";

import { listMockProjects } from "@/adapters/mock-core-api/repository";
import { projectKeys } from "./keys";

export function useProjectListQuery() {
  return useQuery({ queryKey: projectKeys.list(), queryFn: listMockProjects });
}
