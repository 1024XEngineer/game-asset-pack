import { Suspense } from "react";

import { ProjectWorkspace } from "./_components/project-workspace";

export default function ProjectPage() {
  return (
    <Suspense>
      <ProjectWorkspace />
    </Suspense>
  );
}
