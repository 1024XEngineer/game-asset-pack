"use client";

import { ArrowLeft, Download, Layers3, Pencil } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { AssetHistoryEntry } from "../_data/project-demo-data";
import { assetGroups, projectSummaries } from "../_data/project-demo-data";
import { AssetAnimationSection } from "./asset-animation-section";
import { AssetHistoryStrip } from "./asset-history-strip";
import { AssetKindIcon } from "./asset-kind-icon";
import { AssetPreview } from "./asset-preview";
import { useAssetHistory } from "./use-asset-history";

const EMPTY_HISTORY: AssetHistoryEntry[] = [];

export function AssetDetailWorkspace({ assetId }: { assetId: string }) {
  const searchParams = useSearchParams();
  const currentProject =
    projectSummaries.find((project) => project.id === searchParams.get("project")) ??
    projectSummaries[0];
  const group = assetGroups.find((assetGroup) =>
    assetGroup.assets.some((asset) => asset.id === assetId),
  );
  const asset = group?.assets.find((item) => item.id === assetId);
  const [selectedHistoryId, setSelectedHistoryId] = useState("");
  const { history, deleteHistory } = useAssetHistory(
    asset?.id ?? assetId,
    asset?.history ?? EMPTY_HISTORY,
  );

  useEffect(() => {
    setSelectedHistoryId((currentSelection) => {
      if (history.some((entry) => entry.id === currentSelection)) {
        return currentSelection;
      }

      return history.find((entry) => entry.isCurrent)?.id ?? history[0]?.id ?? "";
    });
  }, [history]);

  if (!group || !asset) {
    return (
      <div className="grid h-full place-items-center px-6">
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
      </div>
    );
  }

  const selectedHistory =
    history.find((entry) => entry.id === selectedHistoryId) ?? history[0] ?? asset.history[0];
  const editorHref = `/project/assets/${asset.id}/editor?project=${encodeURIComponent(currentProject.id)}&history=${encodeURIComponent(selectedHistory.id)}`;

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto w-full max-w-[96rem] space-y-8 px-5 py-6 sm:px-8 sm:py-8">
        <header>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              render={<Link href={`/project?project=${currentProject.id}`} />}
              nativeButton={false}
              variant="ghost"
              size="sm"
              className="-ml-2 self-start"
            >
              <ArrowLeft data-icon="inline-start" />
              Back to {currentProject.name}
            </Button>
            <div className="flex gap-2 self-start">
              <Button variant="outline">
                <Download data-icon="inline-start" />
                Export
              </Button>
              <Button render={<Link href={editorHref} />} nativeButton={false}>
                <Pencil data-icon="inline-start" />
                Editor
              </Button>
            </div>
          </div>

          <div className="mt-7">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AssetKindIcon kind={group.kind} className="size-4" />
              {group.title}
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{asset.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{selectedHistory.description}</p>
          </div>
        </header>

        <Card className="gap-0 overflow-hidden py-0 shadow-sm">
          <div className="grid lg:grid-cols-[minmax(20rem,0.85fr)_minmax(0,1.15fr)]">
            <AssetPreview
              accentClassName={group.accentClassName}
              className="aspect-[4/3] min-h-72 lg:aspect-auto lg:min-h-[24rem]"
            />
            <div className="flex flex-col justify-between p-6 sm:p-8">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-2xl font-semibold tracking-tight">{asset.name}</p>
                    <p className="mt-2 leading-6 text-muted-foreground">
                      {selectedHistory.description}
                    </p>
                  </div>
                  <Badge variant="outline">{selectedHistory.version}</Badge>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {asset.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-8 border-t pt-6">
                <div className="mb-4 flex items-center gap-2">
                  <Layers3 className="size-4 text-muted-foreground" />
                  <p className="font-medium">Attributes</p>
                </div>
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  <Attribute label="Type" value={group.title} />
                  <Attribute label="Canvas" value={asset.canvasSize} />
                  <Attribute label="Perspective" value={asset.perspective} />
                  <Attribute label="Project context" value={currentProject.name} />
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <AssetHistoryStrip
          history={history}
          selectedHistoryId={selectedHistory.id}
          accentClassName={group.accentClassName}
          onSelect={setSelectedHistoryId}
          onDelete={deleteHistory}
        />

        <AssetAnimationSection animations={asset.animations} />
      </div>
    </ScrollArea>
  );
}

function Attribute({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
