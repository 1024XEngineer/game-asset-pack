"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { AssetGroup, ProjectSummary } from "../_data/project-demo-data";
import { assetGroups as demoAssetGroups, projectSummaries } from "../_data/project-demo-data";

const PROJECTS_STORAGE_KEY = "game-asset-pack:projects";

type ProjectStoreValue = {
  projects: ProjectSummary[];
  assetGroups: AssetGroup[];
  updateProject: (project: ProjectSummary) => void;
  deleteProject: (projectId: string) => void;
  copyAsset: (assetId: string) => void;
  deleteAsset: (assetId: string) => void;
};

const ProjectStoreContext = createContext<ProjectStoreValue | null>(null);

export function ProjectStoreProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState(projectSummaries);
  const [assetGroups, setAssetGroups] = useState(demoAssetGroups);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (storedProjects) setProjects(JSON.parse(storedProjects) as ProjectSummary[]);
    } catch {
      // Fall back to demo projects when browser storage is unavailable or invalid.
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    } catch {
      // Keep in-memory project changes when browser storage is unavailable.
    }
  }, [isHydrated, projects]);

  const value = useMemo<ProjectStoreValue>(
    () => ({
      projects,
      assetGroups,
      updateProject: (updatedProject) =>
        setProjects((current) =>
          current.map((project) => (project.id === updatedProject.id ? updatedProject : project)),
        ),
      deleteProject: (projectId) =>
        setProjects((current) => current.filter((project) => project.id !== projectId)),
      copyAsset: (assetId) => {
        const copyId = `${assetId}-copy-${crypto.randomUUID()}`;

        setAssetGroups((current) =>
          current.map((group) => {
            const assetIndex = group.assets.findIndex((asset) => asset.id === assetId);
            if (assetIndex < 0) return group;

            const asset = group.assets[assetIndex];
            const copiedAsset = {
              ...asset,
              id: copyId,
              name: `${asset.name} Copy`,
              history: asset.history.map((entry) => ({
                ...entry,
                id: `${copyId}-history-${entry.version}`,
              })),
              animations: asset.animations.map((animation) => ({
                ...animation,
                id: `${copyId}-animation-${animation.id}`,
              })),
            };

            return {
              ...group,
              assets: [
                ...group.assets.slice(0, assetIndex + 1),
                copiedAsset,
                ...group.assets.slice(assetIndex + 1),
              ],
            };
          }),
        );
      },
      deleteAsset: (assetId) =>
        setAssetGroups((current) =>
          current.map((group) => ({
            ...group,
            assets: group.assets.filter((asset) => asset.id !== assetId),
          })),
        ),
    }),
    [assetGroups, projects],
  );

  return <ProjectStoreContext value={value}>{children}</ProjectStoreContext>;
}

export function useProjectStore() {
  const value = useContext(ProjectStoreContext);
  if (!value) throw new Error("useProjectStore must be used within ProjectStoreProvider");
  return value;
}
