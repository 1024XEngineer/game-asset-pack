"use client";

import { ImagePlus, Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { ProjectSummary } from "../_data/project-demo-data";
import { ProjectDropdownField } from "./project-dropdown-field";

const options = {
  gameType: ["Role-playing game", "Platformer", "Puzzle", "Strategy", "Simulation", "Other"],
  visualStyle: ["Top down", "Side on", "Isometric", "Other"],
  platform: ["PC", "Mobile", "Web", "Console", "Multi-platform"],
};

export function ProjectSettingsDialog({
  project,
  onSave,
  iconOnly = false,
}: {
  project: ProjectSummary;
  onSave: (project: ProjectSummary) => void;
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(project);
  const [customGameType, setCustomGameType] = useState("");
  const [customVisualStyle, setCustomVisualStyle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(project);
    setCustomVisualStyle(
      options.visualStyle.includes(project.visualStyle) ? "" : project.visualStyle,
    );
    setCustomGameType(options.gameType.includes(project.gameType) ? "" : project.gameType);
  }, [project]);

  function update<K extends keyof ProjectSummary>(key: K, value: ProjectSummary[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function uploadDirection(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("visualDirection", String(reader.result ?? ""));
    reader.readAsDataURL(file);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.name.trim()) return;
    const hasCustomVisualStyle =
      draft.visualStyle === "Other" || !options.visualStyle.includes(draft.visualStyle);
    const hasCustomGameType = draft.gameType === "Other" || !options.gameType.includes(draft.gameType);
    const visualStyle = hasCustomVisualStyle ? customVisualStyle.trim() : draft.visualStyle;
    const gameType = hasCustomGameType ? customGameType.trim() : draft.gameType;
    if (hasCustomVisualStyle && !visualStyle) return;
    if (hasCustomGameType && !gameType) return;
    onSave({ ...draft, name: draft.name.trim(), gameType, visualStyle, style: visualStyle || draft.style });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size={iconOnly ? "icon-sm" : "sm"}
            className={
              iconOnly
                ? "pointer-events-none opacity-0 text-muted-foreground transition-all group-hover:pointer-events-auto group-hover:opacity-100 hover:bg-foreground/10 hover:text-foreground focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:text-foreground"
                : undefined
            }
            aria-label={`Edit ${project.name}`}
          />
        }
      >
        <Pencil data-icon={iconOnly ? undefined : "inline-start"} />
        {iconOnly ? <span className="sr-only">Edit project</span> : "Edit project"}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
          <DialogDescription>
            These defaults guide every asset generated inside this project.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-5" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium sm:col-span-2">
              Project name
              <Input
                required
                value={draft.name}
                onChange={(event) => update("name", event.target.value)}
              />
            </label>
            <ProjectDropdownField
              label="Game type"
              value={options.gameType.includes(draft.gameType) ? draft.gameType : "Other"}
              options={options.gameType}
              onChange={(value) => {
                update("gameType", value);
                if (value !== "Other") setCustomGameType("");
              }}
            />
            <ProjectDropdownField
              label="Visual style"
              value={options.visualStyle.includes(draft.visualStyle) ? draft.visualStyle : "Other"}
              options={options.visualStyle}
              onChange={(value) => {
                update("visualStyle", value);
                if (value !== "Other") setCustomVisualStyle("");
              }}
            />
            {draft.gameType === "Other" || !options.gameType.includes(draft.gameType) ? (
              <label
                className={`grid gap-2 text-sm font-medium ${
                  draft.visualStyle === "Other" || !options.visualStyle.includes(draft.visualStyle)
                    ? ""
                    : "sm:col-span-2"
                }`}
              >
                Custom game type
                <Input required placeholder="Describe the game type" value={customGameType} onChange={(event) => setCustomGameType(event.target.value)} />
              </label>
            ) : null}
            {draft.visualStyle === "Other" || !options.visualStyle.includes(draft.visualStyle) ? (
              <label
                className={`grid gap-2 text-sm font-medium ${
                  draft.gameType === "Other" || !options.gameType.includes(draft.gameType)
                    ? ""
                    : "sm:col-span-2"
                }`}
              >
                Custom visual style
                <Input
                  required
                  placeholder="Describe the visual style"
                  value={customVisualStyle}
                  onChange={(event) => setCustomVisualStyle(event.target.value)}
                />
              </label>
            ) : null}
            <ProjectDropdownField
              label="Target platform"
              value={draft.platform}
              options={options.platform}
              onChange={(value) => update("platform", value)}
            />
            <label className="grid gap-2 text-sm font-medium sm:col-span-2">
              Game description
              <Textarea
                className="min-h-28 resize-y"
                value={draft.description}
                onChange={(event) => update("description", event.target.value)}
              />
            </label>
          </div>
          <div>
            <p className="text-sm font-medium">Visual direction</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => uploadDirection(event.target.files?.[0])}
            />
            <button
              type="button"
              className="mt-2 flex h-28 w-full items-center justify-center overflow-hidden rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground hover:bg-muted/60"
              onClick={() => fileInputRef.current?.click()}
            >
              {draft.visualDirection ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={draft.visualDirection}
                  alt="Project visual direction"
                  className="size-full object-cover"
                />
              ) : (
                <span className="flex items-center gap-2">
                  <ImagePlus className="size-4" />
                  Upload a reference image
                </span>
              )}
            </button>
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
