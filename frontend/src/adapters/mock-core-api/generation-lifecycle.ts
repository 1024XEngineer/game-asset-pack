import { completeMockGeneration } from "./generation";
import {
  createMockGenerationRun,
  removeMockGenerationRun,
  updateMockGenerationRun,
} from "./generation-repository";
import { addMockAsset, hasMockProject } from "./repository";
import { createGenerationLifecycle } from "@/data/generation/generation-lifecycle";

export const mockGenerationLifecycle = createGenerationLifecycle({
  createRun: createMockGenerationRun,
  updateRun: updateMockGenerationRun,
  removeRun: removeMockGenerationRun,
  completeGeneration: completeMockGeneration,
  hasProject: hasMockProject,
  addAsset: addMockAsset,
});
