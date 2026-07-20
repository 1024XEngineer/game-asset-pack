"use client";

import { Eye, EyeOff, ImageIcon, Link2, LockKeyhole, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

import { mediaUrl } from "@/lib/api";
import { useSceneryStore } from "@/stores/scenery-store";
import type { LayerAttributesPatch } from "@/types/scenery";

function NumberField({
  label,
  value,
  step = 1,
  min,
  max,
  onCommit,
}: {
  label: string;
  value: number;
  step?: number;
  min?: number;
  max?: number;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(Number(value.toFixed(4))));
  useEffect(() => setDraft(String(Number(value.toFixed(4)))), [value]);

  const commit = () => {
    let parsed = Number(draft);
    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    if (min !== undefined) parsed = Math.max(min, parsed);
    if (max !== undefined) parsed = Math.min(max, parsed);
    setDraft(String(parsed));
    if (parsed !== value) onCommit(parsed);
  };

  return (
    <label className="number-field">
      <span>{label}</span>
      <input
        type="number"
        value={draft}
        step={step}
        min={min}
        max={max}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
    </label>
  );
}

export function PropertiesPanel() {
  const document = useSceneryStore((state) => state.document);
  const selectedLayerId = useSceneryStore((state) => state.selectedLayerId);
  const patchLayer = useSceneryStore((state) => state.patchLayer);
  const removeLayerBackground = useSceneryStore((state) => state.removeLayerBackground);
  const previewLayer = useSceneryStore((state) => state.previewLayer);
  const persistPreview = useSceneryStore((state) => state.persistPreview);
  const renameLayer = useSceneryStore((state) => state.renameLayer);
  const setActiveTab = useSceneryStore((state) => state.setActiveTab);
  const layer = document?.layers.find((item) => item.id === selectedLayerId);
  const [name, setName] = useState(layer?.name ?? "");

  useEffect(() => setName(layer?.name ?? ""), [layer?.id, layer?.name]);

  if (!layer) {
    return (
      <div className="empty-inspector">
        <span><ImageIcon size={22} /></span>
        <strong>No layer selected</strong>
        <p>Select a layer on the canvas or in the layer panel to edit its properties.</p>
        <button type="button" className="button secondary" onClick={() => setActiveTab("generate")}>Generate a layer</button>
      </div>
    );
  }

  const attributes = layer.attributes;
  const patch = (value: LayerAttributesPatch) => void patchLayer(layer.id, value);

  return (
    <div className="inspector-content properties-content">
      <section className="selected-layer-card checkerboard">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mediaUrl(layer.resultUrl)} alt="" />
        <div>
          <input
            value={name}
            aria-label="Layer name"
            onChange={(event) => setName(event.target.value)}
            onBlur={() => void renameLayer(layer.id, name)}
          />
          <small>{layer.metadata.role} · layer #{layer.id}</small>
        </div>
      </section>

      {!layer.metadata.hasTransparentPixels && layer.metadata.role !== "sky" ? (
        <div className="inline-warning opaque-warning">
          <TriangleAlert size={15} />
          <span>This PNG has no transparent pixels and may hide lower layers.</span>
          <button type="button" onClick={() => void removeLayerBackground(layer.id)}>
            Remove background
          </button>
        </div>
      ) : null}

      <PropertySection title="Transform">
        <div className="field-grid two">
          <NumberField label="X" value={attributes.position.x} onCommit={(x) => patch({ position: { x } })} />
          <NumberField label="Y" value={attributes.position.y} onCommit={(y) => patch({ position: { y } })} />
        </div>
        <div className="field-grid two">
          <NumberField label="Scale X" value={attributes.scale.x} step={0.05} min={0.01} max={100} onCommit={(x) => patch({ scale: { x } })} />
          <NumberField label="Scale Y" value={attributes.scale.y} step={0.05} min={0.01} max={100} onCommit={(y) => patch({ scale: { y } })} />
        </div>
        <div className="field-grid">
          <NumberField label="Rotation" value={attributes.rotation} step={1} min={-360000} max={360000} onCommit={(rotation) => patch({ rotation })} />
        </div>
      </PropertySection>

      <PropertySection title="Appearance">
        <button
          type="button"
          className={`visibility-toggle ${attributes.visible ? "active" : ""}`}
          onClick={() => patch({ visible: !attributes.visible })}
        >
          {attributes.visible ? <Eye size={16} /> : <EyeOff size={16} />}
          <span><strong>Visible</strong><small>{attributes.visible ? "Layer participates in rendering" : "Hidden but retained in scene data"}</small></span>
          <i />
        </button>
        <label className="range-field">
          <span><strong>Opacity</strong><output>{Math.round(attributes.opacity * 100)}%</output></span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={attributes.opacity}
            onChange={(event) => previewLayer(layer.id, { opacity: Number(event.target.value) })}
            onPointerUp={() => void persistPreview(layer.id)}
            onKeyUp={() => void persistPreview(layer.id)}
          />
        </label>
      </PropertySection>

      <PropertySection title="Original image">
        <div className="readonly-grid">
          <span><LockKeyhole size={13} /> Width<strong>{attributes.size.width}px</strong></span>
          <span><LockKeyhole size={13} /> Height<strong>{attributes.size.height}px</strong></span>
        </div>
        <a className="source-link" href={mediaUrl(layer.resultUrl)} target="_blank" rel="noreferrer">
          <Link2 size={14} /> Open source PNG
        </a>
      </PropertySection>

      <PropertySection title="Runtime data" hint="Saved and exported; not simulated in this Web preview.">
        <div className="runtime-row">
          <span>Repeat</span>
          <label><input type="checkbox" checked={attributes.repeat.x} onChange={(event) => patch({ repeat: { x: event.target.checked } })} /> X</label>
          <label><input type="checkbox" checked={attributes.repeat.y} onChange={(event) => patch({ repeat: { y: event.target.checked } })} /> Y</label>
        </div>
        <div className="field-grid two">
          <NumberField label="Speed X" value={attributes.speed.x} step={0.1} onCommit={(x) => patch({ speed: { x } })} />
          <NumberField label="Speed Y" value={attributes.speed.y} step={0.1} onCommit={(y) => patch({ speed: { y } })} />
        </div>
        <div className="field-grid two">
          <NumberField label="Parallax X" value={attributes.parallax.x} step={0.05} onCommit={(x) => patch({ parallax: { x } })} />
          <NumberField label="Parallax Y" value={attributes.parallax.y} step={0.05} onCommit={(y) => patch({ parallax: { y } })} />
        </div>
      </PropertySection>
    </div>
  );
}

function PropertySection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="property-section">
      <div className="property-section-heading">
        <strong>{title}</strong>
        {hint ? <p>{hint}</p> : null}
      </div>
      <div className="property-section-body">{children}</div>
    </section>
  );
}
