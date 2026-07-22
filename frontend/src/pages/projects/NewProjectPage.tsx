import { useNavigate } from "@tanstack/react-router";

import { AppHeader } from "@/app/AppHeader";
import { useCreateProjectMutation } from "@/data/project/project-create.mutation";
import { NewProjectScreen } from "@/modules/project/NewProjectScreen";

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
