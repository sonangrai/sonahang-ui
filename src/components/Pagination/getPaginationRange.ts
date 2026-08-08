/** A page number, or a gap standing in for pages that were left out. */
export type PaginationItem = number | "ellipsis";

export type PaginationRangeOptions = {
  /** Current page, 1-indexed. */
  page: number;
  /** Total number of pages. */
  count: number;
  /** Pages to show either side of the current one. */
  siblingCount?: number;
  /** Pages to always show at each end. */
  boundaryCount?: number;
};

/** Inclusive integer range; empty when `start` is past `end`. */
const range = (start: number, end: number): number[] =>
  end < start ? [] : Array.from({ length: end - start + 1 }, (_, index) => start + index);

/**
 * Builds the visible page list, collapsing runs of hidden pages into gaps.
 *
 * The width is deliberately stable — a given `siblingCount`/`boundaryCount`
 * yields the same number of slots regardless of the current page, so the
 * control doesn't resize as you page through. That's why the sibling window
 * is clamped rather than simply centred on the current page.
 *
 * A gap is only used when it actually saves space: standing in for a single
 * hidden page would take as much room as the page itself, so that page is
 * shown instead.
 */
export function getPaginationRange({
  page,
  count,
  siblingCount = 1,
  boundaryCount = 1,
}: PaginationRangeOptions): PaginationItem[] {
  if (count <= 0) return [];

  const startPages = range(1, Math.min(boundaryCount, count));
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count);

  /*
   * Bounded so the window never runs past the boundary pages at either end.
   * These bounds also absorb an out-of-range `page` — a page below 1 or above
   * `count` lands on the same window as the nearest valid one — so no separate
   * clamp on `page` is needed.
   */
  const siblingsStart = Math.max(
    Math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : count - 1,
  );

  return [
    ...startPages,

    // Leading gap — or the single page it would have replaced.
    ...(siblingsStart > boundaryCount + 2
      ? (["ellipsis"] as PaginationItem[])
      : boundaryCount + 1 < count - boundaryCount
        ? [boundaryCount + 1]
        : []),

    ...range(siblingsStart, siblingsEnd),

    // Trailing gap — same reasoning.
    ...(siblingsEnd < count - boundaryCount - 1
      ? (["ellipsis"] as PaginationItem[])
      : count - boundaryCount > boundaryCount
        ? [count - boundaryCount]
        : []),

    ...endPages,
  ];
}
