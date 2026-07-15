"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";

import { cn } from "@/lib/utils";

import { ProjectSidebar } from "./project-sidebar";

export function ProjectChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEditorRoute = pathname.startsWith("/project/assets/");

  return (
    <main
      className={cn(
        "flex min-h-0 flex-1 overflow-hidden bg-muted/30",
        isEditorRoute ? "h-screen" : "h-[calc(100vh-3.5rem)]",
      )}
    >
      {!isEditorRoute ? (
        <Suspense fallback={<div className="w-16 shrink-0 border-r bg-sidebar md:w-80" />}>
          <ProjectSidebar />
        </Suspense>
      ) : null}
      <section className="min-w-0 flex-1 overflow-hidden">{children}</section>
    </main>
  );
}
