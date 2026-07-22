import { assetGroupsByProject, projectSummaries } from "./project-demo-data";
import { removeMockProjectGenerationRuns } from "./generation-repository";
import type { AssetGroupsByProject } from "@/modules/asset/library/model";
import type { ProjectAsset } from "@/modules/asset/model";
import type { ProjectSummary } from "@/modules/project/model";
import type { AssetKind } from "@/shared/types/asset-kind";

const PROJECTS_STORAGE_KEY = "game-asset-pack:projects";

let projects = projectSummaries;
let assetsByProject = assetGroupsByProject;

function readPersistedProjects() {
  try {
    const value = localStorage.getItem(PROJECTS_STORAGE_KEY);
    return value ? (JSON.parse(value) as ProjectSummary[]) : projects;
  } catch {
    return projects;
  }
}

function persistProjects() {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // Keep mock state in memory when browser storage is unavailable.
  }
}

function titleForKind(kind: AssetKind) {
  return kind === "ui" ? "UI" : `${kind[0].toUpperCase()}${kind.slice(1)}`;
}

export async function listMockProjects() {
  projects = readPersistedProjects();
  return projects;
}

export async function createMockProject(project: ProjectSummary) {
  projects = [...projects, project];
  persistProjects();
  return project;
}

export async function updateMockProject(project: ProjectSummary) {
  projects = projects.map((item) => (item.id === project.id ? project : item));
  persistProjects();
  return project;
}

export async function deleteMockProject(projectId: string) {
  projects = projects.filter((project) => project.id !== projectId);
  const { [projectId]: _, ...remainingAssets } = assetsByProject;
  assetsByProject = remainingAssets;
  removeMockProjectGenerationRuns(projectId);
  persistProjects();
}

export function hasMockProject(projectId: string) {
  return projects.some((project) => project.id === projectId);
}

export async function listMockAssetGroups(projectId: string) {
  return assetsByProject[projectId] ?? [];
}

export async function addMockAsset(
  projectId: string,
  kind: AssetKind,
  asset: ProjectAsset,
) {
  const groups = assetsByProject[projectId] ?? [];
  const group = groups.find((item) => item.kind === kind);

  assetsByProject = {
    ...assetsByProject,
    [projectId]: group
      ? groups.map((item) =>
          item.kind === kind
            ? { ...item, assets: [...item.assets, asset] }
            : item,
        )
      : [
          ...groups,
          {
            kind,
            title: titleForKind(kind),
            accentClassName: "bg-slate-500",
            assets: [asset],
          },
        ],
  };

  return assetsByProject[projectId];
}

export async function copyMockAsset(projectId: string, assetId: string) {
  const groups = assetsByProject[projectId] ?? [];
  const copyId = `${assetId}-copy-${crypto.randomUUID()}`;

  assetsByProject = {
    ...assetsByProject,
    [projectId]: groups.map((group) => {
      const assetIndex = group.assets.findIndex(
        (asset) => asset.id === assetId,
      );
      if (assetIndex < 0) return group;

      const asset = group.assets[assetIndex];
      const copiedAsset = {
        ...asset,
        id: copyId,
        name: `${asset.name} Copy`,
        history: asset.history.map((entry) => ({
          ...entry,
          id: `${copyId}-history-${entry.version}`,
        })),
        animations: asset.animations.map((animation) => ({
          ...animation,
          id: `${copyId}-animation-${animation.id}`,
        })),
      };

      return {
        ...group,
        assets: [
          ...group.assets.slice(0, assetIndex + 1),
          copiedAsset,
          ...group.assets.slice(assetIndex + 1),
        ],
      };
    }),
  };

  return assetsByProject[projectId];
}

export async function deleteMockAsset(projectId: string, assetId: string) {
  assetsByProject = {
    ...assetsByProject,
    [projectId]: (assetsByProject[projectId] ?? []).map((group) => ({
      ...group,
      assets: group.assets.filter((asset) => asset.id !== assetId),
    })),
  };

  return assetsByProject[projectId];
}

export function resetMockRepository() {
  projects = projectSummaries;
  assetsByProject = assetGroupsByProject as AssetGroupsByProject;
}
