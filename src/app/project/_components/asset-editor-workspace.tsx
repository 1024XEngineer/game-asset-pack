"use client";

import {
  ArrowLeft,
  Check,
  History,
  ImagePlus,
  Pencil,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import type { AssetHistoryEntry } from "../_data/project-demo-data";
import { assetGroups, projectSummaries } from "../_data/project-demo-data";
import { AssetKindIcon } from "./asset-kind-icon";
import { AssetPreview } from "./asset-preview";
import { HistoryDeleteDialog } from "./history-delete-dialog";
import { useAssetHistory } from "./use-asset-history";

const EMPTY_HISTORY: AssetHistoryEntry[] = [];

export function AssetEditorWorkspace({ assetId }: { assetId: string }) {
  const searchParams = useSearchParams();
  const currentProject =
    projectSummaries.find((project) => project.id === searchParams.get("project")) ??
    projectSummaries[0];
  const group = assetGroups.find((assetGroup) =>
    assetGroup.assets.some((asset) => asset.id === assetId),
  );
  const asset = group?.assets.find((item) => item.id === assetId);
  const initialHistory = asset?.history ?? EMPTY_HISTORY;
  const { history, addHistory, restoreHistory, deleteHistory } = useAssetHistory(
    asset?.id ?? assetId,
    initialHistory,
  );
  const [selectedHistoryId, setSelectedHistoryId] = useState(
    () => searchParams.get("history") ?? "",
  );
  const [description, setDescription] = useState("");
  const [outputSize, setOutputSize] = useState(asset?.canvasSize ?? "32 × 32 px");
  const [customSize, setCustomSize] = useState(false);
  const [removeBackground, setRemoveBackground] = useState(true);
  const [referenceImageCount, setReferenceImageCount] = useState(0);
  const [styleImageName, setStyleImageName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AssetHistoryEntry | null>(null);

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
  const detailHref = `/project/assets/${asset.id}?project=${encodeURIComponent(currentProject.id)}`;

  const handleEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextDescription = description.trim();
    if (!nextDescription) {
      return;
    }

    const newHistoryId = addHistory(nextDescription);
    setSelectedHistoryId(newHistoryId);
    setStatusMessage("The edit was saved as a new current version.");
    setDescription("");
  };

  const handleRestore = () => {
    restoreHistory(selectedHistory.id);
    setStatusMessage(`${selectedHistory.version} is now the current version.`);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 p-3 sm:p-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            render={<Link href={detailHref} />}
            nativeButton={false}
            variant="outline"
            size="icon-lg"
            aria-label={`Back to ${asset.name}`}
          >
            <ArrowLeft />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AssetKindIcon kind={group.kind} className="size-3.5" />
              {group.title}
              <span aria-hidden="true">·</span>
              {currentProject.name}
            </div>
            <h1 className="truncate text-lg font-semibold">Editor · {asset.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{selectedHistory.version}</Badge>
          {selectedHistory.isCurrent ? <Badge variant="secondary">Current</Badge> : null}
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto xl:grid-cols-[22rem_minmax(0,1fr)_20rem] xl:overflow-hidden">
        <Card className="min-h-[38rem] py-0 xl:min-h-0">
          <ScrollArea className="h-full">
            <form id="asset-editor-form" className="space-y-6 p-5" onSubmit={handleEdit}>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tool</p>
                <div className="mt-2 rounded-xl border bg-muted/50 p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-background shadow-sm">
                      <Pencil className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">Edit asset</span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        Create a new version from {selectedHistory.version}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <label className="grid gap-2 text-sm font-medium">
                Description <span className="text-destructive">*</span>
                <textarea
                  required
                  className="min-h-32 w-full resize-y rounded-xl border border-input bg-background px-3 py-3 text-sm leading-6 outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  placeholder="Describe the changes you want to make..."
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    setStatusMessage("");
                  }}
                />
                <span className="font-normal leading-5 text-muted-foreground">
                  Be specific about pose, shape, colors, and details.
                </span>
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Output size
                <select
                  className="h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={outputSize}
                  onChange={(event) => setOutputSize(event.target.value)}
                >
                  <option>16 × 16 px</option>
                  <option>32 × 32 px</option>
                  <option>64 × 64 px</option>
                  <option>128 × 128 px</option>
                </select>
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={customSize}
                  className="size-4 rounded border-input accent-primary"
                  onChange={(event) => setCustomSize(event.target.checked)}
                />
                Custom size
              </label>
              <p className="-mt-4 text-xs text-muted-foreground">
                {outputSize.replaceAll(" ", "")} · 1×1 · 1 image
              </p>

              <UploadField
                title="Reference images (optional)"
                description={`Upload up to 4 images (${referenceImageCount}/4) to guide composition and details.`}
                accept="image/*"
                multiple
                detail="Auto-scaled to max 1024×1024"
                onFiles={(files) => setReferenceImageCount(Math.min(files.length, 4))}
              />

              <UploadField
                title="Style image (optional)"
                description="Upload a pixel art image to guide the visual style."
                accept="image/*"
                detail={styleImageName || "Max 256×256"}
                onFiles={(files) => setStyleImageName(files[0]?.name ?? "")}
              />

              <label className="flex items-start gap-3 rounded-xl border bg-muted/30 p-3">
                <input
                  type="checkbox"
                  checked={removeBackground}
                  className="mt-0.5 size-4 rounded border-input accent-primary"
                  onChange={(event) => setRemoveBackground(event.target.checked)}
                />
                <span>
                  <span className="block text-sm font-medium">Remove background</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    Process the edited asset through background removal.
                  </span>
                </span>
              </label>

              <Button type="submit" size="lg" className="h-11 w-full">
                <Pencil data-icon="inline-start" />
                Apply edit
              </Button>
            </form>
          </ScrollArea>
        </Card>

        <Card className="relative min-h-[32rem] py-0 xl:min-h-0">
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
            <Badge variant="outline" className="bg-background/90">
              {selectedHistory.version}
            </Badge>
            {!selectedHistory.isCurrent ? (
              <Badge variant="secondary" className="bg-background/90">
                Historical version
              </Badge>
            ) : null}
          </div>

          <div className="grid h-full min-h-[32rem] place-items-center p-8 xl:min-h-0">
            <AssetPreview
              accentClassName={group.accentClassName}
              className="aspect-square w-full max-w-md overflow-hidden rounded-2xl border shadow-sm"
            />
          </div>

          <div className="absolute inset-x-4 bottom-4 rounded-xl border bg-background/95 p-3 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{selectedHistory.description}</p>
                {statusMessage ? (
                  <p className="mt-1 text-xs text-muted-foreground" role="status">
                    {statusMessage}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={selectedHistory.isCurrent}
                onClick={handleRestore}
              >
                {selectedHistory.isCurrent ? (
                  <Check data-icon="inline-start" />
                ) : (
                  <RotateCcw data-icon="inline-start" />
                )}
                {selectedHistory.isCurrent ? "Current version" : "Restore this version"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="min-h-[32rem] py-0 xl:min-h-0">
          <div className="flex items-center gap-2 border-b p-4">
            <History className="size-4 text-muted-foreground" />
            <h2 className="font-semibold">History</h2>
            <Badge variant="secondary">{history.length}</Badge>
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-2 p-3">
              {history.map((entry) => {
                const isSelected = entry.id === selectedHistory.id;

                return (
                  <div
                    key={entry.id}
                    className={cn(
                      "group/editor-history relative overflow-hidden rounded-xl border bg-card",
                      isSelected ? "border-foreground ring-1 ring-foreground" : "border-border",
                    )}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 p-2 pr-10 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      onClick={() => {
                        setSelectedHistoryId(entry.id);
                        setStatusMessage("");
                      }}
                    >
                      <AssetPreview
                        accentClassName={group.accentClassName}
                        className="size-16 shrink-0 overflow-hidden rounded-lg border"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          {entry.version}
                          {entry.isCurrent ? <Check className="size-3.5" /> : null}
                        </span>
                        <span className="mt-1 block truncate text-xs text-muted-foreground">
                          {entry.isCurrent ? "Current" : entry.description}
                        </span>
                      </span>
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="absolute right-2 top-2 opacity-100 sm:opacity-0 sm:group-hover/editor-history:opacity-100 sm:group-focus-within/editor-history:opacity-100"
                      aria-label={`Delete ${entry.version}`}
                      disabled={history.length <= 1}
                      onClick={() => setDeleteTarget(entry)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </Card>
      </div>

      <HistoryDeleteDialog
        entry={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteHistory}
      />
    </div>
  );
}

function UploadField({
  title,
  description,
  accept,
  multiple = false,
  detail,
  onFiles,
}: {
  title: string;
  description: string;
  accept: string;
  multiple?: boolean;
  detail: string;
  onFiles: (files: File[]) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
      <label className="mt-3 grid min-h-36 cursor-pointer place-items-center rounded-xl border border-dashed bg-muted/20 p-4 text-center transition-colors hover:bg-muted/50">
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(event) => onFiles(Array.from(event.target.files ?? []))}
        />
        <span>
          {multiple ? (
            <ImagePlus className="mx-auto size-7 text-muted-foreground" />
          ) : (
            <Upload className="mx-auto size-7 text-muted-foreground" />
          )}
          <span className="mt-3 block text-sm font-medium">Click to upload</span>
          <span className="mt-1 block text-xs text-muted-foreground">{detail}</span>
        </span>
      </label>
    </div>
  );
}
