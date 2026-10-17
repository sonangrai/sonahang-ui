import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode, Ref } from "react";

import { AudioPlayer } from "./AudioPlayer";
import type { AudioPlayerLabels } from "./AudioPlayer";
import { formatAudioTime } from "./formatAudioTime";
import { getNextTrack, getPreviousTrack, playModes } from "./playlistOrder";
import type { PlayMode, PlaylistStep } from "./playlistOrder";
import "./AudioPlaylist.css";

const iconProps = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const modeIcons: Record<PlayMode, ReactNode> = {
  sequential: (
    <svg {...iconProps}>
      <path d="M2.5 4.5h8M2.5 8h8M2.5 11.5h5M11 10l2 1.5-2 1.5" />
    </svg>
  ),
  "repeat-all": (
    <svg {...iconProps}>
      <path d="M3 7V6a2 2 0 0 1 2-2h7.5M10.5 2l2 2-2 2M13 9v1a2 2 0 0 1-2 2H3.5M5.5 14l-2-2 2-2" />
    </svg>
  ),
  "repeat-one": (
    <svg {...iconProps}>
      <path d="M3 7V6a2 2 0 0 1 2-2h7.5M10.5 2l2 2-2 2M13 9v1a2 2 0 0 1-2 2H3.5M5.5 14l-2-2 2-2" />
      <path d="M7.5 7.5 8.5 7v3" strokeWidth="1.3" />
    </svg>
  ),
  shuffle: (
    <svg {...iconProps}>
      <path d="M2.5 4.5h2c3 0 4 7 7 7h2M2.5 11.5h2c1.2 0 2-1 2.6-2.2M9 6.7c.6-1.2 1.4-2.2 2.5-2.2h2M12 3l1.5 1.5L12 6M12 10l1.5 1.5L12 13" />
    </svg>
  ),
};

/** Animated bars marking the track that's playing. */
const EqualizerIcon = () => (
  <span className="sh-playlist__equalizer" aria-hidden="true">
    <span />
    <span />
    <span />
  </span>
);

export type AudioTrack = {
  src: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /**
   * Length in seconds, shown in the track list. Optional — the player learns
   * it once a track loads, but the list can't without loading every file.
   */
  duration?: number;
  /** Stable key. Falls back to the index and `src`. */
  id?: string;
};

export type AudioPlaylistLabels = AudioPlayerLabels & {
  /** Prefix for the play-mode button's name, e.g. "Play mode: Shuffle". */
  playMode?: string;
  /** Names of the individual modes. */
  modes?: Partial<Record<PlayMode, string>>;
  /** Name of the track list. */
  tracks?: string;
};

export type AudioPlaylistProps = {
  tracks: readonly AudioTrack[];
  /** Names the playlist as a whole. Defaults to "Playlist". */
  label?: string;
  /** Current track — makes the playlist's position controlled. */
  trackIndex?: number;
  /** Initial track when uncontrolled. Defaults to the first. */
  defaultTrackIndex?: number;
  /** Fired with the index of the track being moved to. */
  onTrackChange?: (index: number) => void;
  /** Current play mode — makes it controlled. */
  playMode?: PlayMode;
  /** Initial play mode when uncontrolled. Defaults to `sequential`. */
  defaultPlayMode?: PlayMode;
  /** Fired with the next mode when the play-mode button is pressed. */
  onPlayModeChange?: (mode: PlayMode) => void;
  /** Hides the track list, leaving the player and its skip buttons. */
  hideTrackList?: boolean;
  hideVolume?: boolean;
  /** Initial volume, 0–1. Carries across tracks. */
  defaultVolume?: number;
  labels?: AudioPlaylistLabels;
  className?: string;
  /** Ref to the underlying `<audio>` element. */
  ref?: Ref<HTMLAudioElement>;
};

const defaultModeLabels: Record<PlayMode, string> = {
  sequential: "In order",
  "repeat-all": "Repeat all",
  "repeat-one": "Repeat one",
  shuffle: "Shuffle",
};

/** Previous restarts the track instead once it's this far in, in seconds. */
const RESTART_THRESHOLD = 3;

/**
 * An `AudioPlayer` that works through a list of tracks, with Previous/Next,
 * a play-mode button cycling through in order, repeat all, repeat one and
 * shuffle, and a track list to jump around in.
 *
 * Volume and mute carry from track to track — it's one `<audio>` element
 * whose source changes, not a player per track.
 */
export function AudioPlaylist({
  tracks,
  label = "Playlist",
  trackIndex,
  defaultTrackIndex = 0,
  onTrackChange,
  playMode,
  defaultPlayMode = "sequential",
  onPlayModeChange,
  hideTrackList = false,
  hideVolume,
  defaultVolume,
  labels,
  className,
  ref,
}: AudioPlaylistProps) {
  const modeLabels = { ...defaultModeLabels, ...labels?.modes };
  const playModeLabel = labels?.playMode ?? "Play mode";
  const tracksLabel = labels?.tracks ?? "Tracks";

  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultTrackIndex);
  const [uncontrolledMode, setUncontrolledMode] = useState(defaultPlayMode);
  const count = tracks.length;
  const index = Math.min(Math.max(trackIndex ?? uncontrolledIndex, 0), Math.max(count - 1, 0));
  const mode = playMode ?? uncontrolledMode;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  // The shuffle order lives across steps but never affects what's rendered.
  const orderRef = useRef<number[]>([]);
  // Set when a track change should carry on playing once the new source is in.
  const playAfterChange = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [shownIndex, setShownIndex] = useState(index);
  if (index !== shownIndex) {
    // Same reset AudioPlayer does: the new track hasn't started yet.
    setShownIndex(index);
    setIsPlaying(false);
  }

  const setAudio = useCallback(
    (node: HTMLAudioElement | null) => {
      audioRef.current = node;
      if (typeof ref === "function") return ref(node);
      if (ref) ref.current = node;
    },
    [ref],
  );

  // Runs after the new `src` is committed, so play() applies to the new track.
  useEffect(() => {
    if (!playAfterChange.current) return;
    playAfterChange.current = false;
    audioRef.current?.play()?.catch(() => {});
  }, [index]);

  if (count === 0) return null;

  const track = tracks[index];
  const isPaused = () => audioRef.current?.paused ?? true;

  const goTo = (next: number, play: boolean) => {
    const audio = audioRef.current;

    // Same track — no source change to wait for, e.g. repeat-all over one track.
    if (next === index) {
      if (audio) audio.currentTime = 0;
      if (play) audio?.play()?.catch(() => {});
      return;
    }

    playAfterChange.current = play;
    if (trackIndex === undefined) setUncontrolledIndex(next);
    onTrackChange?.(next);
  };

  const step = ({ index: next, order }: PlaylistStep, play: boolean) => {
    orderRef.current = order;
    if (next !== null) goTo(next, play);
  };

  const position = () => ({ index, count, mode, order: orderRef.current });

  const handleNext = () => step(getNextTrack(position(), "next"), !isPaused());

  const handlePrevious = () => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > RESTART_THRESHOLD) {
      audio.currentTime = 0;
      return;
    }
    step(getPreviousTrack(position()), !isPaused());
  };

  // Repeat-one never gets here: it's the element's own `loop`, which is
  // seamless where restarting on `ended` leaves an audible gap.
  const handleEnded = () => step(getNextTrack(position(), "ended"), true);

  const cycleMode = () => {
    const next = playModes[(playModes.indexOf(mode) + 1) % playModes.length];
    if (playMode === undefined) setUncontrolledMode(next);
    onPlayModeChange?.(next);
  };

  const selectTrack = (i: number) => {
    const audio = audioRef.current;
    if (i !== index) return goTo(i, true);
    // The current track's row doubles as its play/pause.
    if (audio?.paused) audio.play()?.catch(() => {});
    else audio?.pause();
  };

  const modeButton = (
    <button
      type="button"
      className={[
        "sh-playlist__mode",
        mode !== "sequential" && "sh-playlist__mode--active",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={`${playModeLabel}: ${modeLabels[mode]}`}
      onClick={cycleMode}
    >
      {modeIcons[mode]}
    </button>
  );

  return (
    <div
      className={["sh-playlist", className].filter(Boolean).join(" ")}
      role="group"
      aria-label={label}
    >
      <AudioPlayer
        ref={setAudio}
        src={track.src}
        title={track.title}
        subtitle={track.subtitle}
        hideVolume={hideVolume}
        defaultVolume={defaultVolume}
        labels={labels}
        loop={mode === "repeat-one"}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        actions={modeButton}
      />

      {!hideTrackList && (
        <ol className="sh-playlist__tracks" aria-label={tracksLabel}>
          {tracks.map((item, i) => {
            const current = i === index;

            return (
              <li key={item.id ?? `${i}-${item.src}`}>
                <button
                  type="button"
                  className="sh-playlist__track"
                  aria-current={current || undefined}
                  onClick={() => selectTrack(i)}
                >
                  <span className="sh-playlist__marker">
                    {current && isPlaying ? <EqualizerIcon /> : i + 1}
                  </span>
                  <span className="sh-playlist__text">
                    <span className="sh-playlist__title">{item.title}</span>
                    {item.subtitle && (
                      <span className="sh-playlist__subtitle">{item.subtitle}</span>
                    )}
                  </span>
                  {item.duration !== undefined && (
                    <span className="sh-playlist__duration">{formatAudioTime(item.duration)}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
