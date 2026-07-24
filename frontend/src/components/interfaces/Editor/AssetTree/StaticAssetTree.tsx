import {
  BedDouble,
  ChevronDown,
  Fence,
  Grid2X2,
  LampDesk,
  PackageOpen,
} from "lucide-react";
import { useState } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";

export function StaticAssetTree({
  kind,
  selectedItems,
  selectedTiles,
  onToggleItem,
  onToggleTile,
}: {
  kind: "object" | "tiles";
  selectedItems: string[];
  selectedTiles: string[];
  onToggleItem: (item: string) => void;
  onToggleTile: (tile: string) => void;
}) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const objects =
    kind === "tiles"
      ? [
          {
            name: "Bed",
            icon: BedDouble,
            tiles: ["Headboard", "Pillow", "Blanket", "Footboard"],
          },
          {
            name: "Street lamp",
            icon: LampDesk,
            tiles: ["Lamp top", "Lamp post", "Stone base"],
          },
          {
            name: "Street fence",
            icon: Fence,
            tiles: ["Left cap", "Fence middle", "Right cap", "Corner"],
          },
        ]
      : [{ name: "Object", icon: PackageOpen, tiles: ["Base tile"] }];

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-black/10 bg-white lg:h-full lg:w-[16.5rem] lg:border-r lg:border-b-0">
      <ScrollArea className="max-h-[15rem] flex-1 lg:max-h-none">
        <div className="p-3">
          <div>
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#81786d]">
              Exportable objects
            </p>
            <div className="space-y-1">
              {objects.map((object) => {
                const Icon = object.icon;
                const expanded = expandedItems.includes(object.name);
                const selected = selectedItems.includes(object.name);

                return (
                  <div key={object.name}>
                    <div
                      className={`flex items-center rounded-lg transition-colors ${selected ? "bg-black/5 text-[#2d2923]" : "text-[#51493f] hover:bg-black/[.04]"}`}
                    >
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onToggleItem(object.name)}
                        className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left text-xs font-medium"
                      >
                        <Icon className="size-4 text-[#4c7e5e]" />
                        <span className="min-w-0 flex-1 truncate">
                          {object.name}
                        </span>
                        <span className="font-mono text-[10px] text-[#81786d]">
                          {object.tiles.length}
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label={`${expanded ? "Collapse" : "Expand"} ${object.name} tiles`}
                        aria-expanded={expanded}
                        onClick={() =>
                          setExpandedItems((current) =>
                            current.includes(object.name)
                              ? current.filter((item) => item !== object.name)
                              : [...current, object.name],
                          )
                        }
                        className="mr-1 rounded-md p-1.5 text-[#81786d] hover:bg-black/[.05]"
                      >
                        <ChevronDown
                          className={`size-3.5 transition-transform ${expanded ? "rotate-0" : "-rotate-90"}`}
                        />
                      </button>
                    </div>
                    {expanded ? (
                      <div className="ml-4 grid grid-cols-4 gap-1 border-l border-black/10 py-1 pl-2">
                        {object.tiles.map((_, index) => {
                          const tileId = `${object.name}:${index}`;
                          const tileSelected = selectedTiles.includes(tileId);

                          return (
                            <button
                              key={tileId}
                              type="button"
                              aria-label={`${object.name} tile ${index + 1}`}
                              aria-pressed={tileSelected}
                              onClick={() => onToggleTile(tileId)}
                              className={`grid aspect-square place-items-center rounded-md border transition-colors ${tileSelected ? "border-[#b86b70] bg-[#b86b70]/10 text-[#8b4e53]" : "border-black/10 text-[#6d8fbd] hover:bg-black/[.04]"}`}
                            >
                              <Grid2X2 className="size-3.5" />
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
