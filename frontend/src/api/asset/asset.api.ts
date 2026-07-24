import {
  addMockAsset,
  copyMockAsset,
  deleteMockAsset,
  listMockAssetGroups,
  saveMockAssetRevision,
} from "@/api/project/project-asset.mock";
import type { ProjectAsset } from "@/types/asset";
import type { AssetKind } from "@/types/asset-kind";
import type { AssetEditorDocument } from "@/types/editor-document";

export const assetApi = {
  listGroups: (projectId: string) => listMockAssetGroups(projectId),
  add: (projectId: string, kind: AssetKind, asset: ProjectAsset) =>
    addMockAsset(projectId, kind, asset),
  copy: (projectId: string, assetId: string) =>
    copyMockAsset(projectId, assetId),
  delete: (projectId: string, assetId: string) =>
    deleteMockAsset(projectId, assetId),
  saveRevision: (
    projectId: string,
    assetId: string,
    editorDocument: AssetEditorDocument,
  ) => saveMockAssetRevision(projectId, assetId, editorDocument),
};
