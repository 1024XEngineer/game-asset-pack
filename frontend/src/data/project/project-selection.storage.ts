const LAST_PROJECT_STORAGE_KEY = "game-asset-pack:last-project-id";

export function readLastProjectId() {
  try {
    return localStorage.getItem(LAST_PROJECT_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

export function writeLastProjectId(projectId: string) {
  try {
    localStorage.setItem(LAST_PROJECT_STORAGE_KEY, projectId);
  } catch {
    // Project selection still works when browser storage is unavailable.
  }
}

export function clearLastProjectId(projectId?: string) {
  try {
    if (
      projectId === undefined ||
      localStorage.getItem(LAST_PROJECT_STORAGE_KEY) === projectId
    ) {
      localStorage.removeItem(LAST_PROJECT_STORAGE_KEY);
    }
  } catch {
    // Project selection still works when browser storage is unavailable.
  }
}
