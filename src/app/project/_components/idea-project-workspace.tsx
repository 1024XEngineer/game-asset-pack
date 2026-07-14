"use client";

import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const fields = {
  gameType: ["Role-playing game", "Platformer", "Puzzle", "Strategy", "Simulation", "Other"],
  visualStyle: ["Pixel art", "Hand-painted", "Cartoon", "Low-poly", "Retro", "Other"],
  platform: ["PC", "Mobile", "Web", "Console", "Multi-platform"],
};

export function IdeaProjectWorkspace() {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [gameType, setGameType] = useState("");
  const [visualStyle, setVisualStyle] = useState("");
  const [platform, setPlatform] = useState("");
  const [description, setDescription] = useState("");
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [uploadedImage, setUploadedImage] = useState("");
  const [imageMode, setImageMode] = useState<"generate" | "upload">("generate");
  const [revision, setRevision] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function generate() {
    if (!description.trim()) return;
    setImageMode("generate");
    setIsGenerating(true);
    if (uploadedImage) URL.revokeObjectURL(uploadedImage);
    setUploadedImage("");
    window.setTimeout(() => {
      setGeneratedDescription(description.trim());
      setRevision((value) => value + 1);
      setIsGenerating(false);
    }, 700);
  }

  function continueToDirection() {
    if (!name.trim() || !description.trim()) return;
    setStep(2);
  }

  function uploadImage(file: File | undefined) {
    if (!file) return;
    setImageMode("upload");
    if (uploadedImage) URL.revokeObjectURL(uploadedImage);
    setUploadedImage(URL.createObjectURL(file));
    setGeneratedDescription(description.trim());
  }

  const selectClassName =
    "h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

  return (
    <main className="h-full overflow-y-auto px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Button
          render={<Link href="/project/new" />}
          nativeButton={false}
          variant="ghost"
          size="sm"
        >
          <ArrowLeft data-icon="inline-start" />
          Back
        </Button>

        <div className="mt-6 flex items-center gap-3 text-sm">
          <Badge variant={step === 1 ? "default" : "secondary"}>1</Badge>
          <span className={step === 1 ? "font-medium" : "text-muted-foreground"}>
            Project basics
          </span>
          <span className="h-px w-10 bg-border" />
          <Badge variant={step === 2 ? "default" : "secondary"}>2</Badge>
          <span className={step === 2 ? "font-medium" : "text-muted-foreground"}>
            Visual direction
          </span>
        </div>

        {step === 1 ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <section className="rounded-2xl border bg-background p-6 sm:p-8">
              <Badge variant="secondary">Guided concept</Badge>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight">
                Tell us about your game
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Add the project basics and describe your idea. We will use them to create the first
                visual direction.
              </p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium sm:col-span-2">
                  Project name
                  <Input
                    autoFocus
                    placeholder="Moonlit Orchard"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Game type
                  <select
                    className={selectClassName}
                    value={gameType}
                    onChange={(event) => setGameType(event.target.value)}
                  >
                    <option value="">Select a type</option>
                    {fields.gameType.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Visual style
                  <select
                    className={selectClassName}
                    value={visualStyle}
                    onChange={(event) => setVisualStyle(event.target.value)}
                  >
                    <option value="">Select a style</option>
                    {fields.visualStyle.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium sm:col-span-2">
                  Target platform
                  <select
                    className={selectClassName}
                    value={platform}
                    onChange={(event) => setPlatform(event.target.value)}
                  >
                    <option value="">Select a platform</option>
                    {fields.platform.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium sm:col-span-2">
                  Game description
                  <textarea
                    className="min-h-36 resize-y rounded-xl border bg-transparent p-3 text-sm leading-6 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    placeholder="A tiny courier explores a rainy floating city, delivering mysterious packages..."
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </label>
              </div>
              <Button
                className="mt-8"
                disabled={!name.trim() || !description.trim()}
                onClick={continueToDirection}
              >
                Generate visual direction
                <ChevronRight data-icon="inline-end" />
              </Button>
            </section>
            <aside className="rounded-2xl border bg-muted/40 p-6">
              <Sparkles className="size-6" />
              <h2 className="mt-4 font-semibold">From description to concept</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                On the next step, choose whether to generate a large concept image or upload your
                own.
              </p>
            </aside>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[22rem_minmax(0,1fr)]">
            <section>
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                <ChevronLeft data-icon="inline-start" />
                Edit project basics
              </Button>
              <h1 className="mt-5 text-3xl font-semibold tracking-tight">Visual direction</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Choose how you want to establish the project&apos;s visual direction.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[name, gameType, visualStyle, platform].filter(Boolean).map((value) => (
                  <Badge key={value} variant="secondary">
                    {value}
                  </Badge>
                ))}
              </div>
              <input
                ref={fileInputRef}
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => uploadImage(event.target.files?.[0])}
              />
            </section>

            <section>
              <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl border bg-muted p-1">
                <Button
                  className="rounded-lg"
                  variant={imageMode === "generate" ? "default" : "ghost"}
                  disabled={isGenerating}
                  onClick={generate}
                >
                  {isGenerating ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                  Generate image
                </Button>
                <Button
                  className="rounded-lg"
                  variant={imageMode === "upload" ? "default" : "ghost"}
                  onClick={() => {
                    setImageMode("upload");
                    fileInputRef.current?.click();
                  }}
                >
                  <Upload />
                  Upload image
                </Button>
              </div>
              <Card className="overflow-hidden py-0">
                <div className="relative grid min-h-[34rem] place-items-center overflow-hidden bg-[radial-gradient(circle_at_25%_20%,#f5c98b_0,transparent_30%),radial-gradient(circle_at_75%_60%,#76a889_0,transparent_35%),linear-gradient(145deg,#182530,#536a75)]">
                  {uploadedImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={uploadedImage}
                      alt={`${name} visual direction`}
                      className="absolute inset-0 size-full object-cover"
                    />
                  ) : generatedDescription ? (
                    <>
                      <div className="absolute inset-0 bg-[linear-gradient(transparent_60%,rgba(0,0,0,.72))]" />
                      <div className="absolute bottom-0 z-10 w-full p-8 text-white">
                        <p className="text-xs font-semibold uppercase tracking-[.2em] text-white/70">
                          {name} · Direction {revision}
                        </p>
                        <h2 className="mt-2 max-w-2xl text-3xl font-semibold">
                          {generatedDescription}
                        </h2>
                        <p className="mt-3 text-sm text-white/70">
                          Concept reference · mood, palette and world composition
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="max-w-sm px-6 text-center text-white/80">
                      <Sparkles className="mx-auto size-10" />
                      <p className="mt-4 font-medium">Choose a visual direction</p>
                      <p className="mt-2 text-sm text-white/60">
                        Generate a large image from your description or upload your own image.
                      </p>
                    </div>
                  )}
                </div>
                <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    {uploadedImage
                      ? "Using your uploaded image as the project direction."
                      : generatedDescription
                        ? "Generate another direction or upload your own image."
                        : "Generate or upload an image to continue."}
                  </p>
                  <Button
                    disabled={!generatedDescription}
                    render={<Link href="/project?project=moonlit-orchard" />}
                    nativeButton={false}
                  >
                    <Check data-icon="inline-start" />
                    Create project
                  </Button>
                </CardContent>
              </Card>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
