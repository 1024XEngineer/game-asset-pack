import { useCallback, useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";

import { useCopyAssetMutation } from "@/data/asset/asset-copy.mutation";
import { useDeleteAssetMutation } from "@/data/asset/asset-delete.mutation";
import { useAssetLibraryQuery } from "@/data/asset/asset-library.query";
import { useEnqueueGenerationMutation } from "@/data/generation/generation-run.mutation";
import { useGenerationRunsQuery } from "@/data/generation/generation-runs.query";
import { useDeleteProjectMutation } from "@/data/project/project-delete.mutation";
import { useProjectListQuery } from "@/data/project/project-list.query";
import {
  clearLastProjectId,
  readLastProjectId,
  writeLastProjectId,
} from "@/data/project/project-selection.storage";
import { useUpdateProjectMutation } from "@/data/project/project-update.mutation";
import type { CreationRequest } from "@/types/generation";
import type { ProjectSummary } from "@/types/project";

export function useProjectLibrary() {
  const navigate = useNavigate({ from: "/projects" });
  const search = useSearch({ from: "/projects" });
  const { data: projects = [] } = useProjectListQuery();
  const { data: assetGroups = [] } = useAssetLibraryQuery(search.project);
  const { data: runs = [] } = useGenerationRunsQuery(search.project);
  const { mutate: copyAsset } = useCopyAssetMutation();
  const { mutate: deleteAsset } = useDeleteAssetMutation();
  const { mutate: enqueueRun } = useEnqueueGenerationMutation();
  const { mutate: deleteProject } = useDeleteProjectMutation();
  const { mutate: updateProject } = useUpdateProjectMutation();
  const project = projects.find((item) => item.id === search.project);

  const selectProject = useCallback(
    (projectId: string | undefined, replace = false) =>
      navigate({
        to: "/projects",
        search: { project: projectId, q: "" },
        replace,
      }),
    [navigate],
  );

  useEffect(() => {
    if (project) {
      writeLastProjectId(project.id);
      return;
    }

    if (search.project) {
      clearLastProjectId(search.project);
      return;
    }

    const cachedProjectId = readLastProjectId();
    if (
      cachedProjectId &&
      projects.some((item) => item.id === cachedProjectId)
    ) {
      void selectProject(cachedProjectId, true);
    } else if (cachedProjectId) {
      clearLastProjectId(cachedProjectId);
    }
  }, [project, projects, search.project, selectProject]);

  const createProject = useCallback(
    () =>
      navigate({
        to: "/projects/new",
        search: { project: search.project, q: search.q },
      }),
    [navigate, search.project, search.q],
  );

  const removeProject = useCallback(
    (projectId: string) => {
      const nextProject = projects.find((item) => item.id !== projectId);
      deleteProject(projectId);
      clearLastProjectId(projectId);
      if (search.project === projectId)
        void selectProject(nextProject?.id, true);
    },
    [deleteProject, projects, search.project, selectProject],
  );

  const openAsset = useCallback(
    (assetId: string) => {
      if (project) {
        void navigate({
          to: "/projects/$projectId/assets/$assetId",
          params: { projectId: project.id, assetId },
          search: { project: search.project, q: search.q },
        });
      }
    },
    [navigate, project, search.project, search.q],
  );

  const changeQuery = useCallback(
    (q: string) =>
      navigate({
        to: "/projects",
        search: { project: search.project, q },
        replace: true,
      }),
    [navigate, search.project],
  );

  const createAsset = useCallback(
    (request: CreationRequest) => {
      if (project) enqueueRun({ projectId: project.id, request });
    },
    [enqueueRun, project],
  );

  const copyProjectAsset = useCallback(
    (assetId: string) => {
      if (project) copyAsset({ projectId: project.id, assetId });
    },
    [copyAsset, project],
  );

  const deleteProjectAsset = useCallback(
    (assetId: string) => {
      if (project) deleteAsset({ projectId: project.id, assetId });
    },
    [deleteAsset, project],
  );

  return {
    assetGroups,
    changeQuery,
    copyProjectAsset,
    createAsset,
    createProject,
    deleteProjectAsset,
    project,
    projects,
    query: search.q ?? "",
    removeProject,
    runs,
    selectProject,
    selectedProjectId: search.project,
    updateProject: (updatedProject: ProjectSummary) =>
      updateProject(updatedProject),
    openAsset,
  };
}
