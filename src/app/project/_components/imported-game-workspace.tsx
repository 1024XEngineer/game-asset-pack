import { CheckCircle2, Gamepad2, PackagePlus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function ImportedGameWorkspace() {
  return (
    <main className="grid min-h-[calc(100vh-3.5rem)] flex-1 place-items-center bg-muted/30 px-6">
      <div className="w-full max-w-xl rounded-2xl border bg-background p-8 text-center shadow-sm">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 />
        </span>
        <h1 className="mt-5 text-2xl font-semibold">Game ready to review</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The demo has accepted your source. In the full flow, we’ll inspect its art direction and
          suggest an asset plan before importing.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button variant="outline" render={<Link href="/project/new" />} nativeButton={false}>
            <Gamepad2 /> Import another
          </Button>
          <Button render={<Link href="/project?project=moonlit-orchard" />} nativeButton={false}>
            <PackagePlus /> Open project
          </Button>
        </div>
      </div>
    </main>
  );
}
