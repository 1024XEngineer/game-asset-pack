"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { assetGroups, projectSummaries } from "../../../_data/project-demo-data";
import { defaultEditorPrompt, type NodeId } from "../_data/asset-demo-data";
import { EditorStage } from "./canvas";
import { EditorHeader } from "./header";
import { Inspector } from "./inspector";
import { AssetTree } from "./tree";

export function Workspace({ assetId }: { assetId: string }) {
  const searchParams = useSearchParams();
  const currentProject =
    projectSummaries.find((project) => project.id === searchParams.get("project")) ??
    projectSummaries[0];
  const group = assetGroups.find((assetGroup) =>
    assetGroup.assets.some((asset) => asset.id === assetId),
  );
  const asset = group?.assets.find((item) => item.id === assetId);

  const [selectedNode, setSelectedNode] = useState<NodeId | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<NodeId[]>([]);
  const [selectedFrames, setSelectedFrames] = useState<Array<{ node: NodeId; index: number }>>([]);
  const [status, setStatus] = useState("All changes saved");
  const [canUndo, setCanUndo] = useState(true);
  const [canRedo, setCanRedo] = useState(false);
  const [prompt, setPrompt] = useState(defaultEditorPrompt);

  if (!group || !asset) {
    return (
      <div className="grid h-full place-items-center bg-[#f7f5f0] px-6 text-[#2d2923]">
        <div className="text-center">
          <p className="font-serif text-2xl">Asset not found</p>
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

  const detailHref = `/project?project=${encodeURIComponent(currentProject.id)}`;
  const handleAction = (message: string) => {
    setStatus(message);
    window.setTimeout(() => setStatus("All changes saved"), 2200);
  };
  const handleSelectNode = (node: NodeId) => {
    setSelectedNode(node);
    setSelectedNodes([node]);
    setSelectedFrames([]);
  };
  const handleSelectFrame = (node: NodeId, index: number) => {
    setSelectedNode(node);
    setSelectedNodes([node]);
    setSelectedFrames([{ node, index }]);
  };
  const handleSelectFrames = (node: NodeId, indexes: number[]) => {
    setSelectedNode(node);
    setSelectedNodes([node]);
    setSelectedFrames(indexes.map((index) => ({ node, index })));
  };
  const handleSelectNodes = (nodes: NodeId[]) => {
    setSelectedNodes(nodes);
    setSelectedNode(nodes[0] ?? null);
    setSelectedFrames([]);
  };

  return (
    <div className="asset-workspace-shell flex h-full min-h-0 flex-col overflow-hidden bg-[#f7f5f0] text-[#2d2923] selection:bg-[#d99096] selection:text-[#2d2923]">
      <EditorHeader
        assetName={asset.name}
        version={asset.version}
        projectName={currentProject.name}
        detailHref={detailHref}
        status={status}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => {
          setCanUndo(false);
          setCanRedo(true);
          handleAction("Last edit reverted");
        }}
        onRedo={() => {
          setCanUndo(true);
          setCanRedo(false);
          handleAction("Edit restored");
        }}
        onSave={() => handleAction("Saved just now")}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <AssetTree
          selectedNode={selectedNode}
          selectedFrames={selectedFrames}
          onSelect={handleSelectNode}
          onSelectFrame={handleSelectFrame}
        />
        <EditorStage
          selectedNodes={selectedNodes}
          selectedFrames={selectedFrames}
          onSelect={handleSelectNode}
          onSelectFrame={handleSelectFrame}
          onSelectFrames={handleSelectFrames}
          onSelectNodes={handleSelectNodes}
          onClearSelection={() => {
            setSelectedNode(null);
            setSelectedNodes([]);
            setSelectedFrames([]);
          }}
        />
        <Inspector
          selectedNodes={selectedNodes}
          selectedFrames={selectedFrames}
          prompt={prompt}
          onPromptChange={setPrompt}
          onAction={handleAction}
        />
      </div>
    </div>
  );
}
