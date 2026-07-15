import { ProjectChrome } from "./_components/project-chrome";
import { ProjectStoreProvider } from "./_components/project-store";

export default function ProjectLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ProjectStoreProvider>
      <ProjectChrome>{children}</ProjectChrome>
    </ProjectStoreProvider>
  );
}
