"use client";

import { Download, ImagePlus, Plus, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

type Asset = {
  id: string;
  prompt: string;
  referenceImage: string;
  size: string;
  previewClassName: string;
};

const sizes = ["32 × 32 px", "64 × 64 px", "128 × 128 px", "256 × 256 px", "512 × 512 px"];

const mockAssets: Asset[] = [
  {
    id: "mushroom-courier",
    prompt: "A cheerful mushroom courier with a red cap, tiny satchel, and readable silhouette.",
    referenceImage: "",
    size: "64 × 64 px",
    previewClassName:
      "bg-[radial-gradient(circle_at_35%_28%,#f4c665_0,transparent_25%),linear-gradient(145deg,#243847,#708d78)]",
  },
  {
    id: "moonlit-lantern",
    prompt: "A small brass lantern glowing with cool blue moonlight and subtle engraved details.",
    referenceImage: "",
    size: "128 × 128 px",
    previewClassName:
      "bg-[radial-gradient(circle_at_55%_40%,#a9d5ff_0,transparent_24%),linear-gradient(145deg,#151d3a,#58608d)]",
  },
  {
    id: "forest-gate",
    prompt: "An ancient moss-covered stone gate framed by roots and tiny luminous flowers.",
    referenceImage: "",
    size: "256 × 256 px",
    previewClassName:
      "bg-[radial-gradient(circle_at_65%_30%,#d2e893_0,transparent_22%),linear-gradient(145deg,#20372b,#66835e)]",
  },
];

export function QuickGenerateScreen() {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [currentAssetId, setCurrentAssetId] = useState<string | null>(mockAssets[0].id);
  const [description, setDescription] = useState("");
  const [referenceImage, setReferenceImage] = useState("");
  const [size, setSize] = useState(mockAssets[0].size);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);

  const currentAsset = assets.find((asset) => asset.id === currentAssetId);

  function selectAsset(asset: Asset) {
    setCurrentAssetId(asset.id);
    setDescription("");
    setReferenceImage(asset.referenceImage);
    setSize(asset.size);
  }

  function newAsset() {
    setCurrentAssetId(null);
    setDescription("");
    setSize(sizes[1]);
    if (referenceImage) URL.revokeObjectURL(referenceImage);
    setReferenceImage("");
  }

  function generate() {
    if (!description.trim()) return;
    setIsGenerating(true);
    window.setTimeout(() => {
      if (currentAsset) {
        setAssets((items) =>
          items.map((asset) =>
            asset.id === currentAsset.id
              ? { ...asset, prompt: description.trim(), referenceImage, size }
              : asset,
          ),
        );
      } else {
        const assetId = `asset-${Date.now()}`;
        const asset: Asset = {
          id: assetId,
          prompt: description.trim(),
          referenceImage,
          size,
          previewClassName:
            "bg-[radial-gradient(circle_at_34%_28%,#f7d98c_0,transparent_24%),linear-gradient(145deg,#243847,#68808a)]",
        };
        setAssets((items) => [...items, asset]);
        setCurrentAssetId(assetId);
      }
      setDescription("");
      setIsGenerating(false);
    }, 700);
  }

  function deleteCurrentAsset() {
    if (!currentAsset) return;
    const remaining = assets.filter((asset) => asset.id !== currentAsset.id);
    setAssets(remaining);
    setCurrentAssetId(remaining[0]?.id ?? null);
    setReferenceImage(remaining[0]?.referenceImage ?? "");
    setSize(remaining[0]?.size ?? sizes[1]);
    setDescription("");
  }

  function chooseReference(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    if (referenceImage) URL.revokeObjectURL(referenceImage);
    setReferenceImage(URL.createObjectURL(file));
  }

  function handleDragEnter(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    if (!Array.from(event.dataTransfer.items).some((item) => item.kind === "file")) return;
    dragDepthRef.current += 1;
    setIsDragging(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setIsDragging(false);
  }

  function handleDrop(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDragging(false);
    chooseReference(event.dataTransfer.files[0]);
  }

  return (
    <main
      className="relative flex min-h-[calc(100vh-3.5rem)] flex-1 flex-col bg-muted/30"
      onDragEnter={handleDragEnter}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging ? (
        <div className="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-background/80 p-6 backdrop-blur-sm">
          <div className="px-12 py-10 text-center">
            <ImagePlus className="mx-auto size-8" />
            <p className="mt-4 font-semibold">Drop image to attach</p>
            <p className="mt-1 text-sm text-muted-foreground">PNG, JPEG or WebP</p>
          </div>
        </div>
      ) : null}
      <header className="border-b bg-background px-5 py-4">
        <div className="mx-auto max-w-[100rem]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">Quick Generating</h1>
              <Badge variant="secondary">{assets.length} assets</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Create and update standalone assets without project setup.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[100rem] flex-1 xl:h-[calc(100vh-8.5rem)] xl:grid-cols-[16rem_minmax(0,1fr)_21rem] xl:overflow-hidden">
        <aside className="border-b bg-background p-4 xl:border-r xl:border-b-0">
          <Button className="w-full" variant="outline" onClick={newAsset}>
            <Plus data-icon="inline-start" />
            New asset
          </Button>
          <div className="mt-5 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">
              Assets
            </h2>
            <span className="text-xs text-muted-foreground">{assets.length}</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {assets.map((asset, index) => {
              const active = asset.id === currentAssetId;
              return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => selectAsset(asset)}
                  aria-label={`Generated image ${index + 1}`}
                  className={`aspect-square overflow-hidden rounded-xl border-2 p-1 transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                    active ? "border-foreground" : "border-transparent hover:border-border"
                  }`}
                >
                  <span
                    className={`block size-full rounded-lg outline -outline-offset-1 outline-black/10 ${asset.previewClassName}`}
                  />
                </button>
              );
            })}
            {assets.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs leading-5 text-muted-foreground">
                Your generated assets will appear here.
              </p>
            ) : null}
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col p-5 sm:p-6">
          <div className="mb-4 flex min-h-9 items-center justify-between gap-3">
            {currentAsset ? (
              <Badge variant="secondary">{currentAsset.size}</Badge>
            ) : (
              <span className="font-semibold">New standalone asset</span>
            )}
            {currentAsset ? (
              <Button variant="ghost" size="icon-sm" onClick={deleteCurrentAsset}>
                <Trash2 />
                <span className="sr-only">Delete asset</span>
              </Button>
            ) : null}
          </div>

          <Card className="mx-auto flex aspect-square min-h-72 w-full max-w-[34rem] flex-1 overflow-hidden py-0 xl:min-h-0 xl:flex-none">
            <div className="relative grid min-h-72 flex-1 place-items-center overflow-hidden bg-[linear-gradient(45deg,var(--muted)_25%,transparent_25%),linear-gradient(-45deg,var(--muted)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,var(--muted)_75%),linear-gradient(-45deg,transparent_75%,var(--muted)_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0] xl:min-h-0">
              {currentAsset ? (
                <div
                  className={`relative grid aspect-square w-[min(60%,22rem)] place-items-center overflow-hidden rounded-2xl shadow-sm outline -outline-offset-1 outline-black/10 ${currentAsset.previewClassName}`}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_55%,rgba(0,0,0,.68))]" />
                  <div className="absolute bottom-0 z-10 w-full p-6 text-white">
                    <p className="mt-2 line-clamp-3 text-lg font-medium">{currentAsset.prompt}</p>
                  </div>
                </div>
              ) : (
                <div className="max-w-sm px-6 text-center">
                  <span className="mx-auto grid size-12 place-items-center rounded-xl border bg-background">
                    <Sparkles className="size-5 text-muted-foreground" />
                  </span>
                  <h2 className="mt-4 font-semibold">
                    {assets.length ? "Create another asset" : "Start with a description"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Each asset keeps its description, reference image, and latest generated result.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {currentAsset ? (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border bg-background p-4">
              <div>
                <p className="text-sm font-medium">Current asset</p>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                  {currentAsset.prompt}
                </p>
              </div>
              <Button>
                <Download data-icon="inline-start" /> Export
              </Button>
            </div>
          ) : null}
        </section>

        <aside className="border-t bg-background p-5 xl:border-t-0 xl:border-l xl:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-muted-foreground">
              {currentAsset ? "Current asset" : "New asset"}
            </p>
            <h2 className="mt-2 text-lg font-semibold">
              {currentAsset ? "Update the asset" : "Describe the asset"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {currentAsset
                ? "Generating again updates the current result."
                : "The first description also names the asset."}
            </p>
          </div>

          <label className="mt-6 grid gap-2 text-sm font-medium">
            Size
            <select
              className="h-9 rounded-lg border bg-transparent px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              value={size}
              onChange={(event) => setSize(event.target.value)}
            >
              {sizes.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <input
            ref={fileInputRef}
            className="sr-only"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => chooseReference(event.target.files?.[0])}
          />

          <div className="mt-5 overflow-hidden rounded-2xl border bg-background shadow-sm focus-within:ring-3 focus-within:ring-ring/50">
            {referenceImage ? (
              <div className="border-b bg-muted/30 p-3">
                <div className="relative w-fit">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={referenceImage}
                    alt="Attached reference"
                    className="size-20 rounded-xl object-cover outline -outline-offset-1 outline-black/10"
                  />
                  <button
                    type="button"
                    onClick={() => setReferenceImage("")}
                    className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full border bg-background text-xs shadow-sm"
                    aria-label="Remove reference image"
                  >
                    ×
                  </button>
                </div>
              </div>
            ) : null}
            <textarea
              autoFocus
              className="min-h-44 w-full resize-none bg-transparent px-4 py-3 text-sm leading-6 outline-none placeholder:text-muted-foreground"
              placeholder={
                currentAsset
                  ? "Describe how you want to update this asset, you can upload or drag an image here for reference"
                  : "Describe the asset you want to create, you can upload or drag an image here for reference"
              }
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <div className="flex items-center justify-between gap-3 p-3 pt-0">
              <div className="flex min-w-0 items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Plus />
                  <span className="sr-only">Attach reference image</span>
                </Button>
                <span className="text-xs leading-4 text-muted-foreground"></span>
              </div>
              <Button disabled={!description.trim() || isGenerating} onClick={generate}>
                {isGenerating ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                {currentAsset ? "Update asset" : "Generate asset"}
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
