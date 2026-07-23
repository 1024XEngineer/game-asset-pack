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
  saveMockAssetRevision,
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

  it("creates a new current record when an asset draft is saved", async () => {
    const before = await listMockAssetGroups("moonlit-orchard");
    const asset = before[0]?.assets[0];
    expect(asset).toBeDefined();
    if (!asset) return;

    const groups = await saveMockAssetRevision("moonlit-orchard", asset.id, {
      prompt: "Move the forager to the left",
      character: {
        nodePositions: { prototype: { x: 120, y: 160 } },
      },
    });
    const savedAsset = groups
      .flatMap((group) => group.assets)
      .find((item) => item.id === asset.id);
    const nextVersion = `v${Number(asset.version.slice(1)) + 1}`;

    expect(savedAsset).toMatchObject({
      version: nextVersion,
      description: "Move the forager to the left",
    });
    expect(savedAsset?.history[0]).toMatchObject({
      version: nextVersion,
      isCurrent: true,
      editorDocument: {
        character: { nodePositions: { prototype: { x: 120, y: 160 } } },
      },
    });
    expect(savedAsset?.history.slice(1)).toEqual(
      expect.arrayContaining([expect.objectContaining({ isCurrent: false })]),
    );
  });
});
