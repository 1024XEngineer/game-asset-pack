import { useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";

import { AppHeader } from "@/app/AppHeader";
import { useCopyAssetMutation } from "@/data/asset/asset-copy.mutation";
import { useDeleteAssetMutation } from "@/data/asset/asset-delete.mutation";
import { useAssetLibraryQuery } from "@/data/asset/asset-library.query";
import { useEnqueueGenerationMutation } from "@/data/generation/generation-run.mutation";
import { useGenerationRunsQuery } from "@/data/generation/generation-runs.query";
import { useDeleteProjectMutation } from "@/data/project/project-delete.mutation";
import { useProjectListQuery } from "@/data/project/project-list.query";
import { useUpdateProjectMutation } from "@/data/project/project-update.mutation";
import { AssetLibraryWorkspace } from "@/modules/asset/library/components/asset-library-workspace";
import { CreateAssetToolbar } from "@/modules/generation/components/create-asset-toolbar";
import { GenerationQueue } from "@/modules/generation/components/generation-queue";
import { ProjectChrome } from "@/modules/project/components/project-chrome";
import { ProjectSidebar } from "@/modules/project/components/project-sidebar";
import { creatableAssetKinds } from "@/shared/types/asset-kind";

const LAST_PROJECT_STORAGE_KEY = "game-asset-pack:last-project-id";

export function ProjectLibraryPage() {
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

  const selectProject = (projectId: string | undefined, replace = false) =>
    navigate({
      to: "/projects",
      search: { project: projectId, q: "" },
      replace,
    });

  useEffect(() => {
    try {
      if (project) {
        localStorage.setItem(LAST_PROJECT_STORAGE_KEY, project.id);
        return;
      }

      if (search.project) {
        if (localStorage.getItem(LAST_PROJECT_STORAGE_KEY) === search.project) {
          localStorage.removeItem(LAST_PROJECT_STORAGE_KEY);
        }
        return;
      }

      const cachedProjectId = localStorage.getItem(LAST_PROJECT_STORAGE_KEY);
      if (
        cachedProjectId &&
        projects.some((item) => item.id === cachedProjectId)
      ) {
        void selectProject(cachedProjectId, true);
      } else if (cachedProjectId) {
        localStorage.removeItem(LAST_PROJECT_STORAGE_KEY);
      }
    } catch {
      // Keep the empty state when browser storage is unavailable.
    }
  }, [project, projects, search.project]);

  const handleDeleteProject = (projectId: string) => {
    const nextProject = projects.find((item) => item.id !== projectId);
    deleteProject(projectId);
    try {
      if (localStorage.getItem(LAST_PROJECT_STORAGE_KEY) === projectId) {
        localStorage.removeItem(LAST_PROJECT_STORAGE_KEY);
      }
    } catch {
      // Navigation still works when browser storage is unavailable.
    }
    if (search.project === projectId) void selectProject(nextProject?.id, true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <ProjectChrome
        sidebar={
          <ProjectSidebar
            isProjectRoute
            projects={projects}
            selectedProjectId={search.project}
            onCreateProject={() => void navigate({ to: "/projects/new" })}
            onDeleteProject={handleDeleteProject}
            onSelectProject={(projectId) => void selectProject(projectId)}
            onUpdateProject={(project) => updateProject(project)}
          />
        }
      >
        <AssetLibraryWorkspace
          assetGroups={assetGroups}
          project={project}
          query={search.q}
          generationQueue={<GenerationQueue runs={runs} />}
          creationControl={
            project ? (
              <CreateAssetToolbar
                assetKinds={creatableAssetKinds}
                project={project}
                onCreate={(request) =>
                  enqueueRun({ projectId: project.id, request })
                }
              />
            ) : null
          }
          onCopyAsset={(assetId) => {
            if (project) copyAsset({ projectId: project.id, assetId });
          }}
          onDeleteAsset={(assetId) => {
            if (project) deleteAsset({ projectId: project.id, assetId });
          }}
          onOpenAsset={(assetId) => {
            if (project) {
              void navigate({
                to: "/projects/$projectId/assets/$assetId",
                params: { projectId: project.id, assetId },
              });
            }
          }}
          onQueryChange={(q) =>
            void navigate({
              to: "/projects",
              search: { project: search.project, q },
              replace: true,
            })
          }
        />
      </ProjectChrome>
    </div>
  );
}
