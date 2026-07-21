import { useEffect } from "react";
import {
  useNavigate,
  useParams,
  useRouterState,
  useSearch,
} from "@tanstack/react-router";

import { AssetLibraryWorkspace } from "@/modules/asset/library/components/asset-library-workspace";
import { useAssetLibraryStore } from "@/modules/asset/library/state/asset-library-store";
import { EditorWorkspaceScreen } from "@/modules/editor/workspace/EditorWorkspaceScreen";
import { CreateAssetToolbar } from "@/modules/generation/components/create-asset-toolbar";
import { GenerationQueue } from "@/modules/generation/components/generation-queue";
import { useGenerationStore } from "@/modules/generation/state/generation-store";
import { NewProjectScreen } from "@/modules/project/NewProjectScreen";
import { ProjectChrome } from "@/modules/project/components/project-chrome";
import { ProjectSidebar } from "@/modules/project/components/project-sidebar";
import { useProjectStore } from "@/modules/project/state/project-store";
import { creatableAssetKinds } from "@/shared/types/asset-kind";

const LAST_PROJECT_STORAGE_KEY = "game-asset-pack:last-project-id";

export function ProjectLibraryRoute() {
  const navigate = useNavigate({ from: "/projects" });
  const search = useSearch({ from: "/projects" });
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const { projects, deleteProject, updateProject } = useProjectStore();
  const { assetGroups, copyAsset, deleteAsset } = useAssetLibraryStore();
  const { enqueueRun, runs } = useGenerationStore();
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
    <ProjectChrome
      sidebar={
        <ProjectSidebar
          isProjectRoute={pathname === "/projects"}
          projects={projects}
          selectedProjectId={search.project}
          onCreateProject={() => void navigate({ to: "/projects/new" })}
          onDeleteProject={handleDeleteProject}
          onSelectProject={(projectId) => void selectProject(projectId)}
          onUpdateProject={updateProject}
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
              onCreate={enqueueRun}
            />
          ) : null
        }
        onCopyAsset={copyAsset}
        onDeleteAsset={deleteAsset}
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
  );
}

export function NewProjectRoute() {
  const navigate = useNavigate({ from: "/projects/new" });
  const { addProject } = useProjectStore();

  return (
    <NewProjectScreen
      onCancel={() =>
        void navigate({
          to: "/projects",
          search: { project: undefined, q: "" },
        })
      }
      onCreate={async (project) => {
        addProject(project);
        await navigate({
          to: "/projects",
          search: { project: project.id, q: "" },
        });
      }}
    />
  );
}

export function EditorRoute() {
  const { assetId, projectId } = useParams({
    from: "/projects/$projectId/assets/$assetId",
  });
  const navigate = useNavigate({
    from: "/projects/$projectId/assets/$assetId",
  });
  const { projects } = useProjectStore();
  const { assetGroups } = useAssetLibraryStore();
  const project = projects.find((item) => item.id === projectId);
  const group = assetGroups.find((item) =>
    item.assets.some((asset) => asset.id === assetId),
  );
  const asset = group?.assets.find((item) => item.id === assetId);

  return (
    <EditorWorkspaceScreen
      projectName={project?.name}
      asset={
        asset && group
          ? {
              id: asset.id,
              kind: group.kind,
              name: asset.name,
              version: asset.version,
            }
          : undefined
      }
      onBack={() =>
        void navigate({
          to: "/projects",
          search: { project: projectId, q: "" },
        })
      }
    />
  );
}
