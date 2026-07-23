import { AssetLibraryWorkspace } from "@/components/interfaces/AssetLibrary/asset-library-workspace";
import { CreateAssetToolbar } from "@/components/interfaces/Generation/create-asset-toolbar";
import { GenerationQueue } from "@/components/interfaces/Generation/generation-queue";
import { ProjectSidebar } from "@/components/interfaces/Project/project-sidebar";
import { AppHeader } from "@/components/layouts/AppHeader";
import { ProjectChrome } from "@/components/layouts/ProjectChrome";
import { creatableAssetKinds } from "@/types/asset-kind";
import { useProjectLibrary } from "./useProjectLibrary";

export function ProjectLibraryPage() {
  const library = useProjectLibrary();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <ProjectChrome
        sidebar={
          <ProjectSidebar
            isProjectRoute
            projects={library.projects}
            selectedProjectId={library.selectedProjectId}
            onCreateProject={() => void library.createProject()}
            onDeleteProject={library.removeProject}
            onSelectProject={library.selectProject}
            onUpdateProject={library.updateProject}
          />
        }
      >
        <AssetLibraryWorkspace
          assetGroups={library.assetGroups}
          project={library.project}
          query={library.query}
          generationQueue={<GenerationQueue runs={library.runs} />}
          creationControl={
            library.project ? (
              <CreateAssetToolbar
                assetKinds={creatableAssetKinds}
                project={library.project}
                onCreate={library.createAsset}
              />
            ) : null
          }
          onCopyAsset={library.copyProjectAsset}
          onDeleteAsset={library.deleteProjectAsset}
          onOpenAsset={library.openAsset}
          onQueryChange={library.changeQuery}
        />
      </ProjectChrome>
    </div>
  );
}
