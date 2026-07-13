"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import type { AssetKind } from "../_data/project-demo-data";
import { assetGroups, createAssetKinds, projectSummaries } from "../_data/project-demo-data";
import { AssetCard } from "./asset-card";
import { AssetFilters } from "./asset-filters";
import { CreateAssetToolbar } from "./create-asset-toolbar";
import { ProjectSidebar } from "./project-sidebar";

const LAST_PROJECT_STORAGE_KEY = "game-asset-pack:last-project-id";

export function ProjectWorkspace() {
  const [query, setQuery] = useState("");
  const [selectedKinds, setSelectedKinds] = useState<AssetKind[]>(["character", "object", "tiles"]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedProjectId = searchParams.get("project");
  const currentProject = projectSummaries.find((project) => project.id === requestedProjectId);

  useEffect(() => {
    try {
      if (currentProject) {
        localStorage.setItem(LAST_PROJECT_STORAGE_KEY, currentProject.id);
        return;
      }

      if (requestedProjectId) {
        if (localStorage.getItem(LAST_PROJECT_STORAGE_KEY) === requestedProjectId) {
          localStorage.removeItem(LAST_PROJECT_STORAGE_KEY);
        }
        return;
      }

      const cachedProjectId = localStorage.getItem(LAST_PROJECT_STORAGE_KEY);

      if (!cachedProjectId) {
        return;
      }

      const cachedProjectExists = projectSummaries.some(
        (project) => project.id === cachedProjectId,
      );

      if (!cachedProjectExists) {
        localStorage.removeItem(LAST_PROJECT_STORAGE_KEY);
        return;
      }

      router.replace(`/project?project=${encodeURIComponent(cachedProjectId)}`);
    } catch {
      // Keep the empty state when browser storage is unavailable.
    }
  }, [currentProject, requestedProjectId, router]);

  const filteredAssets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return assetGroups
      .filter((group) => selectedKinds.includes(group.kind))
      .flatMap((group) =>
        group.assets
          .filter((asset) =>
            [asset.name, asset.description, asset.version].some((value) =>
              value.toLowerCase().includes(normalizedQuery),
            ),
          )
          .map((asset) => ({ ...asset, accentClassName: group.accentClassName })),
      );
  }, [query, selectedKinds]);

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-1 bg-muted/30">
      <ProjectSidebar projects={projectSummaries} />

      <section className="min-w-0 flex-1 overflow-hidden">
        {currentProject ? (
          <>
            <div className="bg-background/95 px-5 py-4 backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Current Project
                  </p>
                  <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                    {currentProject.name}
                  </h1>
                </div>
              </div>
            </div>
            <Separator />

            <ScrollArea className="h-[calc(100vh-8.25rem)]">
              <div className="space-y-5 px-5 py-5">
                <AssetFilters
                  query={query}
                  selectedKinds={selectedKinds}
                  onQueryChange={setQuery}
                  onSelectedKindsChange={setSelectedKinds}
                  actions={<CreateAssetToolbar assetKinds={createAssetKinds} />}
                />
                {filteredAssets.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {filteredAssets.map((asset) => (
                      <AssetCard
                        key={asset.id}
                        asset={asset}
                        accentClassName={asset.accentClassName}
                        projectId={currentProject.id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed bg-card px-6 py-14 text-center">
                    <p className="text-sm font-medium">No assets found</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try another search or asset type.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-6 text-center">
            <p className="text-sm text-muted-foreground">
              Please create a project or select an existing project from the project list on the
              left.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
