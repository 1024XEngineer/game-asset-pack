import { Funnel, Search } from "lucide-react";
import type { ReactNode } from "react";

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
  actions,
}: {
  query: string;
  selectedKinds: AssetKind[];
  onQueryChange: (query: string) => void;
  onSelectedKindsChange: (kinds: AssetKind[]) => void;
  actions?: ReactNode;
}) {
  const toggleKind = (kind: AssetKind, isSelected: boolean) => {
    onSelectedKindsChange(
      isSelected
        ? [...selectedKinds, kind]
        : selectedKinds.filter((selectedKind) => selectedKind !== kind),
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3 shadow-sm">
      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Search assets"
          className="bg-background pl-9"
          placeholder="Search assets"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button aria-label="Filter asset types" size="icon" variant="outline" />}
        >
          <Funnel />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Asset type</DropdownMenuLabel>
            <DropdownMenuSeparator />
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
        </DropdownMenuContent>
      </DropdownMenu>
      {actions ? <div className="ml-auto">{actions}</div> : null}
    </div>
  );
}
