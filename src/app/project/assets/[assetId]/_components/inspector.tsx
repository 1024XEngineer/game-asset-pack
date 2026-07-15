import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { nodeMeta, type NodeId } from "../_data/asset-demo-data";

type InspectorProps = {
  selectedNodes: NodeId[];
  selectedFrames: Array<{ node: NodeId; index: number }>;
  prompt: string;
  onPromptChange: (value: string) => void;
  onAction: (message: string) => void;
};

export function Inspector({
  selectedNodes,
  selectedFrames,
  prompt,
  onPromptChange,
  onAction,
}: InspectorProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-t border-black/10 bg-[#ffffff] lg:w-[18rem] lg:border-l lg:border-t-0">
      <ScrollArea className="max-h-[24rem] flex-1 lg:max-h-none">
        <div className="p-4">
          <SelectionSummary selectedNodes={selectedNodes} selectedFrames={selectedFrames} />
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
      </ScrollArea>
    </aside>
  );
}

function SelectionSummary({
  selectedNodes,
  selectedFrames,
}: {
  selectedNodes: NodeId[];
  selectedFrames: Array<{ node: NodeId; index: number }>;
}) {
  const frameGroups = selectedFrames.reduce<Record<string, number[]>>((groups, selection) => {
    groups[selection.node] = [...(groups[selection.node] ?? []), selection.index + 1];
    return groups;
  }, {});
  const summary = selectedNodes.length
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
