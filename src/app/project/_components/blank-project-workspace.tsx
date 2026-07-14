"use client";

import { ArrowLeft, PackagePlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function BlankProjectWorkspace() {
  const [name, setName] = useState("");
  const [gameType, setGameType] = useState("");
  const [visualStyle, setVisualStyle] = useState("");
  const [platform, setPlatform] = useState("");

  const selectClassName =
    "h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

  return (
    <main className="h-full overflow-y-auto px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Button
          render={<Link href="/project/new" />}
          nativeButton={false}
          variant="ghost"
          size="sm"
        >
          <ArrowLeft data-icon="inline-start" />
          Back
        </Button>
        <div className="mt-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Flexible start</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Start with as little as you like
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Add a name, and optionally choose a few basics. You can skip everything and start
            creating right away.
          </p>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <section className="rounded-2xl border bg-background p-6">
            <label className="grid gap-2 text-sm font-medium">
              Project name <span className="font-normal text-muted-foreground">Optional</span>
              <Input
                placeholder="Untitled game"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <div className="my-6 h-px bg-border" />
            <div>
              <h2 className="text-sm font-medium">Project details</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Optional · leave any of these blank
              </p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  Game type
                  <select
                    className={selectClassName}
                    value={gameType}
                    onChange={(event) => setGameType(event.target.value)}
                  >
                    <option value="">Not specified</option>
                    <option>Role-playing game</option>
                    <option>Platformer</option>
                    <option>Puzzle</option>
                    <option>Strategy</option>
                    <option>Simulation</option>
                    <option>Other</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Visual style
                  <select
                    className={selectClassName}
                    value={visualStyle}
                    onChange={(event) => setVisualStyle(event.target.value)}
                  >
                    <option value="">Not specified</option>
                    <option>Pixel art</option>
                    <option>Hand-painted</option>
                    <option>Cartoon</option>
                    <option>Low-poly</option>
                    <option>Retro</option>
                    <option>Other</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium sm:col-span-2">
                  Target platform
                  <select
                    className={selectClassName}
                    value={platform}
                    onChange={(event) => setPlatform(event.target.value)}
                  >
                    <option value="">Not specified</option>
                    <option>PC</option>
                    <option>Mobile</option>
                    <option>Web</option>
                    <option>Console</option>
                    <option>Multi-platform</option>
                  </select>
                </label>
              </div>
            </div>
          </section>
          <aside className="space-y-3">
            <Button
              className="h-auto w-full justify-start p-4"
              render={<Link href="/project?project=moonlit-orchard" />}
              nativeButton={false}
            >
              <PackagePlus className="size-5" />
              <span className="text-left">
                <span className="block">Save project and start generating</span>
                <span className="mt-1 block text-xs font-normal opacity-70">
                  Open the asset generation workspace
                </span>
              </span>
            </Button>
            <p className="px-1 pt-2 text-xs leading-5 text-muted-foreground">
              Demo note: project details are not persisted yet. This continues to the sample asset
              workspace.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
