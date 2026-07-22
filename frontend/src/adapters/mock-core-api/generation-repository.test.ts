import { afterEach, describe, expect, it } from "vitest";

import {
  createMockGenerationRun,
  listMockGenerationRuns,
  removeMockGenerationRun,
  resetMockGenerationRepository,
  updateMockGenerationRun,
} from "./generation-repository";

afterEach(() => {
  resetMockGenerationRepository();
});

describe("mock generation repository", () => {
  it("lists and removes runs from the requested project only", async () => {
    const harborRun = createMockGenerationRun({
      projectId: "iron-harbor",
      kind: "ui",
      name: "Harbor HUD",
      prompt: "Riveted brass health bar",
      canvasSize: "128 x 32 px",
      useProjectContext: true,
    });
    createMockGenerationRun({
      projectId: "moonlit-orchard",
      kind: "character",
      name: "Forager",
      prompt: "Moonlit orchard explorer",
      canvasSize: "32 x 32 px",
      useProjectContext: true,
    });

    expect(await listMockGenerationRuns("iron-harbor")).toEqual([
      expect.objectContaining({ id: harborRun.id, status: "queued" }),
    ]);

    updateMockGenerationRun({ ...harborRun, status: "processing" });
    removeMockGenerationRun(harborRun.id);

    expect(await listMockGenerationRuns("iron-harbor")).toEqual([]);
    expect(await listMockGenerationRuns("moonlit-orchard")).toHaveLength(1);
  });
});
