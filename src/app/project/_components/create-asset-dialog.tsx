"use client";

import { useState } from "react";

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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

import type { AssetKind } from "../_data/project-demo-data";

const labels: Record<AssetKind, string> = {
  character: "Character",
  object: "Object",
  tiles: "Tiles",
};

export function CreateAssetDialog({
  children,
  initialPrompt = "",
  projectName,
}: {
  children: (openDialog: (kind: AssetKind) => void) => React.ReactNode;
  initialPrompt?: string;
  projectName: string;
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<AssetKind>("character");
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [canvasSize, setCanvasSize] = useState("32 × 32 px");

  const openDialog = (nextKind: AssetKind) => {
    setKind(nextKind);
    setCanvasSize(nextKind === "tiles" ? "16 × 16 px" : "32 × 32 px");
    setPrompt(initialPrompt.trim());
    setOpen(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
            Set the production details for this {labels[kind].toLowerCase()}. Project defaults will
            guide its visual style.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium">
            Asset name
            <Input
              required
              placeholder={`e.g. ${kind === "character" ? "Orchard Keeper" : "Moonlit Lantern"}`}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Creative brief
            <Textarea
              required
              className="min-h-24 resize-y"
              placeholder="Describe the subject, material, mood, and details to generate..."
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Canvas size
              <Input value={canvasSize} onChange={(event) => setCanvasSize(event.target.value)} />
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

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox defaultChecked />
            Use {projectName} project context
          </label>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit">Create {labels[kind]}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
