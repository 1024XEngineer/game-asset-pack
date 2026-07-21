import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { ProjectSummary } from "@/modules/project/model";

const PROJECTS_STORAGE_KEY = "game-asset-pack:projects";

type ProjectStoreValue = {
  projects: ProjectSummary[];
  addProject: (project: ProjectSummary) => void;
  updateProject: (project: ProjectSummary) => void;
  deleteProject: (projectId: string) => void;
};

const ProjectStoreContext = createContext<ProjectStoreValue | null>(null);

export function ProjectStoreProvider({
  children,
  initialProjects,
}: {
  children: React.ReactNode;
  initialProjects: ProjectSummary[];
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (storedProjects)
        setProjects(JSON.parse(storedProjects) as ProjectSummary[]);
    } catch {
      // Demo projects remain available when persisted data is invalid or unavailable.
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    } catch {
      // Keep state in memory when browser storage is unavailable.
    }
  }, [isHydrated, projects]);

  const value = useMemo<ProjectStoreValue>(
    () => ({
      projects,
      addProject: (project) => setProjects((current) => [...current, project]),
      updateProject: (project) =>
        setProjects((current) =>
          current.map((item) => (item.id === project.id ? project : item)),
        ),
      deleteProject: (projectId) =>
        setProjects((current) =>
          current.filter((project) => project.id !== projectId),
        ),
    }),
    [projects],
  );

  return <ProjectStoreContext value={value}>{children}</ProjectStoreContext>;
}

export function useProjectStore() {
  const value = useContext(ProjectStoreContext);
  if (!value)
    throw new Error("useProjectStore must be used within ProjectStoreProvider");
  return value;
}
