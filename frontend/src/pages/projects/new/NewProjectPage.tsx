import { useNavigate } from "@tanstack/react-router";

import { NewProjectScreen } from "@/features/Project";
import { AppHeader } from "@/components/layouts/AppHeader";
import { useCreateProjectMutation } from "@/api/project";

export function NewProjectPage() {
  const navigate = useNavigate({ from: "/projects/new" });
  const { mutateAsync: createProject } = useCreateProjectMutation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <NewProjectScreen
        onCancel={() =>
          void navigate({
            to: "/projects",
            search: { project: undefined, q: "" },
          })
        }
        onCreate={async (project) => {
          await createProject(project);
          await navigate({
            to: "/projects",
            search: { project: project.id, q: "" },
          });
        }}
      />
    </div>
  );
}
