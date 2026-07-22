import { useEffect, useState } from "react";

import { initialAudioTracks } from "./AudioStudio.constants";

export function useAudioStudio() {
  const [tracks, setTracks] = useState(initialAudioTracks);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(18);
  const [prompt, setPrompt] = useState(
    "Soft nighttime orchard ambience with distant insects and a warm melodic loop.",
  );
  const [masterMuted, setMasterMuted] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setTime((value) => (value >= 90 ? 0 : value + 0.2)),
      200,
    );
    return () => window.clearInterval(timer);
  }, [playing]);

  function toggleTrack(id: string, key: "muted" | "loop") {
    setTracks((current) =>
      current.map((track) =>
        track.id === id ? { ...track, [key]: !track[key] } : track,
      ),
    );
  }

  function removeTrack(id: string) {
    setTracks((current) => current.filter((track) => track.id !== id));
  }

  function addTrack() {
    setTracks((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: "new-reference.mp3",
        offset: 10,
        length: 18,
        tone: "rose",
        muted: false,
        loop: false,
      },
    ]);
  }

  function generateVariation() {
    setTracks((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: "generated-variation.wav",
        offset: Math.min(70, current.length * 14),
        length: 16,
        tone: "blue",
        muted: false,
        loop: false,
      },
    ]);
  }

  return {
    addTrack,
    generateVariation,
    masterMuted,
    playing,
    prompt,
    removeTrack,
    setPrompt,
    setTime,
    time,
    toggleMasterMuted: () => setMasterMuted((value) => !value),
    togglePlaying: () => setPlaying((value) => !value),
    toggleTrack,
    tracks,
  };
}
