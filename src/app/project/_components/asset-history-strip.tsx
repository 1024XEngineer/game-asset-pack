"use client";

import { History } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";

import type { AssetHistoryEntry } from "../_data/project-demo-data";
import { AssetHistoryItem } from "./asset-history-item";
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
            <AssetHistoryItem
              key={entry.id}
              entry={entry}
              isSelected={isSelected}
              accentClassName={accentClassName}
              deleteDisabled={history.length <= 1}
              onSelect={() => onSelect(entry.id)}
              onDelete={() => setDeleteTarget(entry)}
            />
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
