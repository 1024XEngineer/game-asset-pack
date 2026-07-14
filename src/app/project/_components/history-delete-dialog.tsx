"use client";

import { Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
    <AlertDialog open={entry !== null} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete history version?</AlertDialogTitle>
          <AlertDialogDescription>
            {entry
              ? `${entry.version} will be removed from this asset's history. This action cannot be undone.`
              : "This history version will be removed."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
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
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
