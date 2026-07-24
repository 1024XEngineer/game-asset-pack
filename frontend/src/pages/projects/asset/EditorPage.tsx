import { useNavigate, useParams } from "@tanstack/react-router";

import { EditorWorkspaceScreen } from "@/features/Editor/EditorWorkspaceScreen";
import { useRecordQuery } from "@/api/record/record.query";

export function EditorPage() {
  const { assetId, projectId } = useParams({
    from: "/projects/$projectId/assets/$assetId",
  });
  const navigate = useNavigate({
    from: "/projects/$projectId/assets/$assetId",
  });
  const recordQuery = useRecordQuery(projectId, assetId);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <EditorWorkspaceScreen
        data={recordQuery.data}
        error={recordQuery.error}
        isLoading={recordQuery.isPending}
        onRetry={() => void recordQuery.refetch()}
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
