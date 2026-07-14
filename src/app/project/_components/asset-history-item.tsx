import { Check, LoaderCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { AssetHistoryEntry } from "../_data/project-demo-data";
import { AssetPreview } from "./asset-preview";

export function AssetHistoryItem({
  entry,
  isSelected,
  accentClassName,
  variant = "card",
  deleteDisabled,
  onSelect,
  onDelete,
}: {
  entry: AssetHistoryEntry;
  isSelected: boolean;
  accentClassName: string;
  variant?: "card" | "compact";
  deleteDisabled: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "group/history-item relative overflow-hidden rounded-xl border bg-card",
        isCompact
          ? "w-full"
          : "w-40 shrink-0 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        isSelected ? "border-foreground ring-1 ring-foreground" : "border-border",
      )}
    >
      <button
        type="button"
        aria-pressed={isSelected}
        className={cn(
          "w-full text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          isCompact && "flex items-center gap-3 p-2 pr-10",
        )}
        onClick={onSelect}
      >
        <span className={cn("relative block", isCompact && "shrink-0")}>
          <AssetPreview
            accentClassName={accentClassName}
            className={cn(
              isCompact
                ? "size-16 overflow-hidden rounded-lg border"
                : "aspect-square overflow-hidden",
            )}
          />
          {entry.status === "generating" ? (
            <span className="absolute inset-0 grid place-items-center bg-background/75">
              <LoaderCircle className="size-5 animate-spin" />
            </span>
          ) : null}
        </span>
        <span className={cn("min-w-0", isCompact ? "flex-1" : "block p-3")}>
          <span
            className={cn(
              "flex items-center gap-2 text-sm font-semibold",
              !isCompact && "justify-between",
            )}
          >
            {entry.version}
            {entry.isCurrent ? <Check className={isCompact ? "size-3.5" : "size-4"} /> : null}
          </span>
          <span className="mt-1 block truncate text-xs text-muted-foreground">
            {entry.isCurrent ? "Current" : entry.description}
          </span>
        </span>
      </button>
      <Button
        type="button"
        variant={isCompact ? "ghost" : "outline"}
        size="icon-xs"
        className={cn(
          "absolute right-2 top-2 opacity-100 sm:opacity-0 sm:group-hover/history-item:opacity-100 sm:group-focus-within/history-item:opacity-100",
          !isCompact && "bg-background/90 shadow-sm",
        )}
        aria-label={`Delete ${entry.version}`}
        disabled={deleteDisabled}
        onClick={onDelete}
      >
        <Trash2 />
      </Button>
    </div>
  );
}
