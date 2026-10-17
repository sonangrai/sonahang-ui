import { useCallback, useRef, useState } from "react";
import type { AudioHTMLAttributes, ReactNode, Ref, SyntheticEvent } from "react";

import { RangeSlider } from "../RangeSlider";
import { formatAudioTime } from "./formatAudioTime";
import "./AudioPlayer.css";

const PlayIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M5.5 3.4a.6.6 0 0 1 .92-.51l6.1 4.1a.6.6 0 0 1 0 1l-6.1 4.1a.6.6 0 0 1-.92-.5Z" />
  </svg>
);

const PauseIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <rect x="4" y="3" width="3" height="10" rx="1" />
    <rect x="9" y="3" width="3" height="10" rx="1" />
  </svg>
);

const PreviousIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <rect x="3" y="3.5" width="1.6" height="9" rx="0.8" />
    <path d="M12.5 3.9a.6.6 0 0 0-.92-.5L6 7.5a.6.6 0 0 0 0 1l5.58 4.1a.6.6 0 0 0 .92-.5Z" />
  </svg>
);

const NextIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <rect x="11.4" y="3.5" width="1.6" height="9" rx="0.8" />
    <path d="M3.5 3.9a.6.6 0 0 1 .92-.5L10 7.5a.6.6 0 0 1 0 1l-5.58 4.1a.6.6 0 0 1-.92-.5Z" />
  </svg>
);

const VolumeIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2.5 6h2l3-2.5v9L4.5 10h-2Z" fill="currentColor" />
    <path d="M10.5 5.5a3.5 3.5 0 0 1 0 5" />
    <path d="M12.5 3.5a6.3 6.3 0 0 1 0 9" />
  </svg>
);

const MutedIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2.5 6h2l3-2.5v9L4.5 10h-2Z" fill="currentColor" />
    <path d="m10.5 6 4 4M14.5 6l-4 4" />
  </svg>
);

export type AudioPlayerLabels = {
  play?: string;
  pause?: string;
  previous?: string;
  next?: string;
  seek?: string;
  mute?: string;
  unmute?: string;
  volume?: string;
  /** Shown in place of the controls when the source fails to load. */
  error?: string;
};

export type AudioPlayerProps = {
  /** URL of the audio file. */
  src: string;
  /** Track name, shown above the controls. Also names the player region. */
  title?: ReactNode;
  /** Secondary line under the title — an artist, show, or episode. */
  subtitle?: ReactNode;
  /** Hides the volume controls, e.g. where the OS volume is all that matters. */
  hideVolume?: boolean;
  /** Initial volume, 0–1. Defaults to 1. */
  defaultVolume?: number;
  /** Accessible names for the controls — override to localise. */
  labels?: AudioPlayerLabels;
  /** Renders a Previous button beside Play. Omit for a single track. */
  onPrevious?: () => void;
  /** Renders a Next button beside Play. Omit for a single track. */
  onNext?: () => void;
  /** Extra controls, placed in the control row before the volume. */
  actions?: ReactNode;
  /** Class for the wrapper element. */
  className?: string;
  /** Ref to the underlying `<audio>` element, for imperative control. */
  ref?: Ref<HTMLAudioElement>;
} & Omit<AudioHTMLAttributes<HTMLAudioElement>, "src" | "title" | "className" | "controls">;

const defaultLabels: Required<AudioPlayerLabels> = {
  play: "Play",
  pause: "Pause",
  previous: "Previous track",
  next: "Next track",
  seek: "Seek",
  mute: "Mute",
  unmute: "Unmute",
  volume: "Volume",
  error: "This audio couldn't be loaded.",
};

/** Calls the consumer's media handler, then ours. */
function chain<E extends SyntheticEvent<HTMLAudioElement>>(
  theirs: ((event: E) => void) | undefined,
  ours: (event: E) => void,
) {
  return (event: E) => {
    theirs?.(event);
    ours(event);
  };
}

/**
 * Custom controls over a native `<audio>` element.
 *
 * The element stays the source of truth: playing, position, and volume are
 * read back from its media events rather than tracked alongside it, so the UI
 * can't drift from what's actually playing — even when something else drives
 * the element through `ref`. The seek and volume bars are `RangeSlider`s, so
 * arrow keys, Home/End, and screen-reader announcements come from the platform.
 */
export function AudioPlayer({
  src,
  title,
  subtitle,
  hideVolume = false,
  defaultVolume = 1,
  labels,
  onPrevious,
  onNext,
  actions,
  className,
  ref,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onLoadedMetadata,
  onDurationChange,
  onVolumeChange,
  onError,
  ...props
}: AudioPlayerProps) {
  const text = { ...defaultLabels, ...labels };

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(Number.NaN);
  const [volume, setVolume] = useState(defaultVolume);
  const [muted, setMuted] = useState(Boolean(props.muted));
  const [failed, setFailed] = useState(false);

  // A new source starts from nothing. Reset during render rather than waiting
  // for the element's `emptied` event, so the old track's position and length
  // never flash up against the new title.
  const [loadedSrc, setLoadedSrc] = useState(src);
  if (src !== loadedSrc) {
    setLoadedSrc(src);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(Number.NaN);
    setFailed(false);
  }

  // Hand the element to both our ref and the consumer's.
  const setAudio = useCallback(
    (node: HTMLAudioElement | null) => {
      audioRef.current = node;
      // The `volume` attribute doesn't exist; it can only be set as a property.
      if (node) node.volume = defaultVolume;

      if (typeof ref === "function") return ref(node);
      if (ref) ref.current = node;
    },
    // Only on mount — defaultVolume is an initial value, not a controlled one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ref],
  );

  // Streams report Infinity and an unloaded file NaN; neither can be seeked.
  const canSeek = Number.isFinite(duration) && duration > 0;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      // Rejects when autoplay policy blocks it or the source fails. The
      // `play`/`error` events carry the outcome, so there's nothing to do here
      // beyond keeping the rejection out of the console as an unhandled error.
      audio.play()?.catch(() => {});
    } else {
      audio.pause();
    }
  };

  const seek = (to: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = to;
    // Move the thumb now rather than on the next `timeupdate`, which can lag
    // by a quarter second and makes dragging feel sticky.
    setCurrentTime(to);
  };

  const changeVolume = (percent: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const next = percent / 100;
    audio.volume = next;
    // Dragging up from silence should be audible without a second click.
    if (next > 0 && audio.muted) audio.muted = false;
    setVolume(next);
    setMuted(audio.muted);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !audio.muted;
    setMuted(audio.muted);
  };

  const readDuration = (event: SyntheticEvent<HTMLAudioElement>) => {
    setDuration(event.currentTarget.duration);
    setFailed(false);
  };

  const classes = [
    "sh-audio",
    isPlaying && "sh-audio--playing",
    failed && "sh-audio--error",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const effectiveVolume = muted ? 0 : volume;
  const volumePercent = Math.round(effectiveVolume * 100);

  return (
    <div
      className={classes}
      role="group"
      aria-label={typeof title === "string" ? title : "Audio player"}
    >
      <audio
        {...props}
        ref={setAudio}
        src={src}
        className="sh-audio__media"
        onPlay={chain(onPlay, () => setIsPlaying(true))}
        onPause={chain(onPause, () => setIsPlaying(false))}
        onEnded={chain(onEnded, () => setIsPlaying(false))}
        onTimeUpdate={chain(onTimeUpdate, (event) =>
          setCurrentTime(event.currentTarget.currentTime),
        )}
        onLoadedMetadata={chain(onLoadedMetadata, readDuration)}
        onDurationChange={chain(onDurationChange, readDuration)}
        onVolumeChange={chain(onVolumeChange, (event) => {
          setVolume(event.currentTarget.volume);
          setMuted(event.currentTarget.muted);
        })}
        onError={chain(onError, () => {
          setFailed(true);
          setIsPlaying(false);
        })}
      />

      <div className="sh-audio__transport">
        {onPrevious && (
          <button
            type="button"
            className="sh-audio__skip"
            aria-label={text.previous}
            onClick={onPrevious}
          >
            <PreviousIcon />
          </button>
        )}

        <button
          type="button"
          className="sh-audio__play"
          aria-label={isPlaying ? text.pause : text.play}
          onClick={togglePlay}
          disabled={failed}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        {onNext && (
          <button type="button" className="sh-audio__skip" aria-label={text.next} onClick={onNext}>
            <NextIcon />
          </button>
        )}
      </div>

      <div className="sh-audio__body">
        {(title || subtitle) && (
          <div className="sh-audio__meta">
            {title && <span className="sh-audio__title">{title}</span>}
            {subtitle && <span className="sh-audio__subtitle">{subtitle}</span>}
          </div>
        )}

        {failed ? (
          <span className="sh-audio__error" role="alert">
            {text.error}
          </span>
        ) : (
          <div className="sh-audio__controls">
            <span className="sh-audio__time">{formatAudioTime(currentTime)}</span>

            <RangeSlider
              aria-label={text.seek}
              className="sh-audio__seek"
              min={0}
              max={canSeek ? duration : 0}
              step={0.1}
              value={canSeek ? Math.min(currentTime, duration) : 0}
              onChange={seek}
              disabled={!canSeek}
              formatValue={(value) =>
                `${formatAudioTime(value)} of ${formatAudioTime(duration)}`
              }
            />

            <span className="sh-audio__time">{formatAudioTime(duration)}</span>

            {actions}

            {!hideVolume && (
              <div className="sh-audio__volume">
                <button
                  type="button"
                  className="sh-audio__mute"
                  aria-label={muted ? text.unmute : text.mute}
                  aria-pressed={muted}
                  onClick={toggleMute}
                >
                  {muted || volume === 0 ? <MutedIcon /> : <VolumeIcon />}
                </button>

                <RangeSlider
                  aria-label={text.volume}
                  className="sh-audio__volume-slider"
                  min={0}
                  max={100}
                  step={5}
                  value={volumePercent}
                  onChange={changeVolume}
                  formatValue={(value) => `${value}%`}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
