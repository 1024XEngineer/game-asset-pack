"use client";

import { AudioLines, Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const audioWorks = [
  {
    id: "orchard-night",
    prompt: "Soft nocturnal ambience with distant bells, leaves, and a gentle repeating melody.",
  },
  {
    id: "harbor-machines",
    prompt: "Industrial percussion, low mechanical drones, and a slow platformer rhythm.",
  },
  {
    id: "courier-theme",
    prompt: "A playful woodland theme with light percussion and warm plucked instruments.",
  },
];

export function AudioSidebar() {
  const searchParams = useSearchParams();
  const isNewAudio = searchParams.get("new") === "1";
  const selectedPrompt = isNewAudio ? null : searchParams.get("prompt") || audioWorks[0].prompt;

  return (
    <aside className="w-16 shrink-0 border-r bg-sidebar md:w-72">
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex h-16 items-center justify-center px-3 md:justify-start">
          <AudioLines className="size-5 md:mr-2" />
          <div className="hidden md:block">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Audio</p>
            <h2 className="text-sm font-semibold">Sound workspace</h2>
          </div>
        </div>
        <Separator />
        <ScrollArea className="min-h-0 flex-1 p-3">
          <Button
            render={<Link href="/audio?new=1" />}
            nativeButton={false}
            variant={isNewAudio ? "secondary" : "default"}
            className="mb-4 w-full md:justify-start"
            size="sm"
            aria-label="New audio"
          >
            <Plus />
            <span className="hidden md:inline">New audio</span>
          </Button>
          <div className="flex flex-col items-start gap-2">
            {audioWorks.map((audio) => {
              const active = selectedPrompt === audio.prompt;
              const params = new URLSearchParams({ prompt: audio.prompt });
              return (
                <Link
                  key={audio.id}
                  href={`/audio?${params.toString()}`}
                  aria-current={active ? "page" : undefined}
                  aria-label={audio.prompt}
                  className={cn(
                    "flex w-full items-center justify-center rounded-md border px-2.5 py-2 transition-colors hover:bg-muted md:justify-start md:gap-2",
                    active ? "border-foreground bg-card" : "border-border/70 bg-background/50",
                  )}
                >
                  <AudioLines className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="hidden min-w-0 flex-1 md:block">
                    <span
                      className="block max-w-[10.5rem] truncate text-sm font-medium leading-5"
                      title={audio.prompt}
                    >
                      {audio.prompt}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </aside>
  );
}
