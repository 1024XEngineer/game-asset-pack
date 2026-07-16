"use client";

import {
  AudioLines,
  Clock3,
  Gauge,
  Pause,
  Play,
  Plus,
  Repeat2,
  Scissors,
  Sparkles,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
} from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

const TIMELINE_DURATION = 30;
const SOURCE_DURATION = 10;
const SPEEDS = [0.5, 1, 1.5, 2];

type AudioTrack = {
  id: string;
  name: string;
  url: string;
  duration: number;
  trimStart: number;
  trimEnd: number;
  offset: number;
  stretch: number;
  loop: boolean;
  muted: boolean;
  volume: number;
  waveform: number[];
  cuts: number[];
  deletedRanges: Array<[number, number]>;
  kind: "generated" | "imported";
};

type ReferenceAudio = {
  id: string;
  name: string;
  url: string;
};

export function AudioAssetWorkspace() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isProjectAudio = pathname.startsWith("/project/audio");
  const isNewAudio = !isProjectAudio && searchParams.get("new") === "1";
  const name = searchParams.get("name") || "Untitled audio";
  const initialPrompt = isNewAudio ? "" : searchParams.get("prompt") || "Generated project audio";
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const previewAudioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const objectUrls = useRef(new Set<string>());
  const dragDepthRef = useRef(0);
  const referenceDragDepthRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timelineRef = useRef(0);
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [timeline, setTimeline] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingTrackIds, setPlayingTrackIds] = useState<string[]>([]);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isDraggingReference, setIsDraggingReference] = useState(false);
  const [referenceAudios, setReferenceAudios] = useState<ReferenceAudio[]>([]);
  const [description, setDescription] = useState(initialPrompt);
  const [generation, setGeneration] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [masterVolume, setMasterVolume] = useState(1);
  const [masterMuted, setMasterMuted] = useState(false);
  const [masterLoop, setMasterLoop] = useState(false);
  const [masterRate, setMasterRate] = useState(1);

  useEffect(() => {
    const urls = objectUrls.current;
    setDescription(initialPrompt);
    setReferenceAudios([]);
    if (isNewAudio) {
      setTracks([]);
    } else {
      const url = registerUrl(
        URL.createObjectURL(createDemoAudioBlob(SOURCE_DURATION, 0)),
        objectUrls,
      );
      setTracks([
        createTrack("generated", isProjectAudio ? name : initialPrompt, url, SOURCE_DURATION, 0, 0),
      ]);
    }
    return () => {
      pauseAll(previewAudioRefs.current);
      previewAudioRefs.current = {};
      urls.forEach((item) => URL.revokeObjectURL(item));
      urls.clear();
    };
  }, [initialPrompt, isNewAudio, isProjectAudio, name]);

  useEffect(() => {
    tracks.forEach((track) => {
      const audio = audioRefs.current[track.id];
      if (!audio) return;
      audio.playbackRate = (1 / track.stretch) * (isPlaying ? masterRate : 1);
      audio.loop = track.loop;
      audio.volume = track.volume * masterVolume;
      audio.muted = track.muted || masterMuted;
      const previewAudio = previewAudioRefs.current[track.id];
      if (previewAudio) {
        previewAudio.playbackRate = 1 / track.stretch;
        previewAudio.loop = track.loop;
        previewAudio.volume = track.volume * masterVolume;
        previewAudio.muted = track.muted || masterMuted;
      }
    });
  }, [isPlaying, masterMuted, masterRate, masterVolume, tracks]);

  useEffect(() => {
    if (!isPlaying) return;
    let frame = 0;
    let previous = performance.now();
    let lastRender = previous;

    const tick = (now: number) => {
      const next = timelineRef.current + ((now - previous) / 1000) * masterRate;
      previous = now;
      if (next >= TIMELINE_DURATION) {
        if (masterLoop) {
          timelineRef.current = 0;
          setTimeline(0);
          syncTracksAt(0, tracks, audioRefs.current, true, masterRate, masterVolume, masterMuted);
        } else {
          timelineRef.current = 0;
          setTimeline(0);
          setIsPlaying(false);
          pauseAll(audioRefs.current);
          return;
        }
      }
      const activeTime = masterLoop && next >= TIMELINE_DURATION ? 0 : next;
      timelineRef.current = activeTime;
      syncTracksAt(
        activeTime,
        tracks,
        audioRefs.current,
        true,
        masterRate,
        masterVolume,
        masterMuted,
      );
      if (now - lastRender >= 40) {
        setTimeline(activeTime);
        lastRender = now;
      }
      frame = requestAnimationFrame(tick);
    };

    syncTracksAt(
      timelineRef.current,
      tracks,
      audioRefs.current,
      true,
      masterRate,
      masterVolume,
      masterMuted,
    );
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying, masterLoop, masterMuted, masterRate, masterVolume, tracks]);

  const ruler = useMemo(() => Array.from({ length: 7 }, (_, index) => index * 5), []);

  function updateTrack(id: string, update: Partial<AudioTrack>) {
    setTracks((current) =>
      current.map((track) => (track.id === id ? { ...track, ...update } : track)),
    );
  }

  function seek(next: number) {
    const value = clamp(next, 0, TIMELINE_DURATION);
    timelineRef.current = value;
    setTimeline(value);
    syncTracksAt(
      value,
      tracks,
      audioRefs.current,
      isPlaying,
      masterRate,
      masterVolume,
      masterMuted,
    );
  }

  function toggleTransport() {
    if (isPlaying) {
      setIsPlaying(false);
      pauseAll(audioRefs.current);
    } else {
      pauseAll(previewAudioRefs.current);
      setPlayingTrackIds([]);
      setIsPlaying(true);
    }
  }

  async function toggleTrackPreview(track: AudioTrack) {
    const currentPreview = previewAudioRefs.current[track.id];
    if (currentPreview && !currentPreview.paused) {
      currentPreview.pause();
      setPlayingTrackIds((current) => current.filter((id) => id !== track.id));
      return;
    }

    setIsPlaying(false);
    pauseAll(audioRefs.current);
    pauseAll(previewAudioRefs.current);
    setPlayingTrackIds([]);

    const audio =
      currentPreview && currentPreview.src === track.url ? currentPreview : new Audio(track.url);
    previewAudioRefs.current[track.id] = audio;
    audio.currentTime = track.trimStart;
    audio.playbackRate = 1 / track.stretch;
    audio.loop = track.loop;
    audio.volume = track.volume * masterVolume;
    audio.muted = track.muted || masterMuted;
    audio.onended = () => {
      setPlayingTrackIds((current) => current.filter((id) => id !== track.id));
    };
    audio.ontimeupdate = () => {
      const deletedRange = track.deletedRanges.find(
        ([start, end]) => audio.currentTime >= start && audio.currentTime < end,
      );
      if (deletedRange) audio.currentTime = deletedRange[1];
      const previewTime =
        track.offset + sourceToPlayableTime(audio.currentTime, track) * track.stretch;
      timelineRef.current = previewTime;
      setTimeline(previewTime);
      if (audio.currentTime < track.trimEnd) return;
      if (track.loop) {
        audio.currentTime = track.trimStart;
        void audio.play();
      } else {
        audio.pause();
        audio.currentTime = track.trimStart;
        setPlayingTrackIds((current) => current.filter((id) => id !== track.id));
      }
    };
    try {
      await audio.play();
      setPlayingTrackIds([track.id]);
    } catch {
      setPlayingTrackIds([]);
    }
  }

  function deleteTrack(track: AudioTrack) {
    audioRefs.current[track.id]?.pause();
    previewAudioRefs.current[track.id]?.pause();
    delete audioRefs.current[track.id];
    delete previewAudioRefs.current[track.id];
    setTracks((current) => current.filter((item) => item.id !== track.id));
    setPlayingTrackIds((current) => current.filter((id) => id !== track.id));
    if (objectUrls.current.delete(track.url)) URL.revokeObjectURL(track.url);
  }

  function attachMp3(files: FileList) {
    const mp3Files = Array.from(files).filter(
      (file) => file.type === "audio/mpeg" || file.name.toLowerCase().endsWith(".mp3"),
    );
    if (!mp3Files.length) return;
    setTracks((current) => [
      ...current,
      ...mp3Files.map((file, index) => {
        const url = registerUrl(URL.createObjectURL(file), objectUrls);
        return createTrack(
          `imported-${Date.now()}-${index}`,
          file.name,
          url,
          8,
          clamp(2 + index * 2, 0, TIMELINE_DURATION - 4),
          index + generation + 4,
          "imported",
        );
      }),
    ]);
  }

  function attachReferenceMp3(files: FileList) {
    const mp3Files = Array.from(files).filter(
      (file) => file.type === "audio/mpeg" || file.name.toLowerCase().endsWith(".mp3"),
    );
    if (!mp3Files.length) return;
    setReferenceAudios((current) => [
      ...current,
      ...mp3Files.map((file, index) => ({
        id: `reference-${Date.now()}-${index}`,
        name: file.name,
        url: registerUrl(URL.createObjectURL(file), objectUrls),
      })),
    ]);
  }

  function removeReferenceAudio(reference: ReferenceAudio) {
    setReferenceAudios((current) => current.filter((item) => item.id !== reference.id));
    if (objectUrls.current.delete(reference.url)) URL.revokeObjectURL(reference.url);
  }

  function regenerateAudio() {
    if (!description.trim() || isGenerating) return;
    setIsGenerating(true);
    window.setTimeout(() => {
      const nextGeneration = generation + 1;
      const url = registerUrl(
        URL.createObjectURL(createDemoAudioBlob(SOURCE_DURATION, nextGeneration)),
        objectUrls,
      );
      setTracks((current) => {
        if (!isProjectAudio) {
          current.forEach((track) => {
            audioRefs.current[track.id]?.pause();
            previewAudioRefs.current[track.id]?.pause();
            delete audioRefs.current[track.id];
            delete previewAudioRefs.current[track.id];
            if (objectUrls.current.delete(track.url)) URL.revokeObjectURL(track.url);
          });
          return [
            createTrack(
              `generated-${Date.now()}`,
              description.trim(),
              url,
              SOURCE_DURATION,
              0,
              nextGeneration,
            ),
          ];
        }
        const generated = current.find((track) => track.kind === "generated");
        if (!generated)
          return [
            createTrack("generated", name, url, SOURCE_DURATION, 0, nextGeneration),
            ...current,
          ];
        if (objectUrls.current.delete(generated.url)) URL.revokeObjectURL(generated.url);
        return current.map((track) =>
          track.id === generated.id
            ? {
                ...track,
                url,
                name,
                trimStart: 0,
                trimEnd: SOURCE_DURATION,
                cuts: [],
                deletedRanges: [],
                waveform: createWaveform(nextGeneration),
              }
            : track,
        );
      });
      setGeneration(nextGeneration);
      setIsGenerating(false);
    }, 700);
  }

  function handleFileDrag(event: React.DragEvent<HTMLElement>, entering: boolean) {
    event.preventDefault();
    dragDepthRef.current += entering ? 1 : -1;
    if (dragDepthRef.current <= 0) dragDepthRef.current = 0;
    setIsDraggingFile(dragDepthRef.current > 0);
  }

  return (
    <main className="flex h-full min-h-0 flex-col bg-background">
      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section
          className="relative min-h-0 overflow-auto p-5 sm:p-7 lg:border-r"
          onDragEnter={(event) => {
            if (isProjectAudio) handleFileDrag(event, true);
          }}
          onDragOver={(event) => {
            if (isProjectAudio) event.preventDefault();
          }}
          onDragLeave={(event) => {
            if (isProjectAudio) handleFileDrag(event, false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            dragDepthRef.current = 0;
            setIsDraggingFile(false);
            if (isProjectAudio) attachMp3(event.dataTransfer.files);
          }}
        >
          {isProjectAudio && isDraggingFile ? (
            <div className="absolute inset-0 z-40 grid place-items-center bg-background/90 backdrop-blur-sm">
              <div className="text-center">
                <Upload className="mx-auto size-8" />
                <p className="mt-3 text-sm font-semibold">Drop MP3 tracks onto the timeline</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Each file becomes an independent clip
                </p>
              </div>
            </div>
          ) : null}

          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {isProjectAudio ? "Multitrack editor" : "Audio editor"}
              </p>
              <h1 className="mt-1 text-xl font-semibold">
                {isProjectAudio ? "Arrange and overlap audio" : "Edit generated audio"}
              </h1>
            </div>
            {isProjectAudio ? (
              <p className="text-xs text-muted-foreground">
                Drag clips to move · drag edges to stretch
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Set the playhead · split · drag edges to trim
              </p>
            )}
          </div>

          <div className="min-w-[54rem] overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="grid grid-cols-[16rem_minmax(0,1fr)] border-b bg-muted/25">
              <div className="border-r px-3 py-2 text-xs font-medium text-muted-foreground">
                Tracks
              </div>
              <div className="relative flex justify-between px-1 py-2 font-mono text-[0.65rem] text-muted-foreground">
                {ruler.map((second) => (
                  <span key={second}>{second}s</span>
                ))}
              </div>
            </div>
            {tracks.length ? (
              tracks.map((track) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  timeline={timeline}
                  isPreviewing={playingTrackIds.includes(track.id)}
                  audioRef={(element) => {
                    audioRefs.current[track.id] = element;
                  }}
                  onUpdate={(update) => updateTrack(track.id, update)}
                  onPreview={() => void toggleTrackPreview(track)}
                  onSeek={(value) => seek(value)}
                  onDelete={() => deleteTrack(track)}
                />
              ))
            ) : (
              <div className="grid h-40 place-items-center text-sm text-muted-foreground">
                {isProjectAudio
                  ? "Drop an MP3 to add a track."
                  : "Describe the audio you want to generate."}
              </div>
            )}
          </div>

          {isProjectAudio ? (
            <div className="mt-5 min-w-[54rem] rounded-xl border bg-card p-3 shadow-sm">
              <input
                aria-label="Timeline position"
                type="range"
                min="0"
                max={TIMELINE_DURATION}
                step="0.01"
                value={timeline}
                className="h-1.5 w-full cursor-pointer accent-foreground"
                onChange={(event) => seek(Number(event.target.value))}
              />
              <div className="mt-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon-lg"
                    onClick={toggleTransport}
                    aria-label={isPlaying ? "Pause mix" : "Play mix"}
                  >
                    {isPlaying ? <Pause /> : <Play />}
                  </Button>
                  <div>
                    <p className="text-sm font-medium">Play complete mix</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {formatTime(timeline)} / {formatTime(TIMELINE_DURATION)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant={masterMuted ? "secondary" : "ghost"}
                    size="icon-sm"
                    aria-label={masterMuted ? "Unmute master" : "Mute master"}
                    onClick={() => setMasterMuted((value) => !value)}
                  >
                    {masterMuted ? <VolumeX /> : <Volume2 />}
                  </Button>
                  <input
                    aria-label="Master volume"
                    title={`Master volume ${Math.round(masterVolume * 100)}%`}
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={masterVolume}
                    className="w-24 accent-foreground"
                    onChange={(event) => setMasterVolume(Number(event.target.value))}
                  />
                  <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
                    {Math.round(masterVolume * 100)}%
                  </span>
                  <Button
                    variant={masterLoop ? "secondary" : "ghost"}
                    size="icon-sm"
                    aria-label="Loop complete mix"
                    onClick={() => setMasterLoop((value) => !value)}
                  >
                    <Repeat2 />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="Master playback speed"
                      className="flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none data-popup-open:bg-muted data-popup-open:text-foreground"
                    >
                      <Gauge className="size-3.5" />
                      {masterRate}x
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-28">
                      <DropdownMenuRadioGroup
                        value={String(masterRate)}
                        onValueChange={(value) => setMasterRate(Number(value))}
                      >
                        {SPEEDS.map((speed) => (
                          <DropdownMenuRadioItem key={speed} value={String(speed)}>
                            {speed}×
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="flex min-h-0 flex-col border-t bg-muted/15 lg:border-t-0">
          <div className="border-b px-5 py-4">
            <p className="text-sm font-semibold">Regenerate audio</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {isProjectAudio
                ? "Update only the generated track. Imported clips stay in place."
                : "Generate a new result for this audio. The current track will be replaced."}
            </p>
          </div>
          {isProjectAudio ? (
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto p-5">
              <label className="flex min-h-0 flex-1 flex-col gap-2 text-sm font-medium">
                Description
                <Textarea
                  className="min-h-44 flex-1 resize-none bg-background leading-6"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>
              <Button disabled={!description.trim() || isGenerating} onClick={regenerateAudio}>
                <Sparkles
                  data-icon="inline-start"
                  className={isGenerating ? "animate-pulse" : undefined}
                />
                {isGenerating ? "Generating..." : "Regenerate audio"}
              </Button>
            </div>
          ) : (
            <div
              className="relative flex min-h-0 flex-1 flex-col overflow-auto p-5"
              onDragEnter={(event) => {
                event.preventDefault();
                referenceDragDepthRef.current += 1;
                setIsDraggingReference(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => {
                event.preventDefault();
                referenceDragDepthRef.current -= 1;
                if (referenceDragDepthRef.current <= 0) {
                  referenceDragDepthRef.current = 0;
                  setIsDraggingReference(false);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                referenceDragDepthRef.current = 0;
                setIsDraggingReference(false);
                attachReferenceMp3(event.dataTransfer.files);
              }}
            >
              <input
                ref={fileInputRef}
                className="sr-only"
                type="file"
                accept="audio/mpeg,.mp3"
                multiple
                onChange={(event) => {
                  if (event.target.files) attachReferenceMp3(event.target.files);
                  event.target.value = "";
                }}
              />
              <div
                className={`relative overflow-hidden rounded-2xl border bg-background shadow-sm focus-within:ring-3 focus-within:ring-ring/50 ${
                  isDraggingReference ? "border-foreground ring-3 ring-ring/30" : ""
                }`}
              >
                {isDraggingReference ? (
                  <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-background/90 backdrop-blur-sm">
                    <div className="text-center">
                      <Upload className="mx-auto size-6" />
                      <p className="mt-2 text-sm font-semibold">Drop MP3 as reference audio</p>
                    </div>
                  </div>
                ) : null}
                {referenceAudios.length ? (
                  <div className="space-y-2 border-b bg-muted/20 p-3">
                    {referenceAudios.map((reference) => (
                      <ReferenceAudioPreview
                        key={reference.id}
                        reference={reference}
                        onRemove={() => removeReferenceAudio(reference)}
                      />
                    ))}
                  </div>
                ) : null}
                <textarea
                  autoFocus
                  className="min-h-52 w-full resize-none bg-transparent px-4 py-3 text-sm leading-6 outline-none placeholder:text-muted-foreground"
                  placeholder="Describe the audio you want to generate. You can upload or drag an MP3 here for reference."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
                <div className="flex items-center justify-between gap-3 p-3 pt-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus />
                    <span className="sr-only">Attach reference MP3 files</span>
                  </Button>
                  <Button disabled={!description.trim() || isGenerating} onClick={regenerateAudio}>
                    <Sparkles className={isGenerating ? "animate-pulse" : undefined} />
                    {isGenerating ? "Generating..." : "Generate audio"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

function ReferenceAudioPreview({
  reference,
  onRemove,
}: {
  reference: ReferenceAudio;
  onRemove: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  async function togglePreview() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    await audio.play();
    setIsPlaying(true);
  }

  return (
    <div className="rounded-xl border bg-background p-2.5 shadow-xs">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className="shrink-0 rounded-full"
          aria-label={isPlaying ? `Pause ${reference.name}` : `Play ${reference.name}`}
          onClick={() => void togglePreview()}
        >
          {isPlaying ? <Pause /> : <Play />}
        </Button>
        <AudioLines className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-xs font-medium">{reference.name}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Remove ${reference.name}`}
          onClick={onRemove}
        >
          <Trash2 />
        </Button>
      </div>
      <audio
        ref={audioRef}
        preload="metadata"
        src={reference.url}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}

function TrackRow({
  track,
  timeline,
  isPreviewing,
  audioRef,
  onUpdate,
  onPreview,
  onSeek,
  onDelete,
}: {
  track: AudioTrack;
  timeline: number;
  isPreviewing: boolean;
  audioRef: (element: HTMLAudioElement | null) => void;
  onUpdate: (update: Partial<AudioTrack>) => void;
  onPreview: () => void;
  onSeek: (value: number) => void;
  onDelete: () => void;
}) {
  const sourceDuration = getPlayableDuration(track);
  const effectiveDuration = sourceDuration * track.stretch;
  const left = (track.offset / TIMELINE_DURATION) * 100;
  const width = (effectiveDuration / TIMELINE_DURATION) * 100;
  const localProgress = clamp((timeline - track.offset) / effectiveDuration, 0, 1);
  const waveformStart = Math.floor((track.trimStart / track.duration) * track.waveform.length);
  const waveformEnd = Math.max(
    waveformStart + 1,
    Math.ceil((track.trimEnd / track.duration) * track.waveform.length),
  );
  const visibleWaveform = track.waveform
    .slice(waveformStart, waveformEnd)
    .filter((_, index, waveform) => {
      const sourceTime =
        track.trimStart +
        (index / Math.max(1, waveform.length - 1)) * (track.trimEnd - track.trimStart);
      return !track.deletedRanges.some(([start, end]) => sourceTime >= start && sourceTime < end);
    });
  const segmentBoundaries = [
    track.trimStart,
    ...track.cuts.filter((point) => point > track.trimStart && point < track.trimEnd),
    track.trimEnd,
  ];
  const segments = segmentBoundaries
    .slice(0, -1)
    .map((start, index) => ({ start, end: segmentBoundaries[index + 1] }))
    .filter(
      (segment) =>
        !track.deletedRanges.some(([start, end]) => start === segment.start && end === segment.end),
    );
  const [durationInput, setDurationInput] = useState(effectiveDuration.toFixed(1));
  const [selectedSegment, setSelectedSegment] = useState(0);
  const activeSegment = segments[Math.min(selectedSegment, segments.length - 1)];

  useEffect(() => {
    setDurationInput(effectiveDuration.toFixed(1));
  }, [effectiveDuration]);

  useEffect(() => {
    if (selectedSegment >= segments.length) setSelectedSegment(Math.max(0, segments.length - 1));
  }, [segments.length, selectedSegment]);

  function commitDuration() {
    const parsedDuration = Number(durationInput);
    const maxDuration = Math.min(sourceDuration * 2, TIMELINE_DURATION - track.offset);
    const nextDuration = clamp(
      Number.isFinite(parsedDuration) ? parsedDuration : effectiveDuration,
      sourceDuration * 0.5,
      maxDuration,
    );
    setDurationInput(nextDuration.toFixed(1));
    onUpdate({ stretch: nextDuration / sourceDuration });
  }

  function beginMove(event: React.PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).dataset.resize) return;
    event.preventDefault();
    const element = event.currentTarget;
    const lane = element.parentElement;
    if (!lane) return;
    const laneWidth = lane.clientWidth;
    element.setPointerCapture(event.pointerId);
    const startX = event.clientX;
    const startOffset = track.offset;

    function move(pointerEvent: PointerEvent) {
      const delta = ((pointerEvent.clientX - startX) / laneWidth) * TIMELINE_DURATION;
      onUpdate({ offset: clamp(startOffset + delta, 0, TIMELINE_DURATION - effectiveDuration) });
    }
    function stop(pointerEvent: PointerEvent) {
      element.releasePointerCapture(pointerEvent.pointerId);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", stop);
    }
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", stop);
  }

  function beginResize(event: React.PointerEvent<HTMLButtonElement>, side: "left" | "right") {
    event.preventDefault();
    event.stopPropagation();
    const element = event.currentTarget;
    const lane = element.parentElement?.parentElement;
    if (!lane) return;
    const laneWidth = lane.clientWidth;
    element.setPointerCapture(event.pointerId);
    const startX = event.clientX;
    const startOffset = track.offset;
    const startTrimStart = track.trimStart;
    const startTrimEnd = track.trimEnd;

    function move(pointerEvent: PointerEvent) {
      const delta = ((pointerEvent.clientX - startX) / laneWidth) * TIMELINE_DURATION;
      const sourceDelta = delta / track.stretch;
      if (side === "right") {
        onUpdate({
          trimEnd: clamp(startTrimEnd + sourceDelta, startTrimStart + 0.1, track.duration),
        });
      } else {
        const nextTrimStart = clamp(startTrimStart + sourceDelta, 0, startTrimEnd - 0.1);
        onUpdate({
          trimStart: nextTrimStart,
          offset: clamp(
            startOffset + (nextTrimStart - startTrimStart) * track.stretch,
            0,
            TIMELINE_DURATION - 0.1,
          ),
        });
      }
    }
    function stop(pointerEvent: PointerEvent) {
      element.releasePointerCapture(pointerEvent.pointerId);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", stop);
    }
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", stop);
  }

  function beginScrub(event: React.PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget;
    const lane = handle.parentElement;
    if (!lane) return;
    const rect = lane.getBoundingClientRect();
    handle.setPointerCapture(event.pointerId);

    function update(clientX: number) {
      onSeek(clamp(((clientX - rect.left) / rect.width) * TIMELINE_DURATION, 0, 30));
    }

    function move(pointerEvent: PointerEvent) {
      update(pointerEvent.clientX);
    }

    function stop(pointerEvent: PointerEvent) {
      update(pointerEvent.clientX);
      handle.releasePointerCapture(pointerEvent.pointerId);
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", stop);
    }

    update(event.clientX);
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", stop);
  }

  return (
    <div className="grid grid-cols-[16rem_minmax(0,1fr)] border-b last:border-b-0">
      <div className="flex min-w-0 flex-col justify-between gap-2 border-r p-3">
        <div className="flex min-w-0 items-center gap-2">
          <AudioLines className="size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">{track.name}</p>
            <p className="text-[0.65rem] text-muted-foreground">
              {track.offset.toFixed(1)}s · {(1 / track.stretch).toFixed(2)}×
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-0.5 gap-y-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={isPreviewing ? `Pause ${track.name}` : `Play ${track.name}`}
            onClick={onPreview}
          >
            {isPreviewing ? <Pause /> : <Play />}
          </Button>
          <div className="group relative">
            <Button
              variant={track.muted ? "secondary" : "ghost"}
              size="icon-sm"
              aria-label={track.muted ? `Unmute ${track.name}` : `Mute ${track.name}`}
              onClick={() =>
                onUpdate(
                  track.muted
                    ? { muted: false, volume: track.volume === 0 ? 1 : track.volume }
                    : { muted: true },
                )
              }
            >
              {track.muted ? <VolumeX /> : <Volume2 />}
            </Button>
            <div className="pointer-events-none absolute bottom-full left-1/2 z-30 -translate-x-1/2 pb-2 opacity-0 transition-opacity duration-100 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:duration-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-focus-within:duration-0">
              <div className="flex flex-col items-center gap-1.5 rounded-lg border bg-popover px-2 py-2 text-popover-foreground shadow-md">
                <input
                  aria-label={`${track.name} volume`}
                  title={`${Math.round(track.volume * 100)}%`}
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={track.volume}
                  className="h-14 w-2 cursor-pointer accent-foreground"
                  style={{ writingMode: "vertical-lr", direction: "rtl" }}
                  onChange={(event) => {
                    const volume = Number(event.target.value);
                    onUpdate({ volume, muted: volume === 0 });
                  }}
                />
                <span className="text-xs tabular-nums text-muted-foreground">
                  {Math.round(track.volume * 100)}%
                </span>
              </div>
            </div>
          </div>
          <Button
            variant={track.loop ? "secondary" : "ghost"}
            size="icon-sm"
            aria-label={`Loop ${track.name}`}
            onClick={() => onUpdate({ loop: !track.loop })}
          >
            <Repeat2 />
          </Button>
          <div className="flex items-center rounded-md border bg-background p-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={`Split ${track.name} at playhead`}
              title="Split at playhead"
              onClick={() => {
                const sourcePoint = playableToSourceTime(
                  (timeline - track.offset) / track.stretch,
                  track,
                );
                if (sourcePoint <= track.trimStart + 0.1 || sourcePoint >= track.trimEnd - 0.1)
                  return;
                if (track.cuts.some((point) => Math.abs(point - sourcePoint) < 0.1)) return;
                const cuts = [...track.cuts, sourcePoint].sort((a, b) => a - b);
                onUpdate({ cuts });
                setSelectedSegment(cuts.filter((point) => point < sourcePoint).length);
              }}
            >
              <Scissors />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="hover:text-destructive"
              aria-label="Delete selected segment"
              title="Delete selected segment"
              disabled={!activeSegment}
              onClick={() => {
                if (!activeSegment) return;
                if (segments.length === 1) return onDelete();
                if (selectedSegment === 0) {
                  onUpdate({
                    trimStart: activeSegment.end,
                    cuts: track.cuts.filter((point) => point > activeSegment.end),
                  });
                  setSelectedSegment(0);
                } else if (selectedSegment === segments.length - 1) {
                  onUpdate({
                    trimEnd: activeSegment.start,
                    cuts: track.cuts.filter((point) => point < activeSegment.start),
                  });
                  setSelectedSegment(selectedSegment - 1);
                } else {
                  onUpdate({
                    deletedRanges: [
                      ...track.deletedRanges,
                      [activeSegment.start, activeSegment.end],
                    ],
                  });
                  setSelectedSegment(Math.max(0, selectedSegment - 1));
                }
              }}
            >
              <Trash2 />
            </Button>
          </div>
          <label
            className="flex h-8 items-center gap-0.5 rounded-md px-1.5 text-muted-foreground transition-colors hover:bg-muted"
            title="Set target duration"
          >
            <Clock3 className="size-3 text-muted-foreground" />
            <input
              aria-label={`${track.name} target duration in seconds`}
              type="number"
              min={(sourceDuration * 0.5).toFixed(1)}
              max={Math.min(sourceDuration * 2, TIMELINE_DURATION - track.offset).toFixed(1)}
              step="0.1"
              inputMode="decimal"
              className="w-8 appearance-none bg-transparent text-left text-xs tabular-nums text-foreground outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              value={durationInput}
              onChange={(event) => setDurationInput(event.target.value)}
              onBlur={commitDuration}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
            />
            <span className="text-[0.65rem]">s</span>
          </label>
        </div>
      </div>

      <div
        className="relative h-28 overflow-hidden bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px)] bg-[length:16.666%_100%]"
        onPointerDown={(event) => {
          if (event.target !== event.currentTarget) return;
          const rect = event.currentTarget.getBoundingClientRect();
          onSeek(clamp(((event.clientX - rect.left) / rect.width) * TIMELINE_DURATION, 0, 30));
        }}
      >
        <button
          type="button"
          aria-label="Drag playhead"
          className="absolute bottom-0 top-0 z-30 w-3 -translate-x-1/2 cursor-ew-resize touch-none bg-transparent p-0"
          style={{ left: `${(timeline / TIMELINE_DURATION) * 100}%` }}
          onPointerDown={beginScrub}
        >
          <span className="absolute bottom-0 left-1/2 top-2 w-px -translate-x-1/2 bg-foreground/60" />
          <span className="absolute left-1/2 top-0 size-2.5 -translate-x-1/2 rounded-sm bg-foreground shadow-sm" />
        </button>
        <div
          className="absolute top-3 flex h-[5.5rem] cursor-grab touch-none select-none items-center gap-0.5 overflow-hidden rounded-lg border border-foreground/20 bg-foreground/8 px-3 shadow-sm active:cursor-grabbing"
          style={{ left: `${left}%`, width: `${width}%` }}
          onPointerDown={beginMove}
        >
          <button
            data-resize="true"
            type="button"
            aria-label={`Trim start of ${track.name}`}
            className="absolute bottom-0 left-0 top-0 z-10 w-3 cursor-ew-resize bg-foreground/25 hover:bg-foreground/40"
            onPointerDown={(event) => beginResize(event, "left")}
          />
          {visibleWaveform.map((height, index) => (
            <span
              key={index}
              className="min-w-0 flex-1 rounded-full"
              style={{
                height: `${height}%`,
                background:
                  index / visibleWaveform.length <= localProgress
                    ? "var(--foreground)"
                    : "var(--muted-foreground)",
                opacity: index / visibleWaveform.length <= localProgress ? 0.9 : 0.35,
              }}
            />
          ))}
          {track.cuts
            .filter(
              (point) =>
                point > track.trimStart &&
                point < track.trimEnd &&
                !track.deletedRanges.some(([start, end]) => point > start && point <= end),
            )
            .map((point) => (
              <span
                key={point}
                className="pointer-events-none absolute bottom-0 top-0 z-10 w-0.5 bg-background shadow-[0_0_0_1px_var(--foreground)]"
                style={{ left: `${(sourceToPlayableTime(point, track) / sourceDuration) * 100}%` }}
              />
            ))}
          {segments.map((segment, index) => {
            const segmentStart = sourceToPlayableTime(segment.start, track);
            return (
              <button
                key={`${segment.start}-${segment.end}`}
                data-resize="true"
                type="button"
                aria-label={`Select segment ${index + 1}`}
                className={`absolute bottom-1 top-1 z-[5] border transition-colors ${
                  selectedSegment === index
                    ? "border-transparent bg-foreground/8"
                    : "border-transparent hover:bg-foreground/5"
                }`}
                style={{
                  left: `${(segmentStart / sourceDuration) * 100}%`,
                  width: `${((segment.end - segment.start) / sourceDuration) * 100}%`,
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedSegment(index);
                }}
              />
            );
          })}
          <button
            data-resize="true"
            type="button"
            aria-label={`Trim end of ${track.name}`}
            className="absolute bottom-0 right-0 top-0 z-10 w-3 cursor-ew-resize bg-foreground/25 hover:bg-foreground/40"
            onPointerDown={(event) => beginResize(event, "right")}
          />
        </div>
      </div>
      <audio
        ref={audioRef}
        src={track.url}
        preload="auto"
        onLoadedMetadata={(event) => {
          if (track.kind === "imported" && Number.isFinite(event.currentTarget.duration))
            onUpdate({
              duration: event.currentTarget.duration,
              trimEnd: event.currentTarget.duration,
            });
        }}
        onPlay={() => undefined}
      />
    </div>
  );
}

function createTrack(
  id: string,
  name: string,
  url: string,
  duration: number,
  offset: number,
  seed: number,
  kind: AudioTrack["kind"] = "generated",
): AudioTrack {
  return {
    id,
    name,
    url,
    duration,
    trimStart: 0,
    trimEnd: duration,
    offset,
    stretch: 1,
    loop: false,
    muted: false,
    volume: 1,
    waveform: createWaveform(seed),
    cuts: [],
    deletedRanges: [],
    kind,
  };
}

function createWaveform(seed: number) {
  return Array.from({ length: 64 }, (_, index) =>
    Math.round(
      18 + Math.abs(Math.sin(index * 0.39 + seed) * 52 + Math.cos(index * 0.17 + seed * 0.4) * 16),
    ),
  );
}

function getPlayableDuration(track: AudioTrack) {
  return Math.max(
    0.1,
    track.trimEnd -
      track.trimStart -
      track.deletedRanges.reduce(
        (total, [start, end]) =>
          total + Math.max(0, Math.min(end, track.trimEnd) - Math.max(start, track.trimStart)),
        0,
      ),
  );
}

function sourceToPlayableTime(sourceTime: number, track: AudioTrack) {
  const clampedTime = clamp(sourceTime, track.trimStart, track.trimEnd);
  const removedBefore = track.deletedRanges.reduce((total, [start, end]) => {
    if (clampedTime <= start) return total;
    return total + Math.max(0, Math.min(clampedTime, end) - Math.max(track.trimStart, start));
  }, 0);
  return Math.max(0, clampedTime - track.trimStart - removedBefore);
}

function playableToSourceTime(playableTime: number, track: AudioTrack) {
  let sourceTime = track.trimStart + Math.max(0, playableTime);
  for (const [start, end] of [...track.deletedRanges].sort((a, b) => a[0] - b[0])) {
    if (sourceTime < start) break;
    sourceTime += end - start;
  }
  return Math.min(sourceTime, track.trimEnd);
}

function syncTracksAt(
  time: number,
  tracks: AudioTrack[],
  refs: Record<string, HTMLAudioElement | null>,
  shouldPlay: boolean,
  masterRate: number,
  masterVolume: number,
  masterMuted: boolean,
) {
  tracks.forEach((track) => {
    const audio = refs[track.id];
    if (!audio || !Number.isFinite(audio.duration)) return;
    const sourceDuration = getPlayableDuration(track);
    const effectiveDuration = sourceDuration * track.stretch;
    let localTime = time - track.offset;
    if (track.loop && localTime >= 0) localTime %= effectiveDuration;
    if (localTime < 0 || localTime >= effectiveDuration) {
      audio.pause();
      return;
    }
    const sourceTime = clamp(
      playableToSourceTime(localTime / track.stretch, track),
      track.trimStart,
      Math.min(track.trimEnd, Math.max(0, audio.duration - 0.01)),
    );
    if (Math.abs(audio.currentTime - sourceTime) > 0.12) audio.currentTime = sourceTime;
    audio.playbackRate = (1 / track.stretch) * masterRate;
    audio.volume = track.volume * masterVolume;
    audio.muted = track.muted || masterMuted;
    audio.loop = track.loop;
    if (shouldPlay && audio.paused) void audio.play();
  });
}

function pauseAll(refs: Record<string, HTMLAudioElement | null>) {
  Object.values(refs).forEach((audio) => audio?.pause());
}

function registerUrl(url: string, urls: React.RefObject<Set<string>>) {
  urls.current.add(url);
  return url;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function formatTime(seconds: number) {
  return `0:${Math.floor(seconds).toString().padStart(2, "0")}`;
}

function createDemoAudioBlob(duration: number, variation: number) {
  const sampleRate = 8000;
  const sampleCount = sampleRate * duration;
  const buffer = new ArrayBuffer(44 + sampleCount * 2);
  const view = new DataView(buffer);
  writeText(view, 0, "RIFF");
  view.setUint32(4, 36 + sampleCount * 2, true);
  writeText(view, 8, "WAVE");
  writeText(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(view, 36, "data");
  view.setUint32(40, sampleCount * 2, true);
  const notes = [220, 277.18, 329.63, 415.3, 329.63, 277.18, 246.94, 220];
  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate;
    const beat = (Math.floor(time * 2) + variation) % notes.length;
    const progress = (time * 2) % 1;
    const envelope = Math.min(1, progress * 12) * Math.max(0, 1 - progress * 0.72);
    const sample =
      Math.sin(2 * Math.PI * notes[beat] * time) * 0.22 +
      Math.sin(2 * Math.PI * (notes[beat] / 2) * time) * 0.08;
    view.setInt16(44 + index * 2, sample * envelope * 32767, true);
  }
  return new Blob([view], { type: "audio/wav" });
}

function writeText(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1)
    view.setUint8(offset + index, value.charCodeAt(index));
}
