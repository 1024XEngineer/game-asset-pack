import { afterEach, describe, expect, it } from "vitest";

import {
  createMockGenerationRun,
  listMockGenerationRuns,
} from "./generation-repository";
import {
  addMockAsset,
  copyMockAsset,
  deleteMockAsset,
  deleteMockProject,
  listMockAssetGroups,
  listMockProjects,
  resetMockRepository,
} from "./repository";

afterEach(() => {
  resetMockRepository();
});

describe("mock core API repository", () => {
  it("keeps asset changes scoped to their project", async () => {
    const initialMoonlitGroups = await listMockAssetGroups("moonlit-orchard");

    await addMockAsset("iron-harbor", "ui", {
      id: "harbor-hud",
      name: "Harbor HUD",
      description: "Riveted brass health bar",
      version: "v1",
      canvasSize: "128 x 32 px",
      perspective: "Front view",
      tags: ["ui"],
      history: [],
      animations: [],
    });
    await copyMockAsset("iron-harbor", "harbor-hud");
    await deleteMockAsset("iron-harbor", "harbor-hud");

    expect(await listMockAssetGroups("moonlit-orchard")).toEqual(
      initialMoonlitGroups,
    );
    expect((await listMockAssetGroups("iron-harbor"))[0]?.assets).toEqual([
      expect.objectContaining({ name: "Harbor HUD Copy" }),
    ]);
  });

  it("removes an asset library with its deleted project", async () => {
    createMockGenerationRun({
      projectId: "moonlit-orchard",
      kind: "character",
      name: "Forager",
      prompt: "Moonlit orchard explorer",
      canvasSize: "32 x 32 px",
      useProjectContext: true,
    });
    await deleteMockProject("moonlit-orchard");

    expect(await listMockProjects()).not.toContainEqual(
      expect.objectContaining({ id: "moonlit-orchard" }),
    );
    expect(await listMockAssetGroups("moonlit-orchard")).toEqual([]);
    expect(await listMockGenerationRuns("moonlit-orchard")).toEqual([]);
  });
});
