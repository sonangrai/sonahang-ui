import { createContext, useContext } from "react";

export type CarouselContextValue = {
  /** Index of the slide currently in view. */
  index: number;
  /** How many slides `CarouselSlides` is rendering. */
  count: number;
  /** Reported by `CarouselSlides` once it knows how many children it has. */
  setCount: (count: number) => void;
  /**
   * Moves to a slide. `user` navigation also stops auto-rotation for good —
   * once someone takes control, yanking the slide out from under them a few
   * seconds later is hostile.
   */
  goTo: (index: number, source?: "user" | "auto") => void;
  /** Whether the ends wrap around. */
  loop: boolean;
  /** Prefix for the generated slide ids that the dots point at. */
  baseId: string;
  /** Whether the caller asked for auto-rotation at all. */
  autoPlay: boolean;
  /**
   * Whether rotation is *meant* to be running. Deliberately unaffected by the
   * transient pauses (hover, focus, a hidden tab), so the play/pause button
   * doesn't flip its icon as the pointer crosses the carousel.
   */
  isPlaying: boolean;
  /** Starts or stops auto-rotation. */
  togglePlaying: () => void;
};

export const CarouselContext = createContext<CarouselContextValue | undefined>(undefined);

/** Reads the surrounding `Carousel` context, failing loudly rather than silently. */
export function useCarouselContext(component: string): CarouselContextValue {
  const context = useContext(CarouselContext);

  if (!context) {
    throw new Error(`<${component}> must be rendered inside <Carousel>.`);
  }

  return context;
}

/**
 * Position of the slide being rendered. Supplied by `CarouselSlides`, which is
 * the only part that knows the order — a slide can't count its own siblings.
 */
export const CarouselSlideIndexContext = createContext<number | undefined>(undefined);

export function useSlideIndex(component: string): number {
  const index = useContext(CarouselSlideIndexContext);

  if (index === undefined) {
    throw new Error(`<${component}> must be rendered inside <CarouselSlides>.`);
  }

  return index;
}

/** Ids are derived rather than registered, so dot and slide always agree. */
export const slideId = (baseId: string, index: number) => `${baseId}-slide-${index}`;

/**
 * Brings an index into range — wrapping when the carousel loops, clamping when
 * it doesn't. Also guards against a caller passing something out of range.
 */
export function resolveIndex(index: number, count: number, loop: boolean): number {
  if (count <= 0) return 0;
  // `%` alone keeps the sign, so -1 has to be pushed back up into range.
  if (loop) return ((Math.trunc(index) % count) + count) % count;
  return Math.min(Math.max(Math.trunc(index), 0), count - 1);
}
