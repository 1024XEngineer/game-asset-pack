import type { GenerationRun } from "@/modules/generation/model";

let runs: GenerationRun[] = [];

export async function listMockGenerationRuns(projectId: string) {
  return runs.filter((run) => run.projectId === projectId);
}

export function createMockGenerationRun(
  run: Omit<GenerationRun, "id" | "status">,
) {
  const createdRun: GenerationRun = {
    ...run,
    id: crypto.randomUUID(),
    status: "queued",
  };
  runs = [...runs, createdRun];
  return createdRun;
}

export function updateMockGenerationRun(run: GenerationRun) {
  runs = runs.map((item) => (item.id === run.id ? run : item));
  return run;
}

export function removeMockGenerationRun(runId: string) {
  runs = runs.filter((run) => run.id !== runId);
}

export function removeMockProjectGenerationRuns(projectId: string) {
  runs = runs.filter((run) => run.projectId !== projectId);
}

export function resetMockGenerationRepository() {
  runs = [];
}
