import { useId, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";

import { CarouselContext, resolveIndex } from "./carousel.context";
import { useAutoRotate } from "./useAutoRotate";
import "./Carousel.css";

export type CarouselProps = {
  children?: ReactNode;
  /** Index of the slide in view — makes the component controlled. */
  index?: number;
  /** Initially visible slide when uncontrolled. Defaults to `0`. */
  defaultIndex?: number;
  /** Fired with the newly visible slide's index. */
  onChange?: (index: number) => void;
  /** Whether the previous/next controls wrap past the ends. Defaults to `true`. */
  loop?: boolean;
  /** Advances on its own until the reader takes over. Defaults to `false`. */
  autoPlay?: boolean;
  /** Milliseconds each slide is shown while auto-rotating. Defaults to `5000`. */
  interval?: number;
  /** Accessible name for the carousel. Worth setting — there's no default. */
  "aria-label"?: string;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, "className" | "onChange">;

/**
 * Root of the carousel: owns which slide is showing and shares it with
 * `CarouselSlides`, the arrows, and the dots through context.
 *
 * A `section` with `aria-roledescription="carousel"`, per the ARIA carousel
 * pattern — a landmark the reader can jump to, described in the words they'd
 * use for it rather than as an anonymous region.
 */
export function Carousel({
  children,
  index,
  defaultIndex = 0,
  onChange,
  loop = true,
  autoPlay = false,
  interval = 5000,
  "aria-label": ariaLabel,
  className,
  ...props
}: CarouselProps) {
  const baseId = useId();

  const [uncontrolledIndex, setUncontrolledIndex] = useState(defaultIndex);
  const [count, setCount] = useState(0);
  /*
   * Auto-rotation is a one-way door by default: navigating by hand turns it
   * off, and only the play/pause button turns it back on.
   */
  const [stopped, setStopped] = useState(false);

  const isControlled = index !== undefined;
  const requested = isControlled ? index : uncontrolledIndex;
  /*
   * Clamped rather than wrapped, so an out-of-range `index` from a caller
   * lands at an end instead of silently teleporting to the other side. Left
   * alone until the slides have registered, otherwise a controlled carousel
   * opening at slide 3 would render at 0 for a frame and slide across.
   */
  const current = count > 0 ? resolveIndex(requested, count, false) : requested;

  const isPlaying = autoPlay && !stopped;

  const goTo = (next: number, source: "user" | "auto" = "user") => {
    if (source === "user" && autoPlay) setStopped(true);

    const resolved = resolveIndex(next, count, loop);
    if (resolved === current) return;

    if (!isControlled) setUncontrolledIndex(resolved);
    onChange?.(resolved);
  };

  const { pauseProps } = useAutoRotate({
    enabled: isPlaying && count > 1,
    interval,
    onTick: () => goTo(current + 1, "auto"),
  });

  const classes = ["sh-carousel", className].filter(Boolean).join(" ");

  return (
    <CarouselContext.Provider
      value={{
        index: current,
        count,
        setCount,
        goTo,
        loop,
        baseId,
        autoPlay,
        isPlaying,
        togglePlaying: () => setStopped((previous) => !previous),
      }}
    >
      <section
        className={classes}
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        {...props}
        /*
         * After the spread, chaining rather than replacing: pausing on hover
         * and focus is ours to guarantee, but a caller's own handlers still
         * have to fire.
         */
        onMouseEnter={(event) => {
          props.onMouseEnter?.(event);
          pauseProps.onMouseEnter(event);
        }}
        onMouseLeave={(event) => {
          props.onMouseLeave?.(event);
          pauseProps.onMouseLeave(event);
        }}
        onFocus={(event) => {
          props.onFocus?.(event);
          pauseProps.onFocus(event);
        }}
        onBlur={(event) => {
          props.onBlur?.(event);
          pauseProps.onBlur(event);
        }}
      >
        {children}
      </section>
    </CarouselContext.Provider>
  );
}
