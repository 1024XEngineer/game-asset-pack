import { useForm } from "@tanstack/react-form";
import { ArrowLeft, Gamepad2, Lightbulb, Sparkles } from "lucide-react";

import type { ProjectSummary } from "./model";

export function NewProjectScreen({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (project: ProjectSummary) => void | Promise<void>;
}) {
  const form = useForm({
    defaultValues: {
      name: "",
      gameType: "Role-playing game",
      platform: "PC",
      description: "",
      style: "Pixel art",
    },
    onSubmit: async ({ value }) => {
      const id =
        value.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || `project-${Date.now()}`;
      await onCreate({
        id,
        name: value.name.trim(),
        gameType: value.gameType,
        platform: value.platform,
        description: value.description.trim() || "A new game asset workspace.",
        style: value.style,
        visualStyle: value.style,
        visualDirection: "",
        assetCount: 0,
      });
    },
  });

  return (
    <main className="new-project-page">
      <div className="new-project-header">
        <button type="button" className="back-link" onClick={onCancel}>
          <ArrowLeft size={16} /> Project library
        </button>
        <p className="eyebrow">New project</p>
        <h1>Build a world worth making assets for.</h1>
        <p>
          Start with a playable idea. Project context carries into generation
          prompts and the asset library.
        </p>
      </div>
      <div className="start-cards">
        <article>
          <Gamepad2 size={22} />
          <h2>Existing game</h2>
          <p>
            Import an executable, link, or reference pack when backend import is
            available.
          </p>
          <span>Coming with Media</span>
        </article>
        <article className="start-card--featured">
          <Lightbulb size={22} />
          <h2>Idea first</h2>
          <p>
            Define game type, visual language, and your first playable context.
          </p>
          <span>Recommended</span>
        </article>
        <article>
          <Sparkles size={22} />
          <h2>Blank workspace</h2>
          <p>Create assets now and refine the project context later.</p>
          <span>Flexible start</span>
        </article>
      </div>
      <form
        className="project-form"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <div className="form-heading">
          <h2>Project context</h2>
          <p>These defaults appear in every generation request.</p>
        </div>
        <form.Field name="name">
          {(field) => (
            <label>
              Project name
              <input
                autoFocus
                required
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="e.g. Moonlit Orchard"
              />
            </label>
          )}
        </form.Field>
        <div className="form-grid">
          <form.Field name="gameType">
            {(field) => (
              <label>
                Game type
                <select
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                >
                  <option>Role-playing game</option>
                  <option>Platformer</option>
                  <option>Strategy</option>
                  <option>Simulation</option>
                </select>
              </label>
            )}
          </form.Field>
          <form.Field name="platform">
            {(field) => (
              <label>
                Target platform
                <select
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                >
                  <option>PC</option>
                  <option>Web</option>
                  <option>Mobile</option>
                  <option>Console</option>
                </select>
              </label>
            )}
          </form.Field>
        </div>
        <form.Field name="style">
          {(field) => (
            <label>
              Visual direction
              <input
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="Pixel art, hand-painted, cartoon..."
              />
            </label>
          )}
        </form.Field>
        <form.Field name="description">
          {(field) => (
            <label>
              Game description
              <textarea
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder="What is the player doing? What should the world feel like?"
              />
            </label>
          )}
        </form.Field>
        <div className="form-actions">
          <button
            type="button"
            className="button button--quiet"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button className="button button--primary" type="submit">
            Create project <Sparkles size={16} />
          </button>
        </div>
      </form>
    </main>
  );
}
