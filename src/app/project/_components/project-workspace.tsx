import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { assetGroups, createAssetKinds, projectSummaries } from "../_data/project-demo-data";
import { AssetSection, AssetSummaryCard } from "./asset-section";
import { CreateAssetToolbar } from "./create-asset-toolbar";
import { ProjectSidebar } from "./project-sidebar";

export function ProjectWorkspace() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-1 bg-muted/30">
      <ProjectSidebar projects={projectSummaries} />

      <section className="min-w-0 flex-1 overflow-hidden">
        <div className="bg-background/95 px-5 py-4 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Current Project
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                Moonlit Orchard
              </h1>
            </div>
            <CreateAssetToolbar assetKinds={createAssetKinds} />
          </div>
        </div>
        <Separator />

        <ScrollArea className="h-[calc(100vh-8.25rem)]">
          <div className="space-y-5 px-5 py-5">
            <div className="grid gap-3 lg:grid-cols-3">
              {assetGroups.map((group) => (
                <AssetSummaryCard key={group.kind} group={group} />
              ))}
            </div>
            {assetGroups.map((group) => (
              <AssetSection key={group.kind} group={group} />
            ))}
          </div>
        </ScrollArea>
      </section>
    </main>
  );
}
