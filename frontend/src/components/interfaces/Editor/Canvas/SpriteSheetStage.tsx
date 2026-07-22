type SpriteSheetStageProps = {
  selectedItems: string[];
  selectedTiles: string[];
  onToggleTile: (tile: string) => void;
};

const GRID_SIZE = 8;

const ITEM_CELLS: Record<string, number[]> = {
  Bed: [9, 10, 17, 18],
  "Street lamp": [5, 13, 21],
  "Street fence": [32, 33, 34, 35],
  Object: [27],
};

const ITEM_TILE_CELLS: Record<string, number[][]> = {
  Bed: [[9], [10], [17], [18]],
  "Street lamp": [[5], [13], [21]],
  "Street fence": [[32], [33], [34], [35]],
  Object: [[27]],
};

export function SpriteSheetStage({
  selectedItems,
  selectedTiles,
  onToggleTile,
}: SpriteSheetStageProps) {
  const highlightedCells = new Set([
    ...selectedItems.flatMap((item) => ITEM_CELLS[item] ?? []),
    ...selectedTiles.flatMap((tile) => {
      const separator = tile.lastIndexOf(":");
      const item = tile.slice(0, separator);
      const tileIndex = Number(tile.slice(separator + 1));
      if (item === "Canvas") return [tileIndex];
      return ITEM_TILE_CELLS[item]?.[tileIndex] ?? [];
    }),
  ]);
  const hasSelection = highlightedCells.size > 0;

  return (
    <main className="min-h-0 min-w-0 flex-1 overflow-hidden bg-[#eeece7] p-6 lg:p-8">
      <div className="flex h-full min-h-[36rem] flex-col gap-4">
        <section
          aria-label="Tileset canvas"
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="grid min-h-0 flex-1 grid-cols-8 grid-rows-8 gap-1">
            {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
              const mappedTile = Object.entries(ITEM_TILE_CELLS).find(
                ([, tiles]) => tiles.some((cells) => cells.includes(index)),
              );
              const mappedTileIndex = mappedTile?.[1].findIndex((cells) =>
                cells.includes(index),
              );
              const tileId = mappedTile
                ? `${mappedTile[0]}:${mappedTileIndex}`
                : `Canvas:${index}`;

              return (
                <button
                  key={index}
                  type="button"
                  aria-label={`Tile ${index + 1}`}
                  aria-pressed={highlightedCells.has(index)}
                  onClick={() => onToggleTile(tileId)}
                  className={`relative overflow-hidden rounded-sm border bg-[#b5ce9c] transition-all duration-200 ${highlightedCells.has(index) ? "z-10 border-[#b86b70] ring-2 ring-inset ring-[#b86b70]/60" : hasSelection ? "border-black/5 opacity-35 hover:opacity-70" : "border-black/10 hover:border-[#b86b70]/60"}`}
                >
                  <span
                    className={`absolute inset-[18%] rounded ${index % 4 === 0 ? "bg-[#6f9b6b]" : "bg-[#d9b078]"}`}
                  />
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
