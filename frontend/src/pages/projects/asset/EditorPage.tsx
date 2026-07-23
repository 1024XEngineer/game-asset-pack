import { useNavigate, useParams } from "@tanstack/react-router";

import { useAssetLibraryQuery } from "@/data/asset/asset-library.query";
import { useProjectListQuery } from "@/data/project/project-list.query";
import { EditorWorkspaceScreen } from "@/components/interfaces/Editor/EditorWorkspaceScreen";

export function EditorPage() {
  const { assetId, projectId } = useParams({
    from: "/projects/$projectId/assets/$assetId",
  });
  const navigate = useNavigate({
    from: "/projects/$projectId/assets/$assetId",
  });
  const { data: projects = [] } = useProjectListQuery();
  const { data: assetGroups = [] } = useAssetLibraryQuery(projectId);
  const project = projects.find((item) => item.id === projectId);
  const group = assetGroups.find((item) =>
    item.assets.some((asset) => asset.id === assetId),
  );
  const asset = group?.assets.find((item) => item.id === assetId);

  return (
    <div className="min-h-screen bg-background text-foreground">
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
    </div>
  );
}
