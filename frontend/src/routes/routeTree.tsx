import {
  createRootRoute,
  createRoute,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import { AudioStudioPage } from "@/pages/audio/AudioStudioPage";
import { QuickGeneratePage } from "@/pages/quick-generation/QuickGeneratePage";
import { EditorPage } from "@/pages/projects/EditorPage";
import { NewProjectPage } from "@/pages/projects/NewProjectPage";
import { ProjectLibraryPage } from "@/pages/projects/ProjectLibraryPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";

const rootRoute = createRootRoute({ component: Outlet });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/projects", search: { project: undefined, q: "" } });
  },
});

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects",
  validateSearch: (search: Record<string, unknown>) => ({
    project: typeof search.project === "string" ? search.project : undefined,
    q: typeof search.q === "string" ? search.q : "",
  }),
  component: ProjectLibraryPage,
});

const newProjectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/new",
  component: NewProjectPage,
});
const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/$projectId/assets/$assetId",
  component: EditorPage,
});
const quickGenerateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/generate",
  component: QuickGeneratePage,
});
const audioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/audio",
  component: AudioStudioPage,
});
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  projectsRoute,
  newProjectRoute,
  editorRoute,
  quickGenerateRoute,
  audioRoute,
  settingsRoute,
]);
