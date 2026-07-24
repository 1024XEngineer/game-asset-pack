import { useNavigate, useParams } from "@tanstack/react-router";

import { EditorWorkspaceScreen } from "@/components/interfaces/Editor/EditorWorkspaceScreen";
import { useEditorDocumentQuery } from "@/api/editor/editor-document.query";

export function EditorPage() {
  const { assetId, projectId } = useParams({
    from: "/projects/$projectId/assets/$assetId",
  });
  const navigate = useNavigate({
    from: "/projects/$projectId/assets/$assetId",
  });
  const documentQuery = useEditorDocumentQuery(projectId, assetId);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <EditorWorkspaceScreen
        data={documentQuery.data}
        error={documentQuery.error}
        isLoading={documentQuery.isPending}
        onRetry={() => void documentQuery.refetch()}
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
