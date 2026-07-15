import { cn } from "@/lib/utils";

import { frameColors } from "../_data/asset-demo-data";

export function PixelCharacter({
  direction,
  frame = 0,
  className,
}: {
  direction: string;
  frame?: number;
  className?: string;
}) {
  const cells = Array.from({ length: 192 }, (_, index) => {
    const x = index % 12;
    const y = Math.floor(index / 12);
    const isHead = y >= 2 && y <= 5 && x >= 3 && x <= 8;
    const isHair = y >= 1 && y <= 3 && x >= 2 && x <= 9;
    const isBody = y >= 6 && y <= 11 && x >= 3 && x <= 8;
    const isScarf = y === 7 && x >= 2 && x <= 9;
    const isLeg = y >= 12 && y <= 15 && ((x >= 3 && x <= 4) || (x >= 7 && x <= 8));
    const isShadow = y === 16 && x >= 2 && x <= 9;
    let color = "transparent";
    if (isHair) color = "#5a3d32";
    if (isHead) color = "#e8aa7d";
    if (isBody) color = "#5e7892";
    if (isScarf) color = "#d58a57";
    if (isLeg) color = "#3d4a62";
    if (isShadow) color = "#735d4a55";
    if ((direction === "east" || direction === "west") && x === 3 && y === 5) color = "#2c2523";
    if (frame % 2 === 1 && y === 12 && x === 4) color = frameColors[1];
    if (frame % 3 === 2 && y === 13 && x === 8) color = frameColors[2];
    return color;
  });

  return (
    <div
      className={cn(
        "pixel-character grid h-40 w-30 grid-cols-12 grid-rows-[repeat(17,minmax(0,1fr))] gap-[2px]",
        className,
      )}
      role="img"
      aria-label="Pixel character preview"
    >
      {cells.map((color, index) => (
        <span key={index} className="rounded-[1px]" style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}
