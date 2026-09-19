import type { ButtonHTMLAttributes } from "react";

import { useCarouselContext } from "./carousel.context";
import "./Carousel.css";

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

export type CarouselPlayPauseProps = {
  /** Accessible names for the two states. */
  labels?: { play?: string; pause?: string };
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

/**
 * Stops and restarts auto-rotation.
 *
 * Worth rendering whenever `autoPlay` is on: movement nobody asked for is
 * hard to read past, and hovering to pause it isn't available to everyone.
 * Renders nothing when there's no rotation to control.
 */
export function CarouselPlayPause({
  labels,
  className,
  onClick,
  ...props
}: CarouselPlayPauseProps) {
  const { autoPlay, isPlaying, togglePlaying, count } = useCarouselContext("CarouselPlayPause");

  if (!autoPlay || count <= 1) return null;

  const text = { play: "Start slide rotation", pause: "Stop slide rotation", ...labels };

  return (
    <button
      type="button"
      className={["sh-carousel__play-pause", className].filter(Boolean).join(" ")}
      aria-label={isPlaying ? text.pause : text.play}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) togglePlaying();
      }}
      {...props}
    >
      {isPlaying ? <PauseIcon /> : <PlayIcon />}
    </button>
  );
}
