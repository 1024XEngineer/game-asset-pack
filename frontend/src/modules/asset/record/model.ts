export type AssetRecordStatus = "ready" | "generating" | "failed";

export type AssetRecord = {
  id: string;
  version: string;
  description: string;
  status: AssetRecordStatus;
  isCurrent: boolean;
};
