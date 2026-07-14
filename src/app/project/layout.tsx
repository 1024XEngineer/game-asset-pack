import { Suspense } from "react";

import { ProjectSidebar } from "./_components/project-sidebar";
import { projectSummaries } from "./_data/project-demo-data";

export default function ProjectLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-1 overflow-hidden bg-muted/30">
      <Suspense fallback={<div className="w-16 shrink-0 border-r bg-sidebar md:w-80" />}>
        <ProjectSidebar projects={projectSummaries} />
      </Suspense>
      <section className="min-w-0 flex-1 overflow-hidden">{children}</section>
    </main>
  );
}
