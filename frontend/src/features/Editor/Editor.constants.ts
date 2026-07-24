import type { EditorCharacterAnimation } from "@/types/editor-document";

export type NodeId =
  | "prototype"
  | "idle"
  | "walk"
  | "harvest"
  | "jump"
  | "celebrate"
  | "metadata";

export type NodeMeta = {
  label: string;
  eyebrow: string;
};

export const frameColors = [
  "#f6c66e",
  "#f09b5b",
  "#91c7a5",
  "#7d9bd0",
  "#f2c17a",
  "#e68c67",
];

export const nodeMeta: Record<NodeId, NodeMeta> = {
  prototype: { label: "Prototype", eyebrow: "Source" },
  idle: { label: "Idle", eyebrow: "Animation" },
  walk: { label: "Walk", eyebrow: "Animation" },
  harvest: { label: "Harvest", eyebrow: "Animation" },
  jump: { label: "Jump", eyebrow: "Animation" },
  celebrate: { label: "Celebrate", eyebrow: "Animation" },
  metadata: { label: "Manifest", eyebrow: "Asset settings" },
};

export function findCharacterAnimation(
  node: NodeId,
  animations: EditorCharacterAnimation[],
) {
  return animations.find((animation) => animation.id === node);
}

export function getNodeLabel(
  node: NodeId,
  animations: EditorCharacterAnimation[],
) {
  return (
    findCharacterAnimation(node, animations)?.label ?? nodeMeta[node].label
  );
}
