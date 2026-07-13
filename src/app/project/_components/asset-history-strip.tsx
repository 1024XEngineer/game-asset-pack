"use client";

import { Check, History, LoaderCircle, Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { AssetHistoryEntry } from "../_data/project-demo-data";
import { AssetPreview } from "./asset-preview";
import { HistoryDeleteDialog } from "./history-delete-dialog";

export function AssetHistoryStrip({
  history,
  selectedHistoryId,
  accentClassName,
  onSelect,
  onDelete,
}: {
  history: AssetHistoryEntry[];
  selectedHistoryId: string;
  accentClassName: string;
  onSelect: (historyId: string) => void;
  onDelete: (historyId: string) => void;
}) {
  const [deleteTarget, setDeleteTarget] = useState<AssetHistoryEntry | null>(null);

  return (
    <section aria-labelledby="asset-history-heading">
      <div className="mb-4 flex items-center gap-2">
        <History className="size-5 text-muted-foreground" />
        <h2 id="asset-history-heading" className="text-xl font-semibold tracking-tight">
          History
        </h2>
        <Badge variant="secondary">{history.length}</Badge>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {history.map((entry) => {
          const isSelected = entry.id === selectedHistoryId;

          return (
            <div
              key={entry.id}
              className={cn(
                "group/history relative w-40 shrink-0 overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                isSelected ? "border-foreground ring-1 ring-foreground" : "border-border",
              )}
            >
              <button
                type="button"
                aria-pressed={isSelected}
                className="w-full text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                onClick={() => onSelect(entry.id)}
              >
                <span className="relative block">
                  <AssetPreview accentClassName={accentClassName} className="aspect-square" />
                  {entry.status === "generating" ? (
                    <span className="absolute inset-0 grid place-items-center bg-background/75">
                      <LoaderCircle className="size-5 animate-spin" />
                    </span>
                  ) : null}
                </span>
                <span className="block p-3">
                  <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                    {entry.version}
                    {entry.isCurrent ? <Check className="size-4" /> : null}
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">
                    {entry.isCurrent ? "Current" : entry.description}
                  </span>
                </span>
              </button>
              <Button
                type="button"
                variant="outline"
                size="icon-xs"
                className="absolute right-2 top-2 bg-background/90 opacity-100 shadow-sm sm:opacity-0 sm:group-hover/history:opacity-100 sm:group-focus-within/history:opacity-100"
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

      <HistoryDeleteDialog
        entry={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={onDelete}
      />
    </section>
  );
}
