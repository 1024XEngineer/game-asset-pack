import { queryOptions, useQuery } from "@tanstack/react-query";

import { editorDocumentApi } from "@/api/editor/editor-document.api";
import { editorKeys } from "@/api/editor/editor.keys";

export function editorDocumentQueryOptions(projectId: string, assetId: string) {
  return queryOptions({
    queryKey: editorKeys.document(projectId, assetId),
    queryFn: () => editorDocumentApi.getDocument({ projectId, assetId }),
  });
}

export function useEditorDocumentQuery(projectId: string, assetId: string) {
  return useQuery(editorDocumentQueryOptions(projectId, assetId));
}
