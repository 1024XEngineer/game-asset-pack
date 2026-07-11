"use client";

import { ChevronDown, ChevronLeft, ChevronRight, CircleDot, Folder, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type { ProjectSummary } from "../_data/project-demo-data";

export function ProjectSidebar({ projects }: { projects: ProjectSummary[] }) {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedProjectIds, setExpandedProjectIds] = useState<string[]>([projects[0]?.id ?? ""]);

  return (
    <aside
      className={cn(
        "border-r bg-sidebar transition-[width] duration-300 ease-out",
        isOpen ? "w-80" : "w-16",
      )}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex h-16 items-center justify-between px-3">
          {isOpen ? (
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Projects</p>
              <h2 className="truncate text-lg font-semibold">Asset Library</h2>
            </div>
          ) : null}
          <Button
            aria-label={isOpen ? "Collapse project list" : "Expand project list"}
            variant="outline"
            size="icon-sm"
            onClick={() => setIsOpen((current) => !current)}
          >
            {isOpen ? <ChevronLeft /> : <ChevronRight />}
          </Button>
        </div>
        <Separator />

        {isOpen ? (
          <ScrollArea className="min-h-0 flex-1 px-3 py-4">
            <Button className="mb-4 w-full justify-start">
              <Plus data-icon="inline-start" />
              New Project
            </Button>
            <div className="space-y-2">
              {projects.map((project) => (
                <Collapsible
                  key={project.id}
                  open={expandedProjectIds.includes(project.id)}
                  onOpenChange={(nextOpen) => {
                    setExpandedProjectIds((current) =>
                      nextOpen
                        ? [...current, project.id]
                        : current.filter((item) => item !== project.id),
                    );
                  }}
                  className={cn(
                    "rounded-lg border bg-card",
                    project.isActive ? "border-foreground shadow-sm" : "border-border",
                  )}
                >
                  <CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-3 text-left">
                    <Folder className="size-4 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{project.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {project.style}
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground">{project.assetCount}</span>
                    <ChevronDown
                      className={cn(
                        "size-4 text-muted-foreground transition-transform",
                        expandedProjectIds.includes(project.id) && "rotate-180",
                      )}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <Separator />
                    <div className="px-3 py-2">
                      {project.sections.map((section) => (
                        <Button
                          key={section}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-muted-foreground"
                        >
                          <CircleDot data-icon="inline-start" className="size-3" />
                          {section}
                        </Button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-1 flex-col items-center gap-3 py-4">
            {projects.map((project) => (
              <Button
                key={project.id}
                aria-label={project.name}
                variant={project.isActive ? "default" : "outline"}
                size="icon-lg"
              >
                <Folder />
              </Button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
