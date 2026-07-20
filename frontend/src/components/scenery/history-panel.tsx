"use client";

import { Clock3, History, RotateCcw, RotateCw } from "lucide-react";

import { useSceneryStore } from "@/stores/scenery-store";

export function HistoryPanel() {
  const undoStack = useSceneryStore((state) => state.undoStack);
  const redoStack = useSceneryStore((state) => state.redoStack);
  const activity = useSceneryStore((state) => state.activity);
  const undo = useSceneryStore((state) => state.undo);
  const redo = useSceneryStore((state) => state.redo);

  return (
    <div className="inspector-content history-content">
      <section className="history-summary">
        <div><History size={18} /><span><strong>Editing history</strong><small>Up to 50 scene snapshots</small></span></div>
        <div className="history-buttons">
          <button type="button" className="button secondary" disabled={!undoStack.length} onClick={() => void undo()}><RotateCcw size={15} /> Undo</button>
          <button type="button" className="button secondary" disabled={!redoStack.length} onClick={() => void redo()}><RotateCw size={15} /> Redo</button>
        </div>
      </section>

      <section className="history-list-section">
        <div className="section-heading"><div><Clock3 size={15} /><strong>Recent activity</strong></div></div>
        {activity.length ? (
          <ol className="history-list">
            {activity.map((item, index) => (
              <li key={`${item}-${index}`}><i /><span><strong>{item}</strong><small>{index === 0 ? "Just now" : "Earlier this session"}</small></span></li>
            ))}
          </ol>
        ) : (
          <div className="empty-history">Generated layers, saves and deletions will appear here.</div>
        )}
      </section>

      <section className="history-note">
        Undo and redo restore Layer transforms and ordering. Generated image files remain available after undo.
      </section>
    </div>
  );
}

