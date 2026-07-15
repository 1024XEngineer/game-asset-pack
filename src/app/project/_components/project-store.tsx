"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { ProjectSummary } from "../_data/project-demo-data";
import { projectSummaries } from "../_data/project-demo-data";

const PROJECTS_STORAGE_KEY = "game-asset-pack:projects";

type ProjectStoreValue = {
  projects: ProjectSummary[];
  updateProject: (project: ProjectSummary) => void;
  deleteProject: (projectId: string) => void;
};

const ProjectStoreContext = createContext<ProjectStoreValue | null>(null);

export function ProjectStoreProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState(projectSummaries);
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
      updateProject: (updatedProject) =>
        setProjects((current) =>
          current.map((project) => (project.id === updatedProject.id ? updatedProject : project)),
        ),
      deleteProject: (projectId) =>
        setProjects((current) => current.filter((project) => project.id !== projectId)),
    }),
    [projects],
  );

  return <ProjectStoreContext value={value}>{children}</ProjectStoreContext>;
}

export function useProjectStore() {
  const value = useContext(ProjectStoreContext);
  if (!value) throw new Error("useProjectStore must be used within ProjectStoreProvider");
  return value;
}
