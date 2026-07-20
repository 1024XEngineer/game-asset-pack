"use client";

import { create } from "zustand";

import { sceneryApi } from "@/lib/api";
import { deepMerge } from "@/lib/merge";
import type {
  GenerationJob,
  LayerAsset,
  LayerAttributesPatch,
  LayerRole,
  SceneryAsset,
  SceneryDocument,
} from "@/types/scenery";

type InspectorTab = "generate" | "properties" | "history";
type SaveStatus = "Loading…" | "All changes saved" | "Saving…" | "Unsaved changes" | "Error";

type SceneSnapshot = {
  scenery: SceneryAsset;
  layers: LayerAsset[];
};

type SceneryState = {
  document: SceneryDocument | null;
  selectedLayerId: number | null;
  activeTab: InspectorTab;
  saveStatus: SaveStatus;
  loading: boolean;
  error: string | null;
  generationJob: GenerationJob | null;
  undoStack: SceneSnapshot[];
  redoStack: SceneSnapshot[];
  activity: string[];
  initialize: () => Promise<void>;
  setActiveTab: (tab: InspectorTab) => void;
  selectLayer: (id: number | null) => void;
  patchLayer: (id: number, attributes: LayerAttributesPatch) => Promise<void>;
  previewLayer: (id: number, attributes: LayerAttributesPatch) => void;
  persistPreview: (id: number) => Promise<void>;
  renameLayer: (id: number, name: string) => Promise<void>;
  toggleVisibility: (id: number) => Promise<void>;
  removeLayerBackground: (id: number) => Promise<void>;
  deleteLayer: (id: number) => Promise<void>;
  reorderLayers: (orderedIds: number[]) => Promise<void>;
  generateLayer: (body: { name: string; prompt: string; role: LayerRole }) => Promise<void>;
  saveAll: () => Promise<void>;
  renameScenery: (name: string) => Promise<void>;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  clearError: () => void;
};

function cloneSnapshot(document: SceneryDocument): SceneSnapshot {
  return structuredClone({ scenery: document.scenery, layers: document.layers });
}

function replaceLayer(layers: LayerAsset[], next: LayerAsset): LayerAsset[] {
  return layers.map((layer) => (layer.id === next.id ? next : layer));
}

async function persistSnapshot(snapshot: SceneSnapshot): Promise<void> {
  await sceneryApi.patchScenery(snapshot.scenery.id, {
    name: snapshot.scenery.name,
    description: snapshot.scenery.description,
    tags: snapshot.scenery.tags,
    attributes: snapshot.scenery.attributes,
  });
  await Promise.all(
    snapshot.layers.map((layer) =>
      sceneryApi.patchLayer(layer.id, {
        name: layer.name,
        description: layer.description,
        attributes: layer.attributes,
      }),
    ),
  );
  if (snapshot.layers.length) {
    await sceneryApi.reorderLayers(
      snapshot.scenery.id,
      [...snapshot.layers]
        .sort((a, b) => a.siblingOrder - b.siblingOrder)
        .map((layer) => layer.id),
    );
  }
}

export const useSceneryStore = create<SceneryState>((set, get) => ({
  document: null,
  selectedLayerId: null,
  activeTab: "generate",
  saveStatus: "Loading…",
  loading: true,
  error: null,
  generationJob: null,
  undoStack: [],
  redoStack: [],
  activity: [],

  initialize: async () => {
    set({ loading: true, error: null, saveStatus: "Loading…" });
    try {
      const savedId = window.localStorage.getItem("scenery-demo-id");
      let document: SceneryDocument;
      if (savedId) {
        try {
          document = await sceneryApi.document(Number(savedId));
        } catch {
          const scenery = await sceneryApi.createScenery();
          window.localStorage.setItem("scenery-demo-id", String(scenery.id));
          document = await sceneryApi.document(scenery.id);
        }
      } else {
        const scenery = await sceneryApi.createScenery();
        window.localStorage.setItem("scenery-demo-id", String(scenery.id));
        document = await sceneryApi.document(scenery.id);
      }
      set({ document, loading: false, saveStatus: "All changes saved" });
    } catch (error) {
      set({
        loading: false,
        saveStatus: "Error",
        error: error instanceof Error ? error.message : "Unable to load the scenery API",
      });
    }
  },

  setActiveTab: (activeTab) => set({ activeTab }),
  selectLayer: (selectedLayerId) =>
    set({ selectedLayerId, activeTab: selectedLayerId ? "properties" : get().activeTab }),
  clearError: () => set({ error: null }),

  previewLayer: (id, attributes) => {
    const document = get().document;
    if (!document) return;
    set({
      document: {
        ...document,
        layers: document.layers.map((layer) =>
          layer.id === id
            ? {
                ...layer,
                attributes: deepMerge(
                  layer.attributes as unknown as Record<string, unknown>,
                  attributes as unknown as Record<string, unknown>,
                ) as unknown as LayerAsset["attributes"],
              }
            : layer,
        ),
      },
      saveStatus: "Unsaved changes",
    });
  },

  persistPreview: async (id) => {
    const document = get().document;
    const layer = document?.layers.find((item) => item.id === id);
    if (!document || !layer) return;
    set({ saveStatus: "Saving…" });
    try {
      const saved = await sceneryApi.patchLayer(id, { attributes: layer.attributes });
      set({
        document: { ...document, layers: replaceLayer(document.layers, saved) },
        saveStatus: "All changes saved",
      });
    } catch (error) {
      set({ saveStatus: "Error", error: error instanceof Error ? error.message : "Save failed" });
    }
  },

  patchLayer: async (id, attributes) => {
    const document = get().document;
    if (!document) return;
    const before = cloneSnapshot(document);
    const current = document.layers.find((layer) => layer.id === id);
    if (!current) return;
    const optimistic = {
      ...current,
      attributes: deepMerge(
        current.attributes as unknown as Record<string, unknown>,
        attributes as unknown as Record<string, unknown>,
      ) as unknown as LayerAsset["attributes"],
    };
    set({
      document: { ...document, layers: replaceLayer(document.layers, optimistic) },
      undoStack: [...get().undoStack, before].slice(-50),
      redoStack: [],
      saveStatus: "Saving…",
    });
    try {
      const saved = await sceneryApi.patchLayer(id, { attributes });
      const latest = get().document;
      if (latest) {
        set({
          document: { ...latest, layers: replaceLayer(latest.layers, saved) },
          saveStatus: "All changes saved",
        });
      }
    } catch (error) {
      set({
        document: { ...document, scenery: before.scenery, layers: before.layers },
        saveStatus: "Error",
        error: error instanceof Error ? error.message : "Layer update failed",
      });
    }
  },

  renameLayer: async (id, name) => {
    const document = get().document;
    if (!document || !name.trim()) return;
    const before = cloneSnapshot(document);
    set({ saveStatus: "Saving…", undoStack: [...get().undoStack, before], redoStack: [] });
    try {
      const saved = await sceneryApi.patchLayer(id, { name: name.trim() });
      const latest = get().document;
      if (latest) {
        set({
          document: { ...latest, layers: replaceLayer(latest.layers, saved) },
          saveStatus: "All changes saved",
        });
      }
    } catch (error) {
      set({ saveStatus: "Error", error: error instanceof Error ? error.message : "Rename failed" });
    }
  },

  toggleVisibility: async (id) => {
    const layer = get().document?.layers.find((item) => item.id === id);
    if (layer) await get().patchLayer(id, { visible: !layer.attributes.visible });
  },

  removeLayerBackground: async (id) => {
    const document = get().document;
    if (!document) return;
    set({ saveStatus: "Saving…" });
    try {
      const saved = await sceneryApi.removeLayerBackground(id);
      const latest = get().document;
      if (latest) {
        set({
          document: { ...latest, layers: replaceLayer(latest.layers, saved) },
          saveStatus: "All changes saved",
          activity: [`Removed background from layer ${id}`, ...get().activity].slice(0, 30),
        });
      }
    } catch (error) {
      set({
        saveStatus: "Error",
        error: error instanceof Error ? error.message : "Background removal failed",
      });
    }
  },

  deleteLayer: async (id) => {
    const document = get().document;
    if (!document) return;
    set({ saveStatus: "Saving…" });
    try {
      await sceneryApi.deleteLayer(id);
      set({
        document: { ...document, layers: document.layers.filter((layer) => layer.id !== id) },
        selectedLayerId: get().selectedLayerId === id ? null : get().selectedLayerId,
        saveStatus: "All changes saved",
        activity: [`Deleted layer ${id}`, ...get().activity].slice(0, 30),
      });
    } catch (error) {
      set({ saveStatus: "Error", error: error instanceof Error ? error.message : "Delete failed" });
    }
  },

  reorderLayers: async (orderedIds) => {
    const document = get().document;
    if (!document || orderedIds.length !== document.layers.length) return;
    const before = cloneSnapshot(document);
    const byId = new Map(document.layers.map((layer) => [layer.id, layer]));
    const optimistic = orderedIds.map((id, index) => ({
      ...byId.get(id)!,
      siblingOrder: index,
      attributes: { ...byId.get(id)!.attributes, zIndex: index * 10 },
    }));
    set({
      document: { ...document, layers: optimistic },
      undoStack: [...get().undoStack, before],
      redoStack: [],
      saveStatus: "Saving…",
    });
    try {
      const saved = await sceneryApi.reorderLayers(document.scenery.id, orderedIds);
      const latest = get().document;
      if (latest) {
        set({ document: { ...latest, layers: saved }, saveStatus: "All changes saved" });
      }
    } catch (error) {
      set({
        document: { ...document, layers: before.layers },
        saveStatus: "Error",
        error: error instanceof Error ? error.message : "Reorder failed",
      });
    }
  },

  generateLayer: async (body) => {
    const document = get().document;
    if (!document) return;
    set({ generationJob: null, error: null, saveStatus: "Saving…" });
    try {
      let job = await sceneryApi.startGeneration(document.scenery.id, body);
      set({ generationJob: job, saveStatus: "All changes saved" });
      while (job.status === "queued" || job.status === "running") {
        await new Promise((resolve) => window.setTimeout(resolve, 1000));
        job = await sceneryApi.generationJob(job.id);
        set({ generationJob: job });
      }
      if (job.status === "failed") throw new Error(job.error?.message || "Generation failed");
      const refreshed = await sceneryApi.document(document.scenery.id);
      set({
        document: refreshed,
        generationJob: job,
        selectedLayerId: job.layer?.id ?? null,
        activeTab: "properties",
        saveStatus: "All changes saved",
        activity: [
          `Generated ${job.layer?.name || "a new layer"}`,
          ...get().activity,
        ].slice(0, 30),
      });
    } catch (error) {
      set({
        saveStatus: "Error",
        error: error instanceof Error ? error.message : "Generation failed",
      });
    }
  },

  saveAll: async () => {
    const document = get().document;
    if (!document) return;
    set({ saveStatus: "Saving…" });
    try {
      await persistSnapshot(cloneSnapshot(document));
      const refreshed = await sceneryApi.document(document.scenery.id);
      set({
        document: refreshed,
        saveStatus: "All changes saved",
        activity: [`Saved ${new Date().toLocaleTimeString()}`, ...get().activity].slice(0, 30),
      });
    } catch (error) {
      set({ saveStatus: "Error", error: error instanceof Error ? error.message : "Save failed" });
    }
  },

  renameScenery: async (name) => {
    const document = get().document;
    if (!document || !name.trim() || name.trim() === document.scenery.name) return;
    const before = cloneSnapshot(document);
    set({ saveStatus: "Saving…", undoStack: [...get().undoStack, before], redoStack: [] });
    try {
      const scenery = await sceneryApi.patchScenery(document.scenery.id, { name: name.trim() });
      set({ document: { ...document, scenery }, saveStatus: "All changes saved" });
    } catch (error) {
      set({ saveStatus: "Error", error: error instanceof Error ? error.message : "Rename failed" });
    }
  },

  undo: async () => {
    const document = get().document;
    const stack = get().undoStack;
    const target = stack.at(-1);
    if (!document || !target) return;
    const current = cloneSnapshot(document);
    set({
      document: { ...document, scenery: target.scenery, layers: target.layers },
      undoStack: stack.slice(0, -1),
      redoStack: [...get().redoStack, current],
      saveStatus: "Saving…",
    });
    try {
      await persistSnapshot(target);
      set({ saveStatus: "All changes saved" });
    } catch (error) {
      set({ saveStatus: "Error", error: error instanceof Error ? error.message : "Undo failed" });
    }
  },

  redo: async () => {
    const document = get().document;
    const stack = get().redoStack;
    const target = stack.at(-1);
    if (!document || !target) return;
    const current = cloneSnapshot(document);
    set({
      document: { ...document, scenery: target.scenery, layers: target.layers },
      redoStack: stack.slice(0, -1),
      undoStack: [...get().undoStack, current],
      saveStatus: "Saving…",
    });
    try {
      await persistSnapshot(target);
      set({ saveStatus: "All changes saved" });
    } catch (error) {
      set({ saveStatus: "Error", error: error instanceof Error ? error.message : "Redo failed" });
    }
  },
}));
