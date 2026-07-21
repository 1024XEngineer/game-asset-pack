import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { useState } from "react";

import {
  assetGroups,
  projectSummaries,
} from "@/adapters/mock-core-api/project-demo-data";
import type { router as appRouter } from "@/app/router";
import { AssetLibraryStoreProvider } from "@/modules/asset/library/state/asset-library-store";
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
        <AssetLibraryStoreProvider initialAssetGroups={assetGroups}>
          <GenerationStoreProvider>
            <RouterProvider router={router} />
          </GenerationStoreProvider>
        </AssetLibraryStoreProvider>
      </ProjectStoreProvider>
    </QueryClientProvider>
  );
}
