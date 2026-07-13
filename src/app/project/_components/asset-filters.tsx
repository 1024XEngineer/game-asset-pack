import { Funnel, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import type { AssetKind } from "../_data/project-demo-data";
import { AssetKindIcon } from "./asset-kind-icon";

const filters: { label: string; value: AssetKind }[] = [
  { label: "Character", value: "character" },
  { label: "Object", value: "object" },
  { label: "Tiles", value: "tiles" },
];

export function AssetFilters({
  query,
  selectedKinds,
  onQueryChange,
  onSelectedKindsChange,
}: {
  query: string;
  selectedKinds: AssetKind[];
  onQueryChange: (query: string) => void;
  onSelectedKindsChange: (kinds: AssetKind[]) => void;
}) {
  const toggleKind = (kind: AssetKind, isSelected: boolean) => {
    onSelectedKindsChange(
      isSelected
        ? [...selectedKinds, kind]
        : selectedKinds.filter((selectedKind) => selectedKind !== kind),
    );
  };

  const activeFilterCount = (query.trim() ? 1 : 0) + (filters.length - selectedKinds.length);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label="Search and filter assets"
            size="icon-lg"
            variant="outline"
            className="relative size-12 rounded-full bg-card shadow-sm"
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
      <DropdownMenuContent align="end" className="w-72">
        <div className="p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search assets"
              className="bg-background pl-9"
              placeholder="Search assets"
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              onKeyDown={(event) => event.stopPropagation()}
            />
          </div>
        </div>
        <DropdownMenuSeparator />
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
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                onQueryChange("");
                onSelectedKindsChange(filters.map((filter) => filter.value));
              }}
            >
              <X data-icon="inline-start" />
              Clear filters
            </Button>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
