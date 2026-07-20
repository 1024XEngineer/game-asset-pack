import type {
  GenerationJob,
  LayerAsset,
  LayerAttributesPatch,
  LayerRole,
  SceneryAsset,
  SceneryDocument,
} from "@/types/scenery";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_SCENERY_API_URL || "http://127.0.0.1:8001"
).replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`;
    try {
      const body = (await response.json()) as { detail?: unknown };
      if (typeof body.detail === "string") message = body.detail;
      else if (body.detail) message = JSON.stringify(body.detail);
    } catch {
      // Preserve the HTTP status when an upstream proxy returns non-JSON.
    }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function mediaUrl(path: string): string {
  return path.startsWith("http://") || path.startsWith("https://")
    ? path
    : `${API_BASE_URL}${path}`;
}

export const sceneryApi = {
  createScenery(): Promise<SceneryAsset> {
    return request("/api/v1/sceneries", {
      method: "POST",
      body: JSON.stringify({
        name: "Untitled Scenery",
        description: "A layered game scenery created in the live editor.",
        attributes: { width: 1920, height: 1080 },
      }),
    });
  },

  document(id: number): Promise<SceneryDocument> {
    return request(`/api/v1/sceneries/${id}/document`);
  },

  patchScenery(
    id: number,
    patch: Partial<Pick<SceneryAsset, "name" | "description" | "tags" | "attributes">>,
  ): Promise<SceneryAsset> {
    return request(`/api/v1/sceneries/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },

  patchLayer(
    id: number,
    patch: { name?: string; description?: string; attributes?: LayerAttributesPatch },
  ): Promise<LayerAsset> {
    return request(`/api/v1/layers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },

  removeLayerBackground(id: number): Promise<LayerAsset> {
    return request(`/api/v1/layers/${id}/remove-background`, { method: "POST" });
  },

  deleteLayer(id: number): Promise<void> {
    return request(`/api/v1/layers/${id}`, { method: "DELETE" });
  },

  reorderLayers(sceneryId: number, layerIds: number[]): Promise<LayerAsset[]> {
    return request(`/api/v1/sceneries/${sceneryId}/layer-order`, {
      method: "PUT",
      body: JSON.stringify({ layerIds }),
    });
  },

  startGeneration(
    sceneryId: number,
    body: { name: string; prompt: string; role: LayerRole },
  ): Promise<GenerationJob> {
    return request(`/api/v1/sceneries/${sceneryId}/generation-jobs`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  generationJob(id: string): Promise<GenerationJob> {
    return request(`/api/v1/generation-jobs/${id}`);
  },

  exportJsonUrl(sceneryId: number): string {
    return `${API_BASE_URL}/api/v1/sceneries/${sceneryId}/export.json`;
  },

  exportZipUrl(sceneryId: number): string {
    return `${API_BASE_URL}/api/v1/sceneries/${sceneryId}/export.zip`;
  },
};
