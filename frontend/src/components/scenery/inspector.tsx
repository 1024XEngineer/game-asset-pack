"use client";

import { History, SlidersHorizontal, Sparkles } from "lucide-react";

import { GenerationPanel } from "./generation-panel";
import { HistoryPanel } from "./history-panel";
import { PropertiesPanel } from "./properties-panel";
import { useSceneryStore } from "@/stores/scenery-store";

const tabs = [
  { id: "generate" as const, label: "Generate", icon: Sparkles },
  { id: "properties" as const, label: "Properties", icon: SlidersHorizontal },
  { id: "history" as const, label: "History", icon: History },
];

export function Inspector() {
  const activeTab = useSceneryStore((state) => state.activeTab);
  const setActiveTab = useSceneryStore((state) => state.setActiveTab);

  return (
    <aside className="inspector-panel">
      <div className="inspector-tabs" role="tablist" aria-label="Inspector sections">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            className={activeTab === id ? "active" : ""}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>
      <div className="inspector-scroll">
        {activeTab === "generate" ? <GenerationPanel /> : null}
        {activeTab === "properties" ? <PropertiesPanel /> : null}
        {activeTab === "history" ? <HistoryPanel /> : null}
      </div>
    </aside>
  );
}

