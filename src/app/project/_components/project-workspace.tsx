"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { AssetKind } from "../_data/project-demo-data";
import { createAssetKinds } from "../_data/project-demo-data";
import { AssetCard } from "./asset-card";
import { ProjectCommandBar } from "./project-command-bar";
import { useProjectStore } from "./project-store";

const LAST_PROJECT_STORAGE_KEY = "game-asset-pack:last-project-id";

export function ProjectWorkspace() {
  const [query, setQuery] = useState("");
  const [selectedKinds, setSelectedKinds] = useState<AssetKind[]>(["character", "object", "tiles"]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { projects, assetGroups, copyAsset, deleteAsset } = useProjectStore();
  const requestedProjectId = searchParams.get("project");
  const currentProject = projects.find((project) => project.id === requestedProjectId);

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

      const cachedProjectExists = projects.some((project) => project.id === cachedProjectId);

      if (!cachedProjectExists) {
        localStorage.removeItem(LAST_PROJECT_STORAGE_KEY);
        return;
      }

      router.replace(`/project?project=${encodeURIComponent(cachedProjectId)}`);
    } catch {
      // Keep the empty state when browser storage is unavailable.
    }
  }, [currentProject, projects, requestedProjectId, router]);

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
          .map((asset) => ({
            ...asset,
            accentClassName: group.accentClassName,
            kind: group.kind,
            kindLabel: group.title,
          })),
      );
  }, [assetGroups, query, selectedKinds]);

  if (!currentProject) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center">
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          Please create a project or select an existing project from the project list on the left.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto w-full max-w-[96rem] px-5 py-7 sm:px-8 sm:py-9">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Current Project
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              {currentProject.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{currentProject.style}</p>
            {currentProject.description ? (
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {currentProject.description}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[currentProject.gameType, currentProject.visualStyle, currentProject.platform]
                .filter(Boolean)
                .map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
            </div>
          </div>
        </header>

        <div className="py-10 sm:py-12">
          <ProjectCommandBar
            query={query}
            selectedKinds={selectedKinds}
            assetKinds={createAssetKinds}
            project={currentProject}
            onQueryChange={setQuery}
            onSelectedKindsChange={setSelectedKinds}
          />
        </div>

        {filteredAssets.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {filteredAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                accentClassName={asset.accentClassName}
                kind={asset.kind}
                kindLabel={asset.kindLabel}
                projectId={currentProject.id}
                onCopy={() => copyAsset(asset.id)}
                onDelete={() => deleteAsset(asset.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-card px-6 py-20 text-center">
            <p className="text-sm font-medium">No assets found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try another search or asset type.</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
