export type NodeId = "prototype" | "idle" | "walk" | "harvest" | "jump" | "celebrate" | "metadata";

export type NodeMeta = {
  label: string;
  eyebrow: string;
  count?: string;
};

export type AudioCue = {
  label: string;
  time: string;
};

export const frameColors = ["#f6c66e", "#f09b5b", "#91c7a5", "#7d9bd0", "#f2c17a", "#e68c67"];

export const nodeMeta: Record<NodeId, NodeMeta> = {
  prototype: { label: "Prototype", eyebrow: "Source" },
  idle: { label: "Idle", eyebrow: "Animation", count: "6f" },
  walk: { label: "Walk", eyebrow: "Animation", count: "8f" },
  harvest: { label: "Harvest", eyebrow: "Animation", count: "12f" },
  jump: { label: "Jump", eyebrow: "Animation", count: "10f" },
  celebrate: { label: "Celebrate", eyebrow: "Animation", count: "8f" },
  metadata: { label: "Manifest", eyebrow: "Asset settings" },
};

export const animationAudio: Partial<Record<NodeId, AudioCue>> = {
  idle: { label: "cloth_sway.wav", time: "0.06s" },
  walk: { label: "footstep_grass.wav", time: "0.18s" },
  harvest: { label: "harvest_pickup.wav", time: "0.42s" },
};

export const defaultEditorPrompt =
  "Keep the same silhouette. Add a soft blue scarf and a readable harvest pouch.";

export const defaultPrototypeName = "forager-hero-prototype.png";
