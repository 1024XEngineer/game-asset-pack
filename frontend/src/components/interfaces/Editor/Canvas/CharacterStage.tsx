import { useEffect, useRef, useState } from "react";

import { nodeMeta } from "../Editor.constants";
import { StageLoading } from "./Loading/StageLoading";
import { CharacterStageRuntime } from "./Runtime/CharacterStageRuntime";
import type { CharacterStageProps } from "./Runtime/CharacterStage.types";

export function CharacterStage(props: CharacterStageProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<CharacterStageRuntime>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const runtime = new CharacterStageRuntime(props);
    runtimeRef.current = runtime;
    let disposed = false;
    let initialized = false;
    void runtime
      .initialize(host)
      .then(() => {
        initialized = true;
        if (disposed) {
          runtime.destroy();
          return;
        }
        setLoading(false);
      })
      .catch(() => {
        if (!disposed) setLoading(false);
      });
    return () => {
      disposed = true;
      runtimeRef.current = null;
      if (initialized) runtime.destroy();
    };
  }, []);

  useEffect(() => {
    runtimeRef.current?.syncProps(props);
  }, [props]);

  return (
    <main className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-[#eeece7]">
      <div
        ref={hostRef}
        className="size-full cursor-default data-[panning=true]:cursor-grabbing"
      />
      {loading ? <StageLoading /> : null}
      <p className="sr-only" aria-live="polite">
        {props.selectedNodes.length > 0
          ? `${props.selectedNodes.map((node) => nodeMeta[node].label).join(", ")} selected`
          : "No canvas items selected"}
      </p>
    </main>
  );
}
