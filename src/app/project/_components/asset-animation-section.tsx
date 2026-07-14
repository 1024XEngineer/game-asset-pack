import { Film, Plus, Rocket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import type { AssetAnimation } from "../_data/project-demo-data";

export function AssetAnimationSection({ animations }: { animations: AssetAnimation[] }) {
  return (
    <section aria-labelledby="asset-animations-heading">
      <div className="mb-4 flex items-center gap-2">
        <Film className="size-5 text-muted-foreground" />
        <h2 id="asset-animations-heading" className="text-xl font-semibold tracking-tight">
          Animations
        </h2>
        <Badge variant="secondary">{animations.length}</Badge>
      </div>

      {animations.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {animations.map((animation) => (
            <Card key={animation.id} className="p-4">
              <p className="font-medium">{animation.name}</p>
              <p className="text-sm text-muted-foreground">{animation.frameCount} frames</p>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="grid min-h-64 place-items-center border-dashed px-6 text-center shadow-none">
          <div>
            <Rocket className="mx-auto size-9 text-muted-foreground" />
            <p className="mt-4 font-medium">No animations yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Animation creation is not available in this demo yet.
            </p>
            <Button className="mt-5" variant="outline" disabled>
              <Plus data-icon="inline-start" />
              Add animation · Coming soon
            </Button>
          </div>
        </Card>
      )}
    </section>
  );
}
