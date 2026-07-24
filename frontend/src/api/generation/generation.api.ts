import { mockGenerationLifecycle } from "./generation.mock-lifecycle";
import { listMockGenerationRuns } from "./generation-run.mock";
import type {
  GenerationInput,
  GenerationLifecycleUpdate,
} from "./generation-lifecycle";

export const generationApi = {
  listRuns: (projectId: string) => listMockGenerationRuns(projectId),
  enqueue: (
    input: GenerationInput,
    onUpdate: (update: GenerationLifecycleUpdate) => void,
  ) => mockGenerationLifecycle.enqueue(input, onUpdate),
};
