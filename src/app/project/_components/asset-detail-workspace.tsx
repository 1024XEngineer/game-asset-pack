"use client";

import {
  ArrowLeft,
  Clock3,
  Download,
  GitBranch,
  Layers3,
  MessageSquareMore,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { assetGroups, projectSummaries } from "../_data/project-demo-data";
import { AssetKindIcon } from "./asset-kind-icon";
import { AssetPreview } from "./asset-preview";
import { ProjectSidebar } from "./project-sidebar";

export function AssetDetailWorkspace({ assetId }: { assetId: string }) {
  const searchParams = useSearchParams();
  const currentProject =
    projectSummaries.find((project) => project.id === searchParams.get("project")) ??
    projectSummaries[0];
  const group = assetGroups.find((assetGroup) =>
    assetGroup.assets.some((asset) => asset.id === assetId),
  );
  const asset = group?.assets.find((item) => item.id === assetId);

  if (!group || !asset) {
    return (
      <main className="flex min-h-[calc(100vh-3.5rem)] flex-1 bg-muted/30">
        <ProjectSidebar projects={projectSummaries} />
        <section className="grid flex-1 place-items-center px-6">
          <div className="text-center">
            <p className="text-lg font-semibold">Asset not found</p>
            <Button
              render={<Link href={`/project?project=${currentProject.id}`} />}
              nativeButton={false}
              className="mt-4"
            >
              Back to project
            </Button>
          </div>
        </section>
      </main>
    );
  }

  const versions = [
    { id: asset.version, label: "Current version", detail: asset.description, current: true },
    {
      id: "v3",
      label: "Palette refinement",
      detail: "Adjusted contrast and edge cleanup",
      current: false,
    },
    { id: "v2", label: "First pass", detail: "Initial generated concept", current: false },
  ];

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-1 bg-muted/30">
      <ProjectSidebar projects={projectSummaries} />

      <section className="min-w-0 flex-1 overflow-hidden">
        <div className="bg-background/95 px-5 py-4 backdrop-blur">
          <Button
            render={<Link href={`/project?project=${currentProject.id}`} />}
            nativeButton={false}
            variant="ghost"
            size="sm"
            className="-ml-2"
          >
            <ArrowLeft data-icon="inline-start" />
            Back to {currentProject.name}
          </Button>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AssetKindIcon kind={group.kind} className="size-4" />
                {group.title}
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">{asset.name}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{asset.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download data-icon="inline-start" />
                Export
              </Button>
              <Button>
                <Sparkles data-icon="inline-start" />
                Generate variant
              </Button>
            </div>
          </div>
        </div>
        <Separator />

        <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-5">
            <Card className="overflow-hidden py-0">
              <AssetPreview accentClassName={group.accentClassName} />
              <CardContent className="flex items-center justify-between py-3">
                <span className="text-sm text-muted-foreground">{asset.description}</span>
                <Badge variant="outline">{asset.version}</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageSquareMore className="size-4 text-muted-foreground" />
                  <CardTitle>Latest session</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                  <p className="font-medium">Refine the current asset</p>
                  <p className="mt-1 leading-6 text-muted-foreground">
                    Preserve the existing silhouette and project palette. Improve readability at
                    game scale.
                  </p>
                </div>
                <Button variant="outline">
                  <MessageSquareMore data-icon="inline-start" />
                  Continue session
                </Button>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-5">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Layers3 className="size-4 text-muted-foreground" />
                  <CardTitle>Attributes</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Attribute label="Type" value={group.title} />
                <Attribute
                  label="Canvas"
                  value={group.kind === "tiles" ? "16 × 16 px" : "32 × 32 px"}
                />
                <Attribute label="Perspective" value="Top-down" />
                <Attribute label="Project context" value={currentProject.name} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <GitBranch className="size-4 text-muted-foreground" />
                  <CardTitle>Version history</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {versions.map((version) => (
                  <button
                    key={version.id}
                    className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted"
                    type="button"
                  >
                    <span className="mt-1.5 size-2 rounded-full bg-foreground/40" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="font-medium">{version.id}</span>
                        {version.current ? <Badge variant="secondary">Current</Badge> : null}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                        {version.detail}
                      </span>
                    </span>
                  </button>
                ))}
                <Button variant="ghost" size="sm" className="mt-2 w-full justify-start">
                  <Clock3 data-icon="inline-start" />
                  View all versions
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Attribute({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
