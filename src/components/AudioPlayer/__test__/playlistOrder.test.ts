import { describe, expect, it } from "vitest";

import { createShuffleOrder, getNextTrack, getPreviousTrack } from "../playlistOrder";
import type { PlayMode } from "../playlistOrder";

/** Deterministic stand-in for Math.random, cycling through `values`. */
const sequence = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

const isPermutation = (order: number[], count: number) =>
  [...order].sort((a, b) => a - b).every((value, i) => value === i) && order.length === count;

describe("createShuffleOrder", () => {
  it("starts with the given track", () => {
    expect(createShuffleOrder(5, 3)[0]).toBe(3);
  });

  it("includes every track exactly once", () => {
    expect(isPermutation(createShuffleOrder(8, 2), 8)).toBe(true);
  });

  it("uses the supplied randomness", () => {
    expect(createShuffleOrder(4, 0, sequence(0))).toEqual(createShuffleOrder(4, 0, sequence(0)));
    expect(createShuffleOrder(4, 0, sequence(0))).not.toEqual(
      createShuffleOrder(4, 0, sequence(0.99)),
    );
  });

  it("handles a single track", () => {
    expect(createShuffleOrder(1, 0)).toEqual([0]);
  });

  it("handles an empty playlist", () => {
    expect(createShuffleOrder(0, 0)).toEqual([]);
  });
});

describe("getNextTrack", () => {
  const next = (mode: PlayMode, index: number, advance: "ended" | "next", count = 4) =>
    getNextTrack({ index, count, mode }, advance).index;

  describe("sequential", () => {
    it("moves on when a track ends", () => {
      expect(next("sequential", 1, "ended")).toBe(2);
    });

    it("stops after the last track ends", () => {
      expect(next("sequential", 3, "ended")).toBeNull();
    });

    it("wraps when Next is pressed on the last track", () => {
      expect(next("sequential", 3, "next")).toBe(0);
    });
  });

  describe("repeat-all", () => {
    it("wraps when the last track ends", () => {
      expect(next("repeat-all", 3, "ended")).toBe(0);
    });

    it("moves on with Next", () => {
      expect(next("repeat-all", 0, "next")).toBe(1);
    });
  });

  describe("repeat-one", () => {
    it("stays on the track when it ends", () => {
      expect(next("repeat-one", 2, "ended")).toBe(2);
    });

    it("still moves on with Next", () => {
      expect(next("repeat-one", 2, "next")).toBe(3);
    });
  });

  describe("shuffle", () => {
    it("follows the given order", () => {
      const step = getNextTrack({ index: 3, count: 4, mode: "shuffle", order: [2, 3, 0, 1] }, "ended");

      expect(step.index).toBe(0);
      expect(step.order).toEqual([2, 3, 0, 1]);
    });

    it("builds an order starting from the current track when there isn't one", () => {
      const step = getNextTrack({ index: 1, count: 4, mode: "shuffle" }, "next");

      expect(step.order[0]).toBe(1);
      expect(step.index).toBe(step.order[1]);
    });

    it("replaces an order that no longer fits the playlist", () => {
      // A track was added since the order was made.
      const step = getNextTrack({ index: 0, count: 5, mode: "shuffle", order: [0, 1, 2, 3] }, "next");

      expect(isPermutation(step.order, 5)).toBe(true);
    });

    it("plays every track once per round", () => {
      let position = { index: 2, count: 6, mode: "shuffle" as const, order: [] as number[] };
      const played = [position.index];

      for (let i = 0; i < 5; i++) {
        const step = getNextTrack(position, "ended");
        played.push(step.index!);
        position = { ...position, index: step.index!, order: step.order };
      }

      expect(isPermutation(played, 6)).toBe(true);
    });

    it("reshuffles at the end of a round instead of stopping", () => {
      const step = getNextTrack(
        { index: 1, count: 3, mode: "shuffle", order: [0, 2, 1], random: sequence(0.5) },
        "ended",
      );

      expect(step.index).not.toBeNull();
      expect(isPermutation(step.order, 3)).toBe(true);
    });

    it("never starts a new round on the track that just played", () => {
      for (const r of [0, 0.25, 0.5, 0.75, 0.999]) {
        const step = getNextTrack(
          { index: 2, count: 4, mode: "shuffle", order: [0, 1, 3, 2], random: sequence(r) },
          "ended",
        );
        expect(step.index).not.toBe(2);
      }
    });

    it("repeats a single track", () => {
      expect(getNextTrack({ index: 0, count: 1, mode: "shuffle" }, "ended").index).toBe(0);
    });
  });

  it("goes nowhere in an empty playlist", () => {
    expect(getNextTrack({ index: 0, count: 0, mode: "repeat-all" }, "next").index).toBeNull();
  });
});

describe("getPreviousTrack", () => {
  it("steps back", () => {
    expect(getPreviousTrack({ index: 2, count: 4, mode: "sequential" }).index).toBe(1);
  });

  it("wraps from the first track", () => {
    expect(getPreviousTrack({ index: 0, count: 4, mode: "repeat-all" }).index).toBe(3);
  });

  it("retraces the shuffle order", () => {
    const step = getPreviousTrack({ index: 0, count: 4, mode: "shuffle", order: [2, 3, 0, 1] });

    expect(step.index).toBe(3);
  });

  it("stays put at the start of a shuffle round", () => {
    const step = getPreviousTrack({ index: 2, count: 4, mode: "shuffle", order: [2, 3, 0, 1] });

    expect(step.index).toBe(2);
  });

  it("goes nowhere in an empty playlist", () => {
    expect(getPreviousTrack({ index: 0, count: 0, mode: "sequential" }).index).toBeNull();
  });
});
