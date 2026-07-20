"use client";

import { CircleCheck, Layers3, LoaderCircle, Sparkles, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";

import { useSceneryStore } from "@/stores/scenery-store";
import type { LayerRole } from "@/types/scenery";

const roleOptions: Array<{ value: LayerRole; label: string; hint: string }> = [
  { value: "sky", label: "Sky / Base", hint: "Complete opaque background" },
  { value: "distant", label: "Distant", hint: "Mountains, skyline, horizon" },
  { value: "midground", label: "Midground", hint: "Terrain and scene structure" },
  { value: "foreground", label: "Foreground", hint: "Near objects, transparent PNG" },
  { value: "atmosphere", label: "Atmosphere", hint: "Fog, clouds, light overlays" },
];

const defaultPrompts: Record<LayerRole, string> = {
  sky: "A calm moonlit sky above an enchanted orchard, deep blue gradient, scattered stars, hand-painted 2D game background",
  distant: "Distant rolling hills and a soft mountain silhouette under moonlight, cozy fantasy 2D game scenery",
  midground: "An orchard field with winding paths, low stone walls and rows of fruit trees, side-view 2D game scenery",
  foreground: "Dark leafy orchard branches and tall grass framing the lower edges, isolated foreground layer",
  atmosphere: "Soft drifting moonlit mist and subtle firefly particles, isolated atmospheric overlay",
};

export function GenerationPanel() {
  const document = useSceneryStore((state) => state.document);
  const job = useSceneryStore((state) => state.generationJob);
  const generateLayer = useSceneryStore((state) => state.generateLayer);
  const [role, setRole] = useState<LayerRole>("midground");
  const [name, setName] = useState("Orchard midground");
  const [prompt, setPrompt] = useState(defaultPrompts.midground);
  const isBusy = job?.status === "queued" || job?.status === "running";
  const selectedRole = useMemo(() => roleOptions.find((item) => item.value === role)!, [role]);

  if (!document) return null;

  const changeRole = (next: LayerRole) => {
    setRole(next);
    setPrompt(defaultPrompts[next]);
    setName(
      next === "sky"
        ? "Moonlit sky"
        : next === "atmosphere"
          ? "Moonlit mist"
          : `${next[0].toUpperCase()}${next.slice(1)} layer`,
    );
  };

  return (
    <div className="inspector-content">
      <section className="selection-summary">
        <span>Current scenery</span>
        <strong>{document.scenery.name}</strong>
        <small>{document.layers.length} generated layer{document.layers.length === 1 ? "" : "s"}</small>
      </section>

      <section className="form-section">
        <div className="section-heading">
          <div><Sparkles size={15} /><strong>Generate a PNG layer</strong></div>
          <p>One request creates one independent compositing layer.</p>
        </div>

        <label className="field-label">
          Layer role
          <select value={role} onChange={(event) => changeRole(event.target.value as LayerRole)}>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <small>{selectedRole.hint}</small>
        </label>

        <label className="field-label">
          Layer name
          <input value={name} maxLength={160} onChange={(event) => setName(event.target.value)} />
        </label>

        <label className="field-label">
          Description
          <div className="prompt-box">
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Describe one scenery depth layer…"
            />
            <div className="prompt-meta">
              <span>{prompt.length.toLocaleString()} / 32,000</span>
              <span>PNG · model may take several minutes</span>
            </div>
          </div>
        </label>

        <button
          type="button"
          className="button primary wide generate-button"
          disabled={isBusy || !name.trim() || !prompt.trim()}
          onClick={() => void generateLayer({ name: name.trim(), prompt: prompt.trim(), role })}
        >
          {isBusy ? <LoaderCircle className="spin" size={17} /> : <Sparkles size={17} />}
          {isBusy ? "Generating layer…" : "Generate layer"}
        </button>
      </section>

      {job ? (
        <section className={`job-card ${job.status}`}>
          <div className="job-card-title">
            {job.status === "completed" ? <CircleCheck size={16} /> : null}
            {job.status === "failed" ? <TriangleAlert size={16} /> : null}
            {isBusy ? <LoaderCircle className="spin" size={16} /> : null}
            <strong>{job.status === "completed" ? "Layer ready" : job.status === "failed" ? "Generation failed" : "Generation in progress"}</strong>
          </div>
          <p>{job.status === "failed" ? job.error?.message : job.request.name}</p>
          {job.layer && job.layer.metadata.role !== "sky" && !job.layer.metadata.hasTransparentPixels ? (
            <div className="inline-warning">
              <TriangleAlert size={14} /> The model returned an opaque PNG. It remains editable, but may cover layers behind it.
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="generation-note">
        <Layers3 size={16} />
        <p><strong>Tip:</strong> generate the sky first, then add distant, midground, foreground and atmosphere layers.</p>
      </section>
    </div>
  );
}

