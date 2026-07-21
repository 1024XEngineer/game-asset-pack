import { Funnel, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { AssetKind } from "../_data/project-demo-data";
import { AssetKindIcon } from "./asset-kind-icon";

const filters: { label: string; value: AssetKind }[] = [
  { label: "Character", value: "character" },
  { label: "Object", value: "object" },
  { label: "Tiles", value: "tiles" },
];

export function AssetFilters({
  selectedKinds,
  onSelectedKindsChange,
}: {
  selectedKinds: AssetKind[];
  onSelectedKindsChange: (kinds: AssetKind[]) => void;
}) {
  const toggleKind = (kind: AssetKind, isSelected: boolean) => {
    onSelectedKindsChange(
      isSelected
        ? [...selectedKinds, kind]
        : selectedKinds.filter((selectedKind) => selectedKind !== kind),
    );
  };

  const activeFilterCount = filters.filter(
    (filter) => !selectedKinds.includes(filter.value),
  ).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label="Search and filter assets"
            size="icon"
            variant="outline"
            className="relative size-12 rounded-2xl bg-background shadow-none"
          />
        }
      >
        <Funnel />
        {activeFilterCount > 0 ? (
          <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[0.65rem] text-primary-foreground">
            {activeFilterCount}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Asset type</DropdownMenuLabel>
          {filters.map((filter) => (
            <DropdownMenuCheckboxItem
              key={filter.value}
              checked={selectedKinds.includes(filter.value)}
              closeOnClick={false}
              onCheckedChange={(checked) => toggleKind(filter.value, checked)}
            >
              <AssetKindIcon kind={filter.value} />
              {filter.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        {activeFilterCount > 0 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                onSelectedKindsChange([...filters.map((filter) => filter.value), "scenery"]);
              }}
            >
              <X />
              Clear filters
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
