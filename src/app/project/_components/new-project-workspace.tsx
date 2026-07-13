"use client";

import { FilePlus2, Gamepad2, Lightbulb } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type ProjectStart = "existing-game" | "idea" | "blank";

const projectStarts: {
  id: ProjectStart;
  title: string;
  description: string;
  icon: typeof Gamepad2;
}[] = [
  {
    id: "existing-game",
    title: "Existing game",
    description: "Start from an established game direction, style, or reference assets.",
    icon: Gamepad2,
  },
  {
    id: "idea",
    title: "I have an idea",
    description: "Turn a story, game mechanic, or visual direction into a project foundation.",
    icon: Lightbulb,
  },
  {
    id: "blank",
    title: "Blank project",
    description: "Create an empty workspace and define the project details later.",
    icon: FilePlus2,
  },
];

export function NewProjectWorkspace() {
  const [selectedStart, setSelectedStart] = useState<ProjectStart | null>(null);

  return (
    <div className="h-full overflow-y-auto px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-4xl">
        <p className="text-xs font-semibold uppercase text-muted-foreground">New Project</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Where would you like to start?
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Choose the starting point that best fits where you are. The next project setup will adapt
          to your choice.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {projectStarts.map((start) => {
            const Icon = start.icon;
            const isSelected = selectedStart === start.id;

            return (
              <Button
                key={start.id}
                aria-pressed={isSelected}
                className="h-auto min-h-52 flex-col items-start justify-between gap-8 p-5 text-left whitespace-normal"
                variant={isSelected ? "secondary" : "outline"}
                onClick={() => setSelectedStart(start.id)}
              >
                <span className="grid size-10 place-items-center rounded-lg bg-muted text-foreground">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block text-base font-semibold">{start.title}</span>
                  <span className="mt-2 block text-sm font-normal leading-6 text-muted-foreground">
                    {start.description}
                  </span>
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
