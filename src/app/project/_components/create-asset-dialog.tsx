"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
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

import type { AssetKind } from "../_data/project-demo-data";

const labels: Record<AssetKind, string> = {
  character: "Character",
  object: "Object",
  tiles: "Tiles",
};

export function CreateAssetDialog({
  children,
}: {
  children: (openDialog: (kind: AssetKind) => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<AssetKind>("character");
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [canvasSize, setCanvasSize] = useState("32 × 32 px");

  const openDialog = (nextKind: AssetKind) => {
    setKind(nextKind);
    setCanvasSize(nextKind === "tiles" ? "16 × 16 px" : "32 × 32 px");
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
            <textarea
              required
              className="min-h-24 w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
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
            <label className="grid gap-2 text-sm font-medium">
              Perspective
              <select className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30">
                <option>Top-down</option>
                <option>Side-on</option>
                <option>Isometric</option>
              </select>
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              defaultChecked
              type="checkbox"
              className="size-4 rounded border-input accent-primary"
            />
            Use Moonlit Orchard project context
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
