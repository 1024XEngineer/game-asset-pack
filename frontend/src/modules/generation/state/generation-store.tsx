import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type {
  CreationRequest,
  GenerationRun,
} from "@/modules/generation/model";

type GenerationStoreValue = {
  runs: GenerationRun[];
  enqueueRun: (projectId: string, request: CreationRequest) => void;
};

const GenerationStoreContext = createContext<GenerationStoreValue | null>(null);

export function GenerationStoreProvider({
  children,
  executeRun,
}: {
  children: React.ReactNode;
  executeRun: (run: GenerationRun) => Promise<void>;
}) {
  const [runs, setRuns] = useState<GenerationRun[]>([]);

  const processRun = useCallback(
    async (run: GenerationRun) => {
      setRuns((current) =>
        current.map((item) =>
          item.id === run.id ? { ...item, status: "processing" } : item,
        ),
      );

      try {
        await executeRun(run);
        setRuns((current) => current.filter((item) => item.id !== run.id));
      } catch {
        setRuns((current) =>
          current.map((item) =>
            item.id === run.id ? { ...item, status: "failed" } : item,
          ),
        );
      }
    },
    [executeRun],
  );

  const enqueueRun = useCallback(
    (projectId: string, request: CreationRequest) => {
      const run: GenerationRun = {
        ...request,
        id: crypto.randomUUID(),
        projectId,
        status: "queued",
      };

      setRuns((current) => [...current, run]);
      void processRun(run);
    },
    [processRun],
  );

  const value = useMemo<GenerationStoreValue>(
    () => ({
      runs,
      enqueueRun,
    }),
    [enqueueRun, runs],
  );

  return (
    <GenerationStoreContext value={value}>{children}</GenerationStoreContext>
  );
}

export function useGenerationStore() {
  const value = useContext(GenerationStoreContext);
  if (!value)
    throw new Error(
      "useGenerationStore must be used within GenerationStoreProvider",
    );
  return value;
}
