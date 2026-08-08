import { describe, expect, it } from "vitest";

import { getPaginationRange } from "../getPaginationRange";

const range = (page: number, count: number, siblingCount?: number, boundaryCount?: number) =>
  getPaginationRange({ page, count, siblingCount, boundaryCount });

describe("getPaginationRange", () => {
  describe("degenerate counts", () => {
    it("returns nothing for zero pages", () => {
      expect(range(1, 0)).toEqual([]);
    });

    it("returns nothing for a negative count", () => {
      expect(range(1, -5)).toEqual([]);
    });

    it("returns the single page", () => {
      expect(range(1, 1)).toEqual([1]);
    });
  });

  describe("short runs show every page", () => {
    it.each([
      [2, [1, 2]],
      [3, [1, 2, 3]],
      [5, [1, 2, 3, 4, 5]],
      [7, [1, 2, 3, 4, 5, 6, 7]],
    ])("shows all %i pages without a gap", (count, expected) => {
      expect(range(1, count)).toEqual(expected);
    });
  });

  describe("gaps appear once pages are hidden", () => {
    it("gaps only at the end when near the start", () => {
      expect(range(1, 10)).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);
    });

    it("gaps at both ends when in the middle", () => {
      expect(range(5, 10)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
    });

    it("gaps only at the start when near the end", () => {
      expect(range(10, 10)).toEqual([1, "ellipsis", 6, 7, 8, 9, 10]);
    });

    it("always includes the current page", () => {
      for (let page = 1; page <= 20; page += 1) {
        expect(range(page, 20)).toContain(page);
      }
    });

    it("keeps the first and last page reachable at every position", () => {
      for (let page = 1; page <= 20; page += 1) {
        const result = range(page, 20);
        expect(result[0]).toBe(1);
        expect(result[result.length - 1]).toBe(20);
      }
    });
  });

  describe("stable width", () => {
    it("renders the same number of slots regardless of page", () => {
      // Otherwise the control resizes as you page through it.
      const widths = new Set(
        Array.from({ length: 20 }, (_, index) => range(index + 1, 20).length),
      );

      expect(widths.size).toBe(1);
    });
  });

  describe("no gap stands in for a single page", () => {
    it("shows the page instead of a one-page gap at the start", () => {
      // A gap here would take as much room as the page it replaces.
      const result = range(4, 10);

      expect(result).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);
      expect(result).not.toContain("ellipsis-at-index-1");
    });

    it("shows the page instead of a one-page gap at the end", () => {
      const result = range(7, 10);

      expect(result).toEqual([1, "ellipsis", 6, 7, 8, 9, 10]);
    });
  });

  describe("siblingCount", () => {
    it("widens the window either side of the current page", () => {
      expect(range(10, 20, 2)).toEqual([1, "ellipsis", 8, 9, 10, 11, 12, "ellipsis", 20]);
    });

    it("collapses to the current page alone at zero", () => {
      expect(range(10, 20, 0)).toEqual([1, "ellipsis", 10, "ellipsis", 20]);
    });
  });

  describe("boundaryCount", () => {
    it("shows more pages at each end", () => {
      expect(range(10, 20, 1, 2)).toEqual([1, 2, "ellipsis", 9, 10, 11, "ellipsis", 19, 20]);
    });

    it("shows every page when the boundaries cover the range", () => {
      expect(range(3, 6, 1, 3)).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });

  describe("out-of-range pages", () => {
    it("clamps a page below the first", () => {
      expect(range(-3, 10)).toEqual(range(1, 10));
    });

    it("clamps a page past the last", () => {
      expect(range(99, 10)).toEqual(range(10, 10));
    });
  });

  it("never repeats a page", () => {
    for (let page = 1; page <= 15; page += 1) {
      const numbers = range(page, 15).filter((item): item is number => item !== "ellipsis");
      expect(new Set(numbers).size).toBe(numbers.length);
    }
  });

  it("keeps pages in ascending order", () => {
    for (let page = 1; page <= 15; page += 1) {
      const numbers = range(page, 15).filter((item): item is number => item !== "ellipsis");
      expect(numbers).toEqual([...numbers].sort((a, b) => a - b));
    }
  });
});
