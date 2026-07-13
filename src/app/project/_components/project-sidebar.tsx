"use client";

import { ChevronLeft, ChevronRight, Folder, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import type { ProjectSummary } from "../_data/project-demo-data";

export function ProjectSidebar({ projects }: { projects: ProjectSummary[] }) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get("project");

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
            <Button
              render={<Link href="/project/new" />}
              nativeButton={false}
              className="mb-4 w-full justify-start"
            >
              <Plus data-icon="inline-start" />
              New Project
            </Button>
            <div className="space-y-2">
              {projects.map((project) => {
                const isSelected =
                  pathname.startsWith("/project") &&
                  pathname !== "/project/new" &&
                  project.id === selectedProjectId;

                return (
                  <Link
                    key={project.id}
                    href={`/project?project=${project.id}`}
                    aria-current={isSelected ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border bg-card px-3 py-3 transition-colors hover:bg-muted",
                      isSelected ? "border-foreground shadow-sm" : "border-border",
                    )}
                  >
                    <Folder className="size-4 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{project.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {project.style}
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground">{project.assetCount}</span>
                  </Link>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-1 flex-col items-center gap-3 py-4">
            {projects.map((project) => (
              <Button
                key={project.id}
                render={<Link href={`/project?project=${project.id}`} />}
                nativeButton={false}
                aria-label={project.name}
                variant={
                  pathname.startsWith("/project") &&
                  pathname !== "/project/new" &&
                  project.id === selectedProjectId
                    ? "default"
                    : "outline"
                }
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
