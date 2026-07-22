"use client";

import { ImagePlus, X } from "lucide-react";
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
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

import type { ProjectSummary } from "@/types/project";
import type { CreationRequest } from "@/types/generation";
import { getAssetTypeAdapter, type CreatableAssetKind } from "@/types/asset-kind";

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
  const [kind, setKind] = useState<CreatableAssetKind>("character");
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [perspective, setPerspective] = useState<CreationRequest["perspective"]>("top-down");
  const [directionCount, setDirectionCount] = useState<CreationRequest["directionCount"]>("4");
  const [reference, setReference] = useState<File>();
  const [useProjectContext, setUseProjectContext] = useState(true);
  const isSpriteAsset = kind === "character" || kind === "object";
  const [backgroundType, setBackgroundType] = useState<"scenery" | "tiles">("scenery");
  const [style, setStyle] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [layers, setLayers] = useState([{ description: "" }]);
  const [tiles, setTiles] = useState([
    { description: "", reference: undefined as File | undefined },
  ]);
  const [components, setComponents] = useState([{ name: "", description: "", isCustom: false }]);
  const [canvasSize, setCanvasSize] = useState("32 × 32 px");

  const openDialog = (nextKind: CreatableAssetKind) => {
    setKind(nextKind);
    setCanvasSize(getAssetTypeAdapter(nextKind).defaultCanvasSize ?? "32 × 32 px");
    setPrompt(initialPrompt.trim());
    setPerspective("top-down");
    setDirectionCount("4");
    setReference(undefined);
    setUseProjectContext(true);
    setBackgroundType("scenery");
    setStyle("");
    setAspectRatio("16:9");
    setLayers([{ description: "" }]);
    setTiles([{ description: "", reference: undefined }]);
    setComponents([{ name: "", description: "", isCustom: false }]);
    setOpen(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCreate({
      kind,
      name: name.trim(),
      prompt: prompt.trim(),
      canvasSize,
      ...(isSpriteAsset ? { perspective, directionCount, reference } : {}),
      useProjectContext,
      ...(kind === "background"
        ? {
            backgroundType,
            style,
            aspectRatio: backgroundType === "scenery" ? aspectRatio : undefined,
            layers: backgroundType === "scenery" ? layers : undefined,
            tiles: backgroundType === "tiles" ? tiles : undefined,
          }
        : {}),
      ...(kind === "ui" ? { style, reference, components } : {}),
    });
    setOpen(false);
    setName("");
    setPrompt("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children(openDialog)}
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create {getAssetTypeAdapter(kind).label}</DialogTitle>
          <DialogDescription>
            Set the production details for this {getAssetTypeAdapter(kind).label.toLowerCase()}. Project defaults will
            guide its {kind === "audio" ? "tone and atmosphere" : "visual style"}.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          {kind === "background" ? (
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
                  aria-selected={backgroundType === type}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    backgroundType === type
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setBackgroundType(type)}
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
                kind === "audio"
                  ? "e.g. Orchard at Night"
                  : `e.g. ${kind === "character" ? "Orchard Keeper" : "Moonlit Lantern"}`
              }
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Creative brief
            <Textarea
              required
              className="min-h-24 resize-y"
              placeholder={
                kind === "audio"
                  ? "Describe the mood, instruments, rhythm, and intended use..."
                  : "Describe the subject, material, mood, and details to generate..."
              }
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
          </label>

          {kind !== "audio" && kind !== "background" && kind !== "ui" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Canvas size
                <Input value={canvasSize} onChange={(event) => setCanvasSize(event.target.value)} />
              </label>
              <div className="grid gap-2 text-sm font-medium">
                <label htmlFor="create-asset-perspective">Perspective</label>
                <NativeSelect
                  id="create-asset-perspective"
                  className="w-full"
                  value={perspective}
                  onChange={(event) =>
                    setPerspective(
                      event.target.value as NonNullable<CreationRequest["perspective"]>,
                    )
                  }
                >
                  <NativeSelectOption value="top-down">Top down</NativeSelectOption>
                  <NativeSelectOption value="side-on">Side on</NativeSelectOption>
                  <NativeSelectOption value="isometric">Isometric</NativeSelectOption>
                </NativeSelect>
              </div>
            </div>
          ) : null}

          {kind === "background" ? (
            <>
              {backgroundType === "scenery" ? (
                <>
                  <label className="grid gap-2 text-sm font-medium">
                    Style
                    <Textarea
                      required
                      className="min-h-20 resize-y"
                      placeholder="Describe the overall scene style..."
                      value={style}
                      onChange={(event) => setStyle(event.target.value)}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Layer num
                    <NativeSelect
                      className="w-full"
                      value={String(layers.length)}
                      onChange={(event) => {
                        const count = Number(event.target.value);
                        setLayers((current) =>
                          Array.from(
                            { length: count },
                            (_, index) => current[index] ?? { description: "" },
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
                    {layers.map((layer, index) => (
                      <label key={index} className="grid gap-2 text-sm font-medium">
                        Layer {index + 1} description
                        <Textarea
                          required
                          value={layer.description}
                          onChange={(event) =>
                            setLayers((current) =>
                              current.map((item, itemIndex) =>
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
                      value={aspectRatio}
                      onChange={(event) => setAspectRatio(event.target.value)}
                      placeholder="e.g. 16:9"
                    />
                  </label>
                  <ReferenceField reference={reference} onChange={setReference} />
                </>
              ) : (
                <>
                  <label className="grid gap-2 text-sm font-medium">
                    Tile num
                    <NativeSelect
                      className="w-full"
                      value={String(tiles.length)}
                      onChange={(event) => {
                        const count = Number(event.target.value);
                        setTiles((current) =>
                          Array.from(
                            { length: count },
                            (_, index) =>
                              current[index] ?? { description: "", reference: undefined },
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
                    {tiles.map((tile, index) => (
                      <div key={index} className="grid gap-2 rounded-lg border p-3">
                        <label className="grid gap-2 text-sm font-medium">
                          Tile {index + 1} description
                          <Textarea
                            required
                            value={tile.description}
                            onChange={(event) =>
                              setTiles((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index
                                    ? { ...item, description: event.target.value }
                                    : item,
                                ),
                              )
                            }
                          />
                        </label>
                        <ReferenceField
                          reference={tile.reference}
                          onChange={(file) =>
                            setTiles((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, reference: file } : item,
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

          {kind === "ui" ? (
            <>
              <div className="grid gap-3">
                <p className="text-sm font-medium">Layout components</p>
                <div className="grid max-h-80 gap-3 overflow-y-auto pr-1">
                  {components.map((component, index) => (
                    <div key={index} className="grid gap-2 rounded-lg border p-3">
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={component.isCustom}
                          onCheckedChange={(checked) =>
                            setComponents((current) =>
                              current.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, isCustom: checked } : item,
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
                          setComponents((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, name: event.target.value } : item,
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
                          setComponents((current) =>
                            current.map((item, itemIndex) =>
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
                    setComponents((current) => [
                      ...current,
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
                  value={style}
                  onChange={(event) => setStyle(event.target.value)}
                />
              </label>
              <ReferenceField reference={reference} onChange={setReference} />
            </>
          ) : null}

          {isSpriteAsset ? (
            <>
              <div className="grid gap-2 text-sm font-medium">
                <label htmlFor="create-asset-direction-count">Direction count</label>
                <NativeSelect
                  id="create-asset-direction-count"
                  className="w-full"
                  value={directionCount}
                  onChange={(event) =>
                    setDirectionCount(
                      event.target.value as NonNullable<CreationRequest["directionCount"]>,
                    )
                  }
                >
                  <NativeSelectOption value="1">1 direction</NativeSelectOption>
                  <NativeSelectOption value="4">4 directions</NativeSelectOption>
                  <NativeSelectOption value="8">8 directions</NativeSelectOption>
                </NativeSelect>
              </div>

              <div className="grid gap-2 text-sm font-medium">
                <label htmlFor="create-asset-reference">Reference</label>
                {reference ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
                    <p className="min-w-0 truncate text-sm font-normal">{reference.name}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remove reference image"
                      onClick={() => setReference(undefined)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-5 text-sm font-normal text-muted-foreground transition-colors hover:bg-muted/50">
                    <ImagePlus className="size-4" />
                    Upload a reference image
                    <Input
                      id="create-asset-reference"
                      className="sr-only"
                      type="file"
                      accept="image/*"
                      onChange={(event) => setReference(event.target.files?.[0])}
                    />
                  </label>
                )}
              </div>
            </>
          ) : null}

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox checked={useProjectContext} onCheckedChange={setUseProjectContext} />
            Use {project.name} project context
          </label>

          {useProjectContext ? (
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-xs font-medium text-muted-foreground">Generation context</p>
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
            <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
            <Button type="submit">Create {getAssetTypeAdapter(kind).label}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReferenceField({
  reference,
  onChange,
}: {
  reference?: File;
  onChange: (file?: File) => void;
}) {
  return (
    <div className="grid gap-2 text-sm font-medium">
      <span>Reference</span>
      {reference ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
          <p className="min-w-0 truncate text-sm font-normal">{reference.name}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Remove reference image"
            onClick={() => onChange(undefined)}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-5 text-sm font-normal text-muted-foreground transition-colors hover:bg-muted/50">
          <ImagePlus className="size-4" />
          Upload a reference image
          <Input
            className="sr-only"
            type="file"
            accept="image/*"
            onChange={(event) => onChange(event.target.files?.[0])}
          />
        </label>
      )}
    </div>
  );
}
