import { describe, expect, it } from "vitest";

import { resolveTooltipPlacement } from "../resolveTooltipPlacement";
import type { ResolveTooltipPlacementOptions } from "../resolveTooltipPlacement";

const viewport = { width: 1000, height: 800 };
const tip = { width: 200, height: 40 };

/** A 100x20 trigger with its top-left corner at (x, y). */
const at = (x: number, y: number, overrides: Partial<ResolveTooltipPlacementOptions> = {}) =>
  resolveTooltipPlacement({
    trigger: { left: x, right: x + 100, top: y, bottom: y + 20 },
    tip,
    viewport,
    ...overrides,
  });

describe("resolveTooltipPlacement", () => {
  it("prefers the top when everything fits", () => {
    expect(at(400, 400)).toBe("top");
  });

  it("falls to the bottom when the top is tight", () => {
    // 40 above the trigger, and the tip needs 40 + an 8px gap.
    expect(at(400, 40)).toBe("bottom");
  });

  it("takes the top with exactly enough room", () => {
    expect(at(400, 48)).toBe("top");
  });

  it("goes right when neither top nor bottom fits", () => {
    expect(at(400, 40, { viewport: { width: 1000, height: 100 } })).toBe("right");
  });

  it("goes left when the right edge is close", () => {
    // 60px to the right of the trigger, less than the tip's 200 + gap.
    expect(at(840, 40, { viewport: { width: 1000, height: 100 } })).toBe("left");
  });

  it("respects a custom gap", () => {
    // 48 above clears the default 8px gap but not a 16px one.
    expect(at(400, 48, { gap: 16 })).toBe("bottom");
  });

  it("measures the tip, not the trigger", () => {
    expect(at(400, 100, { tip: { width: 200, height: 300 } })).toBe("bottom");
  });

  describe("when nothing fits", () => {
    /*
     * A trigger boxed in on every side — the tip will overflow whatever we
     * choose, so the job is to pick the side it overflows least.
     */
    const cramped = { width: 300, height: 60 };

    it("picks the side with the most room", () => {
      // 20 above, 10 below: neither fits 48, but the top is closer.
      expect(
        resolveTooltipPlacement({
          trigger: { left: 140, right: 160, top: 20, bottom: 50 },
          tip: { width: 280, height: 40 },
          viewport: cramped,
        }),
      ).toBe("top");
    });

    it("can pick a horizontal side as the least bad", () => {
      // 2 above and 2 below against a need of 48; 100 to the left against a
      // need of 118. The left overflows by 18 rather than 46, so it wins even
      // though the vertical sides are preferred when they fit.
      expect(
        resolveTooltipPlacement({
          trigger: { left: 100, right: 200, top: 2, bottom: 58 },
          tip: { width: 110, height: 40 },
          viewport: { width: 210, height: 60 },
        }),
      ).toBe("left");
    });

    it("never returns auto or anything off the list", () => {
      const side = resolveTooltipPlacement({
        trigger: { left: 0, right: 0, top: 0, bottom: 0 },
        tip: { width: 9999, height: 9999 },
        viewport: { width: 0, height: 0 },
      });

      expect(["top", "bottom", "left", "right"]).toContain(side);
    });
  });

  describe("negative space", () => {
    it("treats a trigger scrolled above the viewport as having no room", () => {
      // top is negative once the trigger has scrolled off the top edge.
      expect(
        resolveTooltipPlacement({
          trigger: { left: 400, right: 500, top: -30, bottom: -10 },
          tip,
          viewport,
        }),
      ).toBe("bottom");
    });
  });
});
