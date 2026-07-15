"use client";

import { ChevronLeft, ChevronRight, Folder, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { ProjectSettingsDialog } from "./project-settings-dialog";
import { useProjectStore } from "./project-store";

const LAST_PROJECT_STORAGE_KEY = "game-asset-pack:last-project-id";

export function ProjectSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get("project");
  const { projects, updateProject, deleteProject } = useProjectStore();

  function handleDeleteProject(projectId: string) {
    const nextProject = projects.find((project) => project.id !== projectId);
    deleteProject(projectId);
    try {
      if (localStorage.getItem(LAST_PROJECT_STORAGE_KEY) === projectId) {
        localStorage.removeItem(LAST_PROJECT_STORAGE_KEY);
      }
    } catch {
      // Navigation still works when browser storage is unavailable.
    }
    if (selectedProjectId === projectId) {
      router.replace(
        nextProject ? `/project?project=${encodeURIComponent(nextProject.id)}` : "/project",
      );
    }
  }

  return (
    <aside
      className={cn(
        "w-16 shrink-0 border-r bg-sidebar transition-[width] duration-300 ease-out",
        isOpen && "md:w-80",
      )}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex h-16 items-center justify-center px-3 md:justify-between">
          {isOpen ? (
            <div className="hidden min-w-0 md:block">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Projects</p>
              <h2 className="truncate text-lg font-semibold">Asset Library</h2>
            </div>
          ) : null}
          <Button
            aria-label={isOpen ? "Collapse project list" : "Expand project list"}
            variant="outline"
            size="icon-sm"
            className="hidden md:inline-flex"
            onClick={() => setIsOpen((current) => !current)}
          >
            {isOpen ? <ChevronLeft /> : <ChevronRight />}
          </Button>
          <Folder className="size-5 text-muted-foreground md:hidden" />
        </div>
        <Separator />

        {isOpen ? (
          <ScrollArea className="hidden min-h-0 flex-1 px-3 py-4 md:block">
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
                  <div
                    key={project.id}
                    className={cn(
                      "group flex items-center gap-1 rounded-lg border bg-card p-1.5 transition-colors hover:bg-muted",
                      isSelected ? "border-foreground shadow-sm" : "border-border",
                    )}
                  >
                    <Link
                      href={`/project?project=${project.id}`}
                      aria-current={isSelected ? "page" : undefined}
                      className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 py-1"
                    >
                      <Folder className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{project.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {project.style}
                        </span>
                      </span>
                    </Link>
                    <ProjectSettingsDialog project={project} onSave={updateProject} iconOnly />
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:text-destructive"
                            aria-label={`Delete ${project.name}`}
                          />
                        }
                      >
                        <Trash2 />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {project.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This removes the project and its asset workspace from this browser. This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            Delete project
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="hidden flex-1 flex-col items-center gap-3 py-4 md:flex">
            <Button
              render={<Link href="/project/new" />}
              nativeButton={false}
              aria-label="New Project"
              variant="outline"
              size="icon-lg"
            >
              <Plus />
            </Button>
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

        <div className="flex flex-1 flex-col items-center gap-3 py-4 md:hidden">
          <Button
            render={<Link href="/project/new" />}
            nativeButton={false}
            aria-label="New Project"
            variant="outline"
            size="icon-lg"
          >
            <Plus />
          </Button>
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
      </div>
    </aside>
  );
}
