import {
  Gauge,
  Music2,
  Pause,
  Play,
  Plus,
  Repeat2,
  Scissors,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";

import { useAudioStudio } from "./useAudioStudio";

export function AudioStudioScreen() {
  const {
    addTrack,
    generateVariation,
    masterMuted,
    playing,
    prompt,
    removeTrack,
    setPrompt,
    setTime,
    time,
    toggleMasterMuted,
    togglePlaying,
    toggleTrack,
    tracks,
  } = useAudioStudio();
  return (
    <main className="audio-page">
      <header className="audio-heading">
        <div>
          <p className="eyebrow">Audio asset type</p>
          <h1>Sound studio</h1>
          <p>
            Arrange generated and uploaded sounds directly against an asset
            timeline.
          </p>
        </div>
        <button className="button">
          <Plus size={16} /> Upload MP3
        </button>
      </header>
      <div className="audio-layout">
        <section className="timeline-panel">
          <div className="timeline-top">
            <div>
              <span className="eyebrow">Multitrack editor</span>
              <strong>Moonlit Orchard soundscape</strong>
            </div>
            <div className="transport">
              <button
                className="play-button"
                onClick={togglePlaying}
                aria-label={playing ? "Pause mix" : "Play mix"}
              >
                {playing ? <Pause size={19} /> : <Play size={19} />}
              </button>
              <span>{time.toFixed(1)}s / 90s</span>
              <button
                className={
                  masterMuted
                    ? "icon-button icon-button--active"
                    : "icon-button"
                }
                onClick={toggleMasterMuted}
              >
                {masterMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <button className="icon-button">
                <Gauge size={16} />
              </button>
            </div>
          </div>
          <div className="timeline-ruler">
            <span>0s</span>
            <span>15s</span>
            <span>30s</span>
            <span>45s</span>
            <span>60s</span>
            <span>75s</span>
            <span>90s</span>
          </div>
          <div className="track-list">
            {tracks.map((track) => (
              <div className="track-row" key={track.id}>
                <div className="track-controls">
                  <Music2 size={16} />
                  <span>
                    <strong>{track.name}</strong>
                    <small>
                      {track.offset}s / {track.length}s
                    </small>
                  </span>
                  <button
                    className={
                      track.muted
                        ? "mini-button mini-button--active"
                        : "mini-button"
                    }
                    onClick={() => toggleTrack(track.id, "muted")}
                  >
                    {track.muted ? (
                      <VolumeX size={14} />
                    ) : (
                      <Volume2 size={14} />
                    )}
                  </button>
                  <button
                    className={
                      track.loop
                        ? "mini-button mini-button--active"
                        : "mini-button"
                    }
                    onClick={() => toggleTrack(track.id, "loop")}
                  >
                    <Repeat2 size={14} />
                  </button>
                  <button className="mini-button">
                    <Scissors size={14} />
                  </button>
                  <button
                    className="mini-button mini-button--danger"
                    onClick={() => removeTrack(track.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="track-lane">
                  <span
                    className="playhead"
                    style={{ left: `${(time / 90) * 100}%` }}
                  />
                  <button
                    className={`audio-clip audio-clip--${track.tone}`}
                    style={{
                      left: `${(track.offset / 90) * 100}%`,
                      width: `${(track.length / 90) * 100}%`,
                    }}
                    onClick={() => setTime(track.offset)}
                  >
                    {Array.from({ length: 30 }, (_, index) => (
                      <i
                        key={index}
                        style={{ height: `${18 + ((index * 17) % 58)}%` }}
                      />
                    ))}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="add-track" onClick={addTrack}>
            <Plus size={16} /> Add track
          </button>
        </section>
        <aside className="audio-generate">
          <p className="eyebrow">Generate audio</p>
          <h2>Give the mix a new cue.</h2>
          <p>
            Use reference tracks and timing controls after generation completes.
          </p>
          <label>
            Prompt
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
          </label>
          <label>
            Duration
            <select defaultValue="30">
              <option value="15">15 seconds</option>
              <option value="30">30 seconds</option>
              <option value="60">60 seconds</option>
            </select>
          </label>
          <button
            className="button button--primary button--wide"
            onClick={generateVariation}
          >
            <Sparkles size={16} /> Generate variation
          </button>
          <div className="reference-drop">
            <Plus size={16} /> Drop or attach a reference MP3
          </div>
        </aside>
      </div>
    </main>
  );
}
