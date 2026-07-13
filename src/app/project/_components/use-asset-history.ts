"use client";

import { useCallback, useEffect, useState } from "react";

import type { AssetHistoryEntry } from "../_data/project-demo-data";

const HISTORY_STORAGE_PREFIX = "game-asset-pack:asset-history:";

export function useAssetHistory(assetId: string, initialHistory: AssetHistoryEntry[]) {
  const [history, setHistory] = useState<AssetHistoryEntry[]>(initialHistory);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(`${HISTORY_STORAGE_PREFIX}${assetId}`);

      if (!storedHistory) {
        setHistory(initialHistory);
        return;
      }

      const parsedHistory = JSON.parse(storedHistory) as AssetHistoryEntry[];
      setHistory(
        Array.isArray(parsedHistory) && parsedHistory.length > 0 ? parsedHistory : initialHistory,
      );
    } catch {
      setHistory(initialHistory);
    }
  }, [assetId, initialHistory]);

  const updateHistory = useCallback(
    (updater: (current: AssetHistoryEntry[]) => AssetHistoryEntry[]) => {
      setHistory((current) => {
        const next = updater(current);

        try {
          localStorage.setItem(`${HISTORY_STORAGE_PREFIX}${assetId}`, JSON.stringify(next));
        } catch {
          // Keep the current browser session functional when storage is unavailable.
        }

        return next;
      });
    },
    [assetId],
  );

  const restoreHistory = useCallback(
    (historyId: string) => {
      updateHistory((current) =>
        current.map((entry) => ({ ...entry, isCurrent: entry.id === historyId })),
      );
    },
    [updateHistory],
  );

  const deleteHistory = useCallback(
    (historyId: string) => {
      updateHistory((current) => {
        if (current.length <= 1) {
          return current;
        }

        const deletedEntry = current.find((entry) => entry.id === historyId);
        const remaining = current.filter((entry) => entry.id !== historyId);

        if (deletedEntry?.isCurrent && remaining.length > 0) {
          return remaining.map((entry, index) => ({ ...entry, isCurrent: index === 0 }));
        }

        return remaining;
      });
    },
    [updateHistory],
  );

  const addHistory = useCallback(
    (description: string) => {
      const historyId = `${assetId}-history-edit-${Date.now()}`;

      updateHistory((current) => {
        const highestVersion = current.reduce((highest, entry) => {
          const versionNumber = Number.parseInt(entry.version.replace("v", ""), 10);
          return Number.isNaN(versionNumber) ? highest : Math.max(highest, versionNumber);
        }, 0);

        const nextEntry: AssetHistoryEntry = {
          id: historyId,
          version: `v${highestVersion + 1}`,
          description,
          status: "ready",
          isCurrent: true,
        };

        return [nextEntry, ...current.map((entry) => ({ ...entry, isCurrent: false }))];
      });

      return historyId;
    },
    [assetId, updateHistory],
  );

  return { history, restoreHistory, deleteHistory, addHistory };
}
