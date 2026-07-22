import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { useCallback, useState } from "react";

import {
  assetGroupsByProject,
  projectSummaries,
} from "@/adapters/mock-core-api/project-demo-data";
import { completeMockGeneration } from "@/adapters/mock-core-api/generation";
import type { router as appRouter } from "@/app/router";
import { AssetLibraryStoreProvider } from "@/modules/asset/library/state/asset-library-store";
import { useAssetLibraryStore } from "@/modules/asset/library/state/asset-library-store";
import type { GenerationRun } from "@/modules/generation/model";
import { GenerationStoreProvider } from "@/modules/generation/state/generation-store";
import { ProjectStoreProvider } from "@/modules/project/state/project-store";

export function AppProviders({ router }: { router: typeof appRouter }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ProjectStoreProvider initialProjects={projectSummaries}>
        <AssetLibraryStoreProvider
          initialAssetGroupsByProject={assetGroupsByProject}
        >
          <MockGenerationProvider>
            <RouterProvider router={router} />
          </MockGenerationProvider>
        </AssetLibraryStoreProvider>
      </ProjectStoreProvider>
    </QueryClientProvider>
  );
}

function MockGenerationProvider({ children }: { children: React.ReactNode }) {
  const { addAsset } = useAssetLibraryStore();
  const executeRun = useCallback(
    async (run: GenerationRun) => {
      const generatedAsset = await completeMockGeneration(run);
      addAsset(run.projectId, generatedAsset.kind, generatedAsset.asset);
    },
    [addAsset],
  );

  return (
    <GenerationStoreProvider executeRun={executeRun}>
      {children}
    </GenerationStoreProvider>
  );
}
