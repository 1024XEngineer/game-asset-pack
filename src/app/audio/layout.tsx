import { Suspense } from "react";

import { ProjectStoreProvider } from "../project/_components/project-store";
import { AudioSidebar } from "./_components/audio-sidebar";

export default function AudioLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ProjectStoreProvider>
      <main className="flex h-[calc(100vh-3.5rem)] min-h-0 flex-1 overflow-hidden bg-muted/30">
        <Suspense fallback={<div className="w-16 shrink-0 border-r bg-sidebar md:w-72" />}>
          <AudioSidebar />
        </Suspense>
        <section className="min-w-0 flex-1 overflow-hidden">{children}</section>
      </main>
    </ProjectStoreProvider>
  );
}
