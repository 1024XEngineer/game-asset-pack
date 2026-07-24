import {
  listMockAssetGroups,
  listMockProjects,
} from "@/api/project/project-asset.mock";
import { DataApiError } from "@/api/api-error";
import {
  createDefaultEditorDocument,
  mergeEditorDocument,
} from "@/api/editor/editor-document.seed";
import { runMockRequest, type MockRequestOptions } from "@/api/mock-request";
import type { EditorDocumentData } from "@/types/editor-document";

export type GetEditorDocumentInput = {
  projectId: string;
  assetId: string;
};

export function getMockEditorDocument(
  input: GetEditorDocumentInput,
  options?: MockRequestOptions,
) {
  return runMockRequest(async (): Promise<EditorDocumentData> => {
    const [projects, groups] = await Promise.all([
      listMockProjects(),
      listMockAssetGroups(input.projectId),
    ]);
    const project = projects.find((item) => item.id === input.projectId);
    if (!project) {
      throw new DataApiError("NOT_FOUND", "Project was not found.", {
        projectId: input.projectId,
      });
    }

    const group = groups.find((item) =>
      item.assets.some((asset) => asset.id === input.assetId),
    );
    const asset = group?.assets.find((item) => item.id === input.assetId);
    if (!group || !asset) {
      throw new DataApiError("NOT_FOUND", "Asset was not found.", input);
    }

    const currentRecord = asset.history.find((record) => record.isCurrent);
    const fallback = createDefaultEditorDocument(group.kind, asset);

    return {
      projectName: project.name,
      asset: {
        id: asset.id,
        projectId: input.projectId,
        kind: group.kind,
        name: asset.name,
        version: asset.version,
        history: structuredClone(asset.history),
      },
      document: mergeEditorDocument(fallback, currentRecord?.editorDocument),
    };
  }, options);
}
