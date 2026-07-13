import { Suspense } from "react";

import { NewProjectWorkspace } from "../_components/new-project-workspace";

export default function NewProjectPage() {
  return (
    <Suspense>
      <NewProjectWorkspace />
    </Suspense>
  );
}
