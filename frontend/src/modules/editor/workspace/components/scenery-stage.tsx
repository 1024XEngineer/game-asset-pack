import { SCENERY_LAYERS, type SceneryLayerId } from "../model/scenery-data";

const layerImages: Record<SceneryLayerId, string> = {
  sky: "/assets/sky.png",
  wind: "/assets/wind.png",
  "nearby-trees": "/assets/nearby-trees.png",
};

const layerBlendClasses: Record<SceneryLayerId, string> = {
  sky: "",
  wind: "mix-blend-multiply",
  "nearby-trees": "mix-blend-multiply",
};

function layerClass(
  selectedLayers: SceneryLayerId[],
  visibleLayers: SceneryLayerId[],
  layer: SceneryLayerId,
) {
  const base = "absolute inset-0 transition-[filter,opacity] duration-200";

  if (!visibleLayers.includes(layer)) return `${base} invisible opacity-0`;

  if (!selectedLayers.includes(layer)) return base;

  return `${base} brightness-110 saturate-125 drop-shadow-[0_0_8px_rgba(239,176,180,0.95)]`;
}

export function SceneryStage({
  selectedLayers,
  visibleLayers,
}: {
  selectedLayers: SceneryLayerId[];
  visibleLayers: SceneryLayerId[];
}) {
  return (
    <main className="relative flex min-h-[28rem] min-w-0 flex-1 items-center justify-center overflow-hidden bg-[#eceae4] p-5 lg:h-full lg:p-10">
      <div className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl border border-black/10 bg-[#c8e8ed] shadow-sm">
        {SCENERY_LAYERS.map((layer) => (
          <div
            key={layer.id}
            className={`${layerClass(selectedLayers, visibleLayers, layer.id)} ${layerBlendClasses[layer.id]}`}
          >
            <img
              src={layerImages[layer.id]}
              alt=""
              className="size-full object-cover"
              decoding="async"
              loading="eager"
            />
          </div>
        ))}
        {selectedLayers.length ? (
          <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-full border border-white/30 bg-black/35 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            {selectedLayers
              .map((layerId) => SCENERY_LAYERS.find((layer) => layer.id === layerId)?.label)
              .filter(Boolean)
              .join(", ")}{" "}
            selected
          </div>
        ) : null}
      </div>
    </main>
  );
}
