"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

import type { CreatableAssetKind, ProjectSummary } from "../_data/project-demo-data";

const labels: Record<CreatableAssetKind, string> = {
  character: "Character",
  object: "Object",
  tiles: "Tiles",
  audio: "Audio",
};

export type CreationRequest = {
  kind: CreatableAssetKind;
  name: string;
  prompt: string;
  canvasSize: string;
};

export function CreateAssetDialog({
  children,
  initialPrompt = "",
  onCreate,
  project,
}: {
  children: (openDialog: (kind: CreatableAssetKind) => void) => React.ReactNode;
  initialPrompt?: string;
  onCreate: (request: CreationRequest) => void;
  project: ProjectSummary;
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<CreatableAssetKind>("character");
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [canvasSize, setCanvasSize] = useState("32 × 32 px");

  const openDialog = (nextKind: CreatableAssetKind) => {
    setKind(nextKind);
    setCanvasSize(nextKind === "tiles" ? "16 × 16 px" : "32 × 32 px");
    setPrompt(initialPrompt.trim());
    setOpen(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCreate({ kind, name: name.trim(), prompt: prompt.trim(), canvasSize });
    setOpen(false);
    setName("");
    setPrompt("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children(openDialog)}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create {labels[kind]}</DialogTitle>
          <DialogDescription>
            Set the production details for this {labels[kind].toLowerCase()}.
            Project defaults will guide its{" "}
            {kind === "audio" ? "tone and atmosphere" : "visual style"}.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium">
            Asset name
            <Input
              required
              placeholder={
                kind === "audio"
                  ? "e.g. Orchard at Night"
                  : `e.g. ${kind === "character" ? "Orchard Keeper" : "Moonlit Lantern"}`
              }
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Creative brief
            <Textarea
              required
              className="min-h-24 resize-y"
              placeholder={
                kind === "audio"
                  ? "Describe the mood, instruments, rhythm, and intended use..."
                  : "Describe the subject, material, mood, and details to generate..."
              }
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
          </label>

          {kind !== "audio" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Canvas size
                <Input
                  value={canvasSize}
                  onChange={(event) => setCanvasSize(event.target.value)}
                />
              </label>
              <div className="grid gap-2 text-sm font-medium">
                <label htmlFor="create-asset-perspective">Perspective</label>
                <NativeSelect id="create-asset-perspective" className="w-full">
                  <NativeSelectOption>Top-down</NativeSelectOption>
                  <NativeSelectOption>Side-on</NativeSelectOption>
                  <NativeSelectOption>Isometric</NativeSelectOption>
                </NativeSelect>
              </div>
            </div>
          ) : null}

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox defaultChecked />
            Use {project.name} project context
          </label>

          <div className="rounded-lg border bg-muted/40 p-3">
            <p className="text-xs font-medium text-muted-foreground">
              Generation context
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[project.gameType, project.visualStyle, project.platform]
                .filter(Boolean)
                .map((item) => (
                  <Badge key={item} variant="secondary">
                    {item}
                  </Badge>
                ))}
            </div>
            {project.description ? (
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                {project.description}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit">Create {labels[kind]}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
