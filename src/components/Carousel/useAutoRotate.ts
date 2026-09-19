import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { FocusEvent, MouseEvent } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

const canMatchMedia = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function";

/*
 * The motion preference and the tab's visibility are both browser state that
 * React doesn't own, which is exactly what useSyncExternalStore is for. Their
 * server snapshots are the quiet answer — no preference, not hidden — so the
 * first client render agrees with the server's and hydration stays clean.
 */

function subscribeToMotionPreference(onChange: () => void) {
  if (!canMatchMedia()) return () => {};

  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getMotionPreference = () => canMatchMedia() && window.matchMedia(REDUCED_MOTION).matches;

function subscribeToVisibility(onChange: () => void) {
  if (typeof document === "undefined") return () => {};

  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

const getVisibility = () => typeof document !== "undefined" && document.hidden;

export type AutoRotateOptions = {
  /** Whether rotation is meant to be running. */
  enabled: boolean;
  /** Milliseconds between advances. */
  interval: number;
  /** Called on each tick. Read from a ref, so it needn't be stable. */
  onTick: () => void;
};

export type AutoRotateResult = {
  /** Handlers the root spreads to suspend rotation while it's being read. */
  pauseProps: {
    onMouseEnter: (event: MouseEvent<HTMLElement>) => void;
    onMouseLeave: (event: MouseEvent<HTMLElement>) => void;
    onFocus: (event: FocusEvent<HTMLElement>) => void;
    onBlur: (event: FocusEvent<HTMLElement>) => void;
  };
};

/**
 * Drives auto-rotation, and suspends it whenever moving the slide would be
 * unwelcome: while the pointer rests on the carousel, while focus is inside
 * it, while the tab is in the background, and entirely when the reader has
 * asked for reduced motion.
 *
 * These are all *transient* — they don't change whether rotation is enabled,
 * only whether it's ticking right now.
 */
export function useAutoRotate({ enabled, interval, onTick }: AutoRotateOptions): AutoRotateResult {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const reducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionPreference,
    () => false,
  );
  const documentHidden = useSyncExternalStore(subscribeToVisibility, getVisibility, () => false);

  // Kept in a ref so a new callback each render doesn't restart the interval,
  // which would leave a fast-rendering carousel never reaching a tick.
  const tickRef = useRef(onTick);
  useEffect(() => {
    tickRef.current = onTick;
  });

  const running = enabled && !hovered && !focused && !documentHidden && !reducedMotion;

  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => tickRef.current(), interval);
    return () => clearInterval(id);
  }, [running, interval]);

  return {
    pauseProps: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocus: () => setFocused(true),
      onBlur: (event) => {
        /*
         * React's onBlur is focusout, so it also fires when focus moves
         * between two children. Ignoring those keeps rotation paused for the
         * whole visit rather than restarting on every internal hop.
         */
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        setFocused(false);
      },
    },
  };
}
