"use client";

import { FilePlus2, Gamepad2, Lightbulb, Link2, Upload } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ImportMode = "link" | "file";

const projectStarts = [
  {
    id: "existing-game",
    title: "Existing game",
    description: "Import a playable link or upload a local build so we can learn its direction.",
    icon: Gamepad2,
  },
  {
    id: "idea",
    title: "I have an idea",
    description:
      "Describe the game, generate a visual direction, and refine it until it feels right.",
    icon: Lightbulb,
    href: "/project/new/idea",
  },
  {
    id: "blank",
    title: "Blank project",
    description:
      "Open a flexible workspace. Add context if useful, or create an asset immediately.",
    icon: FilePlus2,
    href: "/project/new/blank",
  },
] as const;

export function NewProjectWorkspace() {
  const [importOpen, setImportOpen] = useState(false);
  const [mode, setMode] = useState<ImportMode>("link");
  const [gameUrl, setGameUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canImport = mode === "link" ? gameUrl.trim().length > 0 : Boolean(file);

  return (
    <div className="h-full overflow-y-auto px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-4xl">
        <p className="text-xs font-semibold uppercase text-muted-foreground">New Project</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Where would you like to start?
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Pick the amount of structure you need. You can always add more project context later.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {projectStarts.map((start) => {
            const Icon = start.icon;
            const content = (
              <>
                <span className="grid size-10 place-items-center rounded-lg bg-muted text-foreground">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block text-base font-semibold">{start.title}</span>
                  <span className="mt-2 block text-sm font-normal leading-6 text-muted-foreground">
                    {start.description}
                  </span>
                </span>
              </>
            );

            return start.id === "existing-game" ? (
              <Button
                key={start.id}
                className="h-auto min-h-52 flex-col items-start justify-between gap-8 p-5 text-left whitespace-normal"
                variant="outline"
                onClick={() => setImportOpen(true)}
              >
                {content}
              </Button>
            ) : (
              <Button
                key={start.id}
                render={<Link href={start.href} />}
                nativeButton={false}
                className="h-auto min-h-52 flex-col items-start justify-between gap-8 p-5 text-left whitespace-normal"
                variant="outline"
              >
                {content}
              </Button>
            );
          })}
        </div>
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import an existing game</DialogTitle>
            <DialogDescription>
              Share a playable link or upload a local game build. Nothing is uploaded in this demo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setMode("link")}
              className={cn(
                "flex h-10 items-center justify-center gap-2 rounded-md text-sm font-medium",
                mode === "link" && "bg-background shadow-sm",
              )}
            >
              <Link2 className="size-4" />
              Game link
            </button>
            <button
              type="button"
              onClick={() => setMode("file")}
              className={cn(
                "flex h-10 items-center justify-center gap-2 rounded-md text-sm font-medium",
                mode === "file" && "bg-background shadow-sm",
              )}
            >
              <Upload className="size-4" />
              Local files
            </button>
          </div>
          {mode === "link" ? (
            <label className="grid gap-2 text-sm font-medium">
              Playable URL
              <Input
                type="url"
                placeholder="https://your-game.example"
                value={gameUrl}
                onChange={(event) => setGameUrl(event.target.value)}
              />
            </label>
          ) : (
            <div>
              <input
                ref={fileInputRef}
                className="sr-only"
                type="file"
                accept=".zip,.html,.exe,.dmg,.apk"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="grid min-h-36 w-full place-items-center rounded-xl border border-dashed p-5 text-center hover:bg-muted/50"
              >
                <span>
                  <Upload className="mx-auto mb-3 size-6 text-muted-foreground" />
                  <span className="block text-sm font-medium">
                    {file?.name ?? "Choose a game build"}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    ZIP, HTML, executable, DMG or APK
                  </span>
                </span>
              </button>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!canImport}
              render={<Link href="/project/new/import-review" />}
              nativeButton={false}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
