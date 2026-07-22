import { History, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { nodeMeta, type NodeId } from "@/states/editor";

type InspectorProps = {
  selectedNodes: NodeId[];
  selectedFrames: Array<{ node: NodeId; index: number }>;
  prompt: string;
  onPromptChange: (value: string) => void;
  onAction: (message: string) => void;
  saveHistory: SaveHistoryEntry[];
  selectedItems?: string[];
};

export type SaveHistoryEntry = {
  id: string;
  savedAt: string;
  description: string;
  selection: string;
};

export function Inspector({
  selectedNodes,
  selectedFrames,
  prompt,
  onPromptChange,
  onAction,
  saveHistory,
  selectedItems,
}: InspectorProps) {
  const [activeTab, setActiveTab] = useState<"ai-edit" | "history">("ai-edit");

  return (
    <aside className="flex w-full shrink-0 flex-col border-t border-black/10 bg-[#ffffff] lg:w-[18rem] lg:border-l lg:border-t-0">
      <ScrollArea className="max-h-[24rem] flex-1 lg:max-h-none">
        <div
          aria-label="Inspector sections"
          className="flex border-b border-black/10"
          role="tablist"
        >
          <InspectorTab
            active={activeTab === "ai-edit"}
            id="ai-edit"
            label="AI Edit"
            onClick={() => setActiveTab("ai-edit")}
          />
          <InspectorTab
            active={activeTab === "history"}
            id="history"
            label="History"
            onClick={() => setActiveTab("history")}
          />
        </div>
        <div className="p-4">
          {activeTab === "ai-edit" ? (
            <div role="tabpanel" aria-labelledby="ai-edit-tab" id="ai-edit-panel">
              <SelectionSummary
                selectedNodes={selectedNodes}
                selectedFrames={selectedFrames}
                selectedItems={selectedItems}
              />
              <label className="grid gap-2 text-sm font-medium text-[#51493f]">
                Description
                <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#ffffff] shadow-sm focus-within:ring-3 focus-within:ring-[#b86b70]/25">
                  <textarea
                    autoFocus
                    className="min-h-44 w-full resize-none bg-transparent px-4 py-3 text-sm leading-6 text-[#403a32] outline-none placeholder:text-[#81786d]"
                    placeholder="Describe how you want to update this asset..."
                    value={prompt}
                    onChange={(event) => onPromptChange(event.target.value)}
                  />
                  <div className="flex justify-end p-3 pt-0">
                    <Button disabled={!prompt.trim()} onClick={() => onAction("Generation queued")}>
                      <Sparkles />
                      Generate asset
                    </Button>
                  </div>
                </div>
              </label>
            </div>
          ) : (
            <SaveHistory entries={saveHistory} />
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}

function InspectorTab({
  active,
  id,
  label,
  onClick,
}: {
  active: boolean;
  id: "ai-edit" | "history";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      id={`${id}-tab`}
      role="tab"
      aria-selected={active}
      aria-controls={`${id}-panel`}
      onClick={onClick}
      className={`relative flex-1 px-2.5 py-2 text-center text-xs font-semibold transition-colors ${active ? "text-[#2d2923]" : "text-[#81786d] hover:text-[#51493f]"}`}
    >
      {label}
      <span
        className={`absolute inset-x-0 bottom-0 h-0.5 transition-colors ${active ? "bg-[#b86b70]" : "bg-transparent"}`}
      />
    </button>
  );
}

function SaveHistory({ entries }: { entries: SaveHistoryEntry[] }) {
  return (
    <section role="tabpanel" aria-labelledby="history-tab" id="history-panel">
      <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[#51493f]">
        <History className="size-4 text-[#b86b70]" />
        Save history
      </div>
      {entries.length ? (
        <ol className="space-y-2">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-xl border border-black/10 bg-black/[.02] p-3">
              <p className="text-xs font-semibold text-[#403a32]">{entry.savedAt}</p>
              <p className="mt-1 text-xs text-[#71685d]">{entry.selection}</p>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#51493f]">
                {entry.description}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <div className="rounded-xl border border-dashed border-black/15 px-3 py-8 text-center text-xs leading-5 text-[#81786d]">
          Saved versions will appear here.
        </div>
      )}
    </section>
  );
}

function SelectionSummary({
  selectedNodes,
  selectedFrames,
  selectedItems,
}: {
  selectedNodes: NodeId[];
  selectedFrames: Array<{ node: NodeId; index: number }>;
  selectedItems?: string[];
}) {
  const frameGroups = selectedFrames.reduce<Record<string, number[]>>((groups, selection) => {
    groups[selection.node] = [...(groups[selection.node] ?? []), selection.index + 1];
    return groups;
  }, {});
  const summary = selectedItems?.length
    ? selectedItems
    : selectedNodes.length
      ? selectedNodes.map((node) => {
          const frames = frameGroups[node];
          return frames?.length
            ? `${nodeMeta[node].label} · frames ${frames.join(", ")}`
            : nodeMeta[node].label;
        })
      : ["Nothing selected"];

  return (
    <section className="mb-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#81786d]">
        Selection
      </p>
      <div className="mt-2 space-y-1.5">
        {summary.map((item) => (
          <p
            key={item}
            className="rounded-md border border-black/10 bg-black/[.025] px-2.5 py-2 text-xs text-[#51493f]"
          >
            {item}
          </p>
        ))}
      </div>
    </section>
  );
}
