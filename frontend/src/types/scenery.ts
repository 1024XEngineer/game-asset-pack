export type Vector2 = { x: number; y: number };
export type Size2 = { width: number; height: number };
export type Repeat2 = { x: boolean; y: boolean };

export type SceneryAsset = {
  parentId: number;
  id: number;
  projectId: number;
  name: string;
  type: "scenery";
  description: string;
  resultUrl: string;
  tags: string[];
  attributes: { width: number; height: number };
};

export type LayerAttributes = {
  visible: boolean;
  opacity: number;
  zIndex: number;
  position: Vector2;
  scale: Vector2;
  size: Size2;
  rotation: number;
  repeat: Repeat2;
  speed: Vector2;
  parallax: Vector2;
};

export type LayerMetadata = {
  role: LayerRole;
  sourcePrompt: string;
  effectivePrompt: string;
  mediaType: string;
  hasAlphaChannel: boolean;
  hasTransparentPixels: boolean;
  alphaBounds: { x: number; y: number; width: number; height: number } | null;
};

export type LayerAsset = {
  parentId: number;
  id: number;
  projectId: number;
  name: string;
  type: "layer";
  description: string;
  resultUrl: string;
  tags: string[];
  attributes: LayerAttributes;
  metadata: LayerMetadata;
  siblingOrder: number;
};

export type SceneryDocument = {
  scenery: SceneryAsset;
  layers: LayerAsset[];
  revision: number;
};

export type LayerRole = "sky" | "distant" | "midground" | "foreground" | "atmosphere";
export type GenerationStatus = "queued" | "running" | "completed" | "failed";

export type GenerationJob = {
  id: string;
  sceneryId: number;
  status: GenerationStatus;
  request: { name: string; prompt: string; role: LayerRole };
  layer: LayerAsset | null;
  error: { code: string; message: string } | null;
  createdAt: string;
  updatedAt: string;
};

export type LayerAttributesPatch = Partial<{
  visible: boolean;
  opacity: number;
  zIndex: number;
  position: Partial<Vector2>;
  scale: Partial<Vector2>;
  rotation: number;
  repeat: Partial<Repeat2>;
  speed: Partial<Vector2>;
  parallax: Partial<Vector2>;
}>;

