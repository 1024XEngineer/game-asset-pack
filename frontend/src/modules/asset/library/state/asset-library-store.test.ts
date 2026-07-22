import { describe, expect, it, vi } from "vitest";

import { completeMockGeneration } from "@/adapters/mock-core-api/generation";
import type { AssetGroupsByProject } from "@/modules/asset/library/model";
import type { GenerationRun } from "@/modules/generation/model";
import {
  addAssetToProject,
  copyAssetInProject,
  deleteAssetFromProject,
} from "./asset-library-store";

const assetsByProject: AssetGroupsByProject = {
  "moonlit-orchard": [
    {
      kind: "character",
      title: "Character",
      accentClassName: "bg-rose-500",
      assets: [
        {
          id: "forager-hero",
          name: "Forager Hero",
          description: "Idle, walk, harvest",
          version: "v1",
          canvasSize: "32 x 32 px",
          perspective: "Top-down",
          tags: ["hero"],
          history: [],
          animations: [],
        },
      ],
    },
  ],
  "iron-harbor": [
    {
      kind: "object",
      title: "Object",
      accentClassName: "bg-amber-500",
      assets: [
        {
          id: "harbor-crane",
          name: "Harbor Crane",
          description: "Industrial prop",
          version: "v1",
          canvasSize: "64 x 64 px",
          perspective: "Side-on",
          tags: ["prop"],
          history: [],
          animations: [],
        },
      ],
    },
  ],
};

describe("project asset state", () => {
  it("scopes copy and delete operations to the selected project", () => {
    const copied = copyAssetInProject(
      assetsByProject,
      "moonlit-orchard",
      "forager-hero",
      "forager-hero-copy",
    );
    const deleted = deleteAssetFromProject(
      copied,
      "moonlit-orchard",
      "forager-hero",
    );

    expect(deleted["moonlit-orchard"][0].assets).toEqual([
      expect.objectContaining({ id: "forager-hero-copy" }),
    ]);
    expect(deleted["iron-harbor"]).toEqual(assetsByProject["iron-harbor"]);
  });

  it("adds completed mock generation to the run's project only", async () => {
    const run: GenerationRun = {
      id: "run-iron-harbor-ui",
      projectId: "iron-harbor",
      kind: "ui",
      name: "Harbor HUD",
      prompt: "Riveted brass health bar",
      canvasSize: "128 x 32 px",
      useProjectContext: true,
      status: "queued",
    };

    vi.useFakeTimers();
    const generatedAsset = completeMockGeneration(run);
    await vi.advanceTimersByTimeAsync(700);
    const completed = await generatedAsset;
    vi.useRealTimers();

    const result = addAssetToProject(
      assetsByProject,
      run.projectId,
      completed.kind,
      completed.asset,
    );

    expect(result["moonlit-orchard"]).toEqual(
      assetsByProject["moonlit-orchard"],
    );
    expect(
      result["iron-harbor"].find((group) => group.kind === "ui")?.assets,
    ).toEqual([
      expect.objectContaining({
        id: "asset-run-iron-harbor-ui",
        name: "Harbor HUD",
      }),
    ]);
  });
});
