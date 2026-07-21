import { createContext, useContext, useMemo, useState } from "react";

import type { CreationRequest, GenerationRun } from "@/modules/generation/model";

type GenerationStoreValue = {
  runs: GenerationRun[];
  enqueueRun: (request: CreationRequest) => void;
};

const GenerationStoreContext = createContext<GenerationStoreValue | null>(null);

export function GenerationStoreProvider({ children }: { children: React.ReactNode }) {
  const [runs, setRuns] = useState<GenerationRun[]>([]);
  const value = useMemo<GenerationStoreValue>(
    () => ({
      runs,
      enqueueRun: (request) =>
        setRuns((current) => [...current, { ...request, id: crypto.randomUUID(), status: "queued" }]),
    }),
    [runs],
  );

  return <GenerationStoreContext value={value}>{children}</GenerationStoreContext>;
}

export function useGenerationStore() {
  const value = useContext(GenerationStoreContext);
  if (!value) throw new Error("useGenerationStore must be used within GenerationStoreProvider");
  return value;
}
