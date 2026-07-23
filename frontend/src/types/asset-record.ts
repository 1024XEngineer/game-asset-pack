export type AssetRecordStatus = "ready" | "generating" | "failed";

export type AssetRecord = {
  id: string;
  version: string;
  description: string;
  savedAt?: string;
  status: AssetRecordStatus;
  isCurrent: boolean;
  editorDocument?: AssetEditorDocument;
};
import type { AssetEditorDocument } from "./editor-document";
