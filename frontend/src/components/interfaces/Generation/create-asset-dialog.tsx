"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ImageDropzone } from "@/components/ui/image-dropzone";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

import type { ProjectSummary } from "@/types/project";
import type { CreationRequest } from "@/types/generation";
import {
  getAssetTypeAdapter,
  type CreatableAssetKind,
} from "@/types/asset-kind";

type CreateAssetFormValues = {
  kind: CreatableAssetKind;
  name: string;
  prompt: string;
  perspective: NonNullable<CreationRequest["perspective"]>;
  directionCount: NonNullable<CreationRequest["directionCount"]>;
  reference: File | undefined;
  useProjectContext: boolean;
  backgroundType: "scenery" | "tiles";
  style: string;
  aspectRatio: string;
  layers: { description: string }[];
  tiles: { description: string; reference: File | undefined }[];
  components: { name: string; description: string; isCustom: boolean }[];
  canvasSize: string;
};

function getCreateAssetDefaults(
  kind: CreatableAssetKind,
  initialPrompt = "",
): CreateAssetFormValues {
  return {
    kind,
    name: "",
    prompt: initialPrompt.trim(),
    perspective: "top-down",
    directionCount: "4",
    reference: undefined,
    useProjectContext: true,
    backgroundType: "scenery",
    style: "",
    aspectRatio: "16:9",
    layers: [{ description: "" }],
    tiles: [{ description: "", reference: undefined }],
    components: [{ name: "", description: "", isCustom: false }],
    canvasSize: getAssetTypeAdapter(kind).defaultCanvasSize ?? "32 × 32 px",
  };
}

export function CreateAssetDialog({
  children,
  initialPrompt = "",
  onCreate,
  project,
}: {
  children: (openDialog: (kind: CreatableAssetKind) => void) => React.ReactNode;
  initialPrompt?: string;
  onCreate: (request: CreationRequest) => void;
  project: ProjectSummary;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm({
    defaultValues: getCreateAssetDefaults("character"),
    onSubmit: ({ value }) => {
      const isSpriteAsset =
        value.kind === "character" || value.kind === "object";
      onCreate({
        kind: value.kind,
        name: value.name.trim(),
        prompt: value.prompt.trim(),
        canvasSize: value.canvasSize,
        ...(isSpriteAsset
          ? {
              perspective: value.perspective,
              directionCount: value.directionCount,
              reference: value.reference,
            }
          : {}),
        useProjectContext: value.useProjectContext,
        ...(value.kind === "background"
          ? {
              backgroundType: value.backgroundType,
              style: value.style,
              aspectRatio:
                value.backgroundType === "scenery"
                  ? value.aspectRatio
                  : undefined,
              layers:
                value.backgroundType === "scenery" ? value.layers : undefined,
              tiles: value.backgroundType === "tiles" ? value.tiles : undefined,
            }
          : {}),
        ...(value.kind === "ui"
          ? {
              style: value.style,
              reference: value.reference,
              components: value.components,
            }
          : {}),
      });
      setOpen(false);
    },
  });
  const values = form.state.values;
  const isSpriteAsset = values.kind === "character" || values.kind === "object";

  const openDialog = (nextKind: CreatableAssetKind) => {
    form.reset(getCreateAssetDefaults(nextKind, initialPrompt));
    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children(openDialog)}
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Create {getAssetTypeAdapter(values.kind).label}
          </DialogTitle>
          <DialogDescription>
            Set the production details for this{" "}
            {getAssetTypeAdapter(values.kind).label.toLowerCase()}. Project
            defaults will guide its{" "}
            {values.kind === "audio" ? "tone and atmosphere" : "visual style"}.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          {values.kind === "background" ? (
            <div
              aria-label="Background asset type"
              className="grid grid-cols-2 rounded-lg border bg-muted p-1"
              role="tablist"
            >
              {(
                [
                  ["scenery", "Scenery"],
                  ["tiles", "Tile set"],
                ] as const
              ).map(([type, label]) => (
                <button
                  key={type}
                  type="button"
                  role="tab"
                  aria-selected={values.backgroundType === type}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    values.backgroundType === type
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => form.setFieldValue("backgroundType", type)}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}

          <label className="grid gap-2 text-sm font-medium">
            Asset name
            <Input
              required
              placeholder={
                values.kind === "audio"
                  ? "e.g. Orchard at Night"
                  : `e.g. ${values.kind === "character" ? "Orchard Keeper" : "Moonlit Lantern"}`
              }
              value={values.name}
              onChange={(event) =>
                form.setFieldValue("name", event.target.value)
              }
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Creative brief
            <Textarea
              required
              className="min-h-24 resize-y"
              placeholder={
                values.kind === "audio"
                  ? "Describe the mood, instruments, rhythm, and intended use..."
                  : "Describe the subject, material, mood, and details to generate..."
              }
              value={values.prompt}
              onChange={(event) =>
                form.setFieldValue("prompt", event.target.value)
              }
            />
          </label>

          {values.kind !== "audio" &&
          values.kind !== "background" &&
          values.kind !== "ui" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Canvas size
                <Input
                  value={values.canvasSize}
                  onChange={(event) =>
                    form.setFieldValue("canvasSize", event.target.value)
                  }
                />
              </label>
              <div className="grid gap-2 text-sm font-medium">
                <label htmlFor="create-asset-perspective">Perspective</label>
                <NativeSelect
                  id="create-asset-perspective"
                  className="w-full"
                  value={values.perspective}
                  onChange={(event) =>
                    form.setFieldValue(
                      "perspective",
                      event.target.value as NonNullable<
                        CreationRequest["perspective"]
                      >,
                    )
                  }
                >
                  <NativeSelectOption value="top-down">
                    Top down
                  </NativeSelectOption>
                  <NativeSelectOption value="side-on">
                    Side on
                  </NativeSelectOption>
                  <NativeSelectOption value="isometric">
                    Isometric
                  </NativeSelectOption>
                </NativeSelect>
              </div>
            </div>
          ) : null}

          {values.kind === "background" ? (
            <>
              {values.backgroundType === "scenery" ? (
                <>
                  <label className="grid gap-2 text-sm font-medium">
                    Style
                    <Textarea
                      required
                      className="min-h-20 resize-y"
                      placeholder="Describe the overall scene style..."
                      value={values.style}
                      onChange={(event) =>
                        form.setFieldValue("style", event.target.value)
                      }
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Layer num
                    <NativeSelect
                      className="w-full"
                      value={String(values.layers.length)}
                      onChange={(event) => {
                        const count = Number(event.target.value);
                        form.setFieldValue(
                          "layers",
                          Array.from(
                            { length: count },
                            (_, index) =>
                              values.layers[index] ?? { description: "" },
                          ),
                        );
                      }}
                    >
                      <NativeSelectOption value="1">1</NativeSelectOption>
                      <NativeSelectOption value="2">2</NativeSelectOption>
                      <NativeSelectOption value="3">3</NativeSelectOption>
                      <NativeSelectOption value="4">4</NativeSelectOption>
                      <NativeSelectOption value="5">5</NativeSelectOption>
                      <NativeSelectOption value="6">6</NativeSelectOption>
                      <NativeSelectOption value="8">8</NativeSelectOption>
                    </NativeSelect>
                  </label>
                  <div className="grid gap-3">
                    {values.layers.map((layer, index) => (
                      <label
                        key={index}
                        className="grid gap-2 text-sm font-medium"
                      >
                        Layer {index + 1} description
                        <Textarea
                          required
                          value={layer.description}
                          onChange={(event) =>
                            form.setFieldValue(
                              "layers",
                              values.layers.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, description: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <label className="grid gap-2 text-sm font-medium">
                    Aspect ratio
                    <Input
                      required
                      value={values.aspectRatio}
                      onChange={(event) =>
                        form.setFieldValue("aspectRatio", event.target.value)
                      }
                      placeholder="e.g. 16:9"
                    />
                  </label>
                  <ImageDropzone
                    fileName={values.reference?.name}
                    onSelect={(file) => form.setFieldValue("reference", file)}
                    onClear={() => form.setFieldValue("reference", undefined)}
                  />
                </>
              ) : (
                <>
                  <label className="grid gap-2 text-sm font-medium">
                    Tile num
                    <NativeSelect
                      className="w-full"
                      value={String(values.tiles.length)}
                      onChange={(event) => {
                        const count = Number(event.target.value);
                        form.setFieldValue(
                          "tiles",
                          Array.from(
                            { length: count },
                            (_, index) =>
                              values.tiles[index] ?? {
                                description: "",
                                reference: undefined,
                              },
                          ),
                        );
                      }}
                    >
                      <NativeSelectOption value="1">1</NativeSelectOption>
                      <NativeSelectOption value="2">2</NativeSelectOption>
                      <NativeSelectOption value="3">3</NativeSelectOption>
                      <NativeSelectOption value="4">4</NativeSelectOption>
                      <NativeSelectOption value="5">5</NativeSelectOption>
                      <NativeSelectOption value="6">6</NativeSelectOption>
                      <NativeSelectOption value="8">8</NativeSelectOption>
                    </NativeSelect>
                  </label>
                  <div className="grid gap-4">
                    {values.tiles.map((tile, index) => (
                      <div
                        key={index}
                        className="grid gap-2 rounded-lg border p-3"
                      >
                        <label className="grid gap-2 text-sm font-medium">
                          Tile {index + 1} description
                          <Textarea
                            required
                            value={tile.description}
                            onChange={(event) =>
                              form.setFieldValue(
                                "tiles",
                                values.tiles.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...item,
                                        description: event.target.value,
                                      }
                                    : item,
                                ),
                              )
                            }
                          />
                        </label>
                        <ImageDropzone
                          fileName={tile.reference?.name}
                          onSelect={(file) =>
                            form.setFieldValue(
                              "tiles",
                              values.tiles.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, reference: file }
                                  : item,
                              ),
                            )
                          }
                          onClear={() =>
                            form.setFieldValue(
                              "tiles",
                              values.tiles.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, reference: undefined }
                                  : item,
                              ),
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : null}

          {values.kind === "ui" ? (
            <>
              <div className="grid gap-3">
                <p className="text-sm font-medium">Layout components</p>
                <div className="grid max-h-80 gap-3 overflow-y-auto pr-1">
                  {values.components.map((component, index) => (
                    <div
                      key={index}
                      className="grid gap-2 rounded-lg border p-3"
                    >
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={component.isCustom}
                          onCheckedChange={(checked) =>
                            form.setFieldValue(
                              "components",
                              values.components.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, isCustom: checked }
                                  : item,
                              ),
                            )
                          }
                        />
                        Custom component
                      </label>
                      <Input
                        required
                        placeholder="Component name"
                        value={component.name}
                        onChange={(event) =>
                          form.setFieldValue(
                            "components",
                            values.components.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, name: event.target.value }
                                : item,
                            ),
                          )
                        }
                      />
                      <Textarea
                        required
                        placeholder={
                          component.isCustom
                            ? "Describe the component shape..."
                            : "Component description..."
                        }
                        value={component.description}
                        onChange={(event) =>
                          form.setFieldValue(
                            "components",
                            values.components.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, description: event.target.value }
                                : item,
                            ),
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    form.setFieldValue("components", [
                      ...values.components,
                      { name: "", description: "", isCustom: false },
                    ])
                  }
                >
                  Add component
                </Button>
              </div>
              <label className="grid gap-2 text-sm font-medium">
                Style
                <Textarea
                  required
                  className="min-h-20 resize-y"
                  placeholder="Describe the overall UI style..."
                  value={values.style}
                  onChange={(event) =>
                    form.setFieldValue("style", event.target.value)
                  }
                />
              </label>
              <ImageDropzone
                fileName={values.reference?.name}
                onSelect={(file) => form.setFieldValue("reference", file)}
                onClear={() => form.setFieldValue("reference", undefined)}
              />
            </>
          ) : null}

          {isSpriteAsset ? (
            <>
              <div className="grid gap-2 text-sm font-medium">
                <label htmlFor="create-asset-direction-count">
                  Direction count
                </label>
                <NativeSelect
                  id="create-asset-direction-count"
                  className="w-full"
                  value={values.directionCount}
                  onChange={(event) =>
                    form.setFieldValue(
                      "directionCount",
                      event.target.value as NonNullable<
                        CreationRequest["directionCount"]
                      >,
                    )
                  }
                >
                  <NativeSelectOption value="1">1 direction</NativeSelectOption>
                  <NativeSelectOption value="4">
                    4 directions
                  </NativeSelectOption>
                  <NativeSelectOption value="8">
                    8 directions
                  </NativeSelectOption>
                </NativeSelect>
              </div>

              <div className="grid gap-2 text-sm font-medium">
                <span>Reference</span>
                <ImageDropzone
                  fileName={values.reference?.name}
                  onSelect={(file) => form.setFieldValue("reference", file)}
                  onClear={() => form.setFieldValue("reference", undefined)}
                />
              </div>
            </>
          ) : null}

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={values.useProjectContext}
              onCheckedChange={(checked) =>
                form.setFieldValue("useProjectContext", checked)
              }
            />
            Use {project.name} project context
          </label>

          {values.useProjectContext ? (
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Generation context
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[project.gameType, project.visualStyle, project.platform]
                  .filter(Boolean)
                  .map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
              </div>
              {project.description ? (
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {project.description}
                </p>
              ) : null}
            </div>
          ) : null}

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit">
              Create {getAssetTypeAdapter(values.kind).label}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
