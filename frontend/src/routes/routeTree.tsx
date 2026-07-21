import { createRootRoute, createRoute, redirect } from "@tanstack/react-router";

import { AppShell } from "@/app/AppShell";
import { SettingsScreen } from "@/app/settings/SettingsScreen";
import { AudioStudioScreen } from "@/modules/editor/audio/AudioStudioScreen";
import { QuickGenerateScreen } from "@/modules/generation/QuickGenerateScreen";
import {
  EditorRoute,
  NewProjectRoute,
  ProjectLibraryRoute,
} from "./project-routes";

const rootRoute = createRootRoute({ component: AppShell });

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
  component: ProjectLibraryRoute,
});

const newProjectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/new",
  component: NewProjectRoute,
});
const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/$projectId/assets/$assetId",
  component: EditorRoute,
});
const quickGenerateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/generate",
  component: QuickGenerateScreen,
});
const audioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/audio",
  component: AudioStudioScreen,
});
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsScreen,
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
