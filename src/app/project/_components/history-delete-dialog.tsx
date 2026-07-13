"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { AssetHistoryEntry } from "../_data/project-demo-data";

export function HistoryDeleteDialog({
  entry,
  onClose,
  onConfirm,
}: {
  entry: AssetHistoryEntry | null;
  onClose: () => void;
  onConfirm: (historyId: string) => void;
}) {
  return (
    <Dialog open={entry !== null} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete history version?</DialogTitle>
          <DialogDescription>
            {entry
              ? `${entry.version} will be removed from this asset's history. This action cannot be undone.`
              : "This history version will be removed."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (entry) {
                onConfirm(entry.id);
              }
              onClose();
            }}
          >
            <Trash2 data-icon="inline-start" />
            Delete version
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
