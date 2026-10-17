export const playModes = ["sequential", "repeat-all", "repeat-one", "shuffle"] as const;
export type PlayMode = (typeof playModes)[number];

/** What moved the playlist on: the track finishing, or the Next button. */
export type PlaylistAdvance = "ended" | "next";

export type PlaylistPosition = {
  /** Index of the current track. */
  index: number;
  /** Number of tracks in the playlist. */
  count: number;
  mode: PlayMode;
  /**
   * Shuffled play order, as track indices. Only read in `shuffle` mode; an
   * order that no longer fits the playlist is replaced.
   */
  order?: readonly number[];
  /** Source of randomness, for deterministic tests. Defaults to `Math.random`. */
  random?: () => number;
};

export type PlaylistStep = {
  /** Track to move to, or `null` to stop where we are. */
  index: number | null;
  /** The shuffle order to keep for the next step. */
  order: number[];
};

/**
 * A random permutation of `0..count-1` that starts with `first`, so turning
 * shuffle on never jumps away from the track that's playing.
 */
export function createShuffleOrder(
  count: number,
  first: number,
  random: () => number = Math.random,
): number[] {
  const rest = Array.from({ length: count }, (_, i) => i).filter((i) => i !== first);

  // Fisher–Yates.
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }

  return count > 0 ? [first, ...rest] : [];
}

/** The order we already have if it still describes this playlist, else a new one. */
function usableOrder({ index, count, order, random }: PlaylistPosition): number[] {
  if (order && order.length === count && order.includes(index)) return [...order];
  return createShuffleOrder(count, index, random);
}

/**
 * Where the playlist goes after the current track.
 *
 * - `sequential` stops after the last track when it ends; Next wraps.
 * - `repeat-all` wraps either way.
 * - `repeat-one` replays the track when it ends; Next still moves on, since
 *   pressing it is asking for a different track.
 * - `shuffle` walks a shuffled order and reshuffles once every track has
 *   played, never starting the new round on the track that just finished.
 */
export function getNextTrack(position: PlaylistPosition, advance: PlaylistAdvance): PlaylistStep {
  const { index, count, mode, random } = position;
  if (count === 0) return { index: null, order: [] };

  if (mode === "shuffle") {
    const order = usableOrder(position);
    const at = order.indexOf(index);
    if (at < order.length - 1) return { index: order[at + 1], order };

    // Round's over. Start the next with anything but what just played.
    const offset = Math.floor((random ?? Math.random)() * (count - 1));
    const first = count > 1 ? (index + 1 + offset) % count : index;
    const next = createShuffleOrder(count, first, random);
    return { index: next[0], order: next };
  }

  const order = position.order ? [...position.order] : [];
  if (advance === "ended") {
    if (mode === "repeat-one") return { index, order };
    if (mode === "sequential" && index >= count - 1) return { index: null, order };
  }

  return { index: (index + 1) % count, order };
}

/**
 * Where Previous goes. In `shuffle` it retraces the shuffled order and stays
 * on the first track of the round; otherwise it steps back and wraps.
 */
export function getPreviousTrack(position: PlaylistPosition): PlaylistStep {
  const { index, count, mode } = position;
  if (count === 0) return { index: null, order: [] };

  if (mode === "shuffle") {
    const order = usableOrder(position);
    const at = order.indexOf(index);
    return { index: order[Math.max(at - 1, 0)], order };
  }

  return { index: (index - 1 + count) % count, order: position.order ? [...position.order] : [] };
}
