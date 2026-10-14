/** A concrete side the tip can sit on. */
export type TooltipSide = "top" | "bottom" | "left" | "right";

/** What a `Tooltip` accepts — a fixed side, or `auto` to pick one at runtime. */
export type TooltipPlacement = TooltipSide | "auto";

/** The parts of a DOMRect this needs, so callers can pass a plain object. */
export type TooltipRect = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type ResolveTooltipPlacementOptions = {
  /** Trigger box, relative to the viewport — i.e. `getBoundingClientRect()`. */
  trigger: TooltipRect;
  /** Rendered size of the tip. */
  tip: { width: number; height: number };
  viewport: { width: number; height: number };
  /** Separation between trigger and tip. Defaults to 8, matching the CSS. */
  gap?: number;
  /**
   * The side to keep whenever it fits. Defaults to `top`. When it doesn't,
   * the opposite side is tried next, so a tip that can't go above a trigger
   * goes below it rather than off to one side.
   */
  preferred?: TooltipSide;
};

export type ResolveTooltipShiftOptions = {
  /** The side the tip is on — from `resolveTooltipPlacement`. */
  side: TooltipSide;
  trigger: TooltipRect;
  tip: { width: number; height: number };
  viewport: { width: number; height: number };
  /** Minimum distance kept between the tip and the viewport edge. Defaults to 8. */
  padding?: number;
};

const OPPOSITE: Record<TooltipSide, TooltipSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

/*
 * Preference order after the preferred side and its opposite. The vertical
 * sides lead because a tip beside the trigger is harder to associate with it
 * than one above or below.
 */
const ORDER: TooltipSide[] = ["top", "bottom", "right", "left"];

/*
 * How close the arrow may get to the tip's end. Past this it would hang off
 * the rounded corner rather than the tip's edge.
 */
const ARROW_INSET = 12;

/**
 * Picks the side of the trigger with room for the tip.
 *
 * Returns the preferred side if it fits, then its opposite, then the first
 * remaining side that fits. When none do — a trigger in a cramped scroll
 * container, say — it returns whichever side overflows least, so the tip is
 * still mostly readable.
 *
 * This looks at the primary axis only. Keeping the tip inside the viewport
 * along the other axis is `resolveTooltipShift`'s job.
 */
export function resolveTooltipPlacement({
  trigger,
  tip,
  viewport,
  gap = 8,
  preferred = "top",
}: ResolveTooltipPlacementOptions): TooltipSide {
  const space: Record<TooltipSide, number> = {
    top: trigger.top,
    bottom: viewport.height - trigger.bottom,
    left: trigger.left,
    right: viewport.width - trigger.right,
  };

  const needed: Record<TooltipSide, number> = {
    top: tip.height + gap,
    bottom: tip.height + gap,
    left: tip.width + gap,
    right: tip.width + gap,
  };

  const order = [preferred, OPPOSITE[preferred]];
  for (const side of ORDER) if (!order.includes(side)) order.push(side);

  const fitting = order.find((side) => space[side] >= needed[side]);
  if (fitting) return fitting;

  return order.reduce((best, side) =>
    space[side] - needed[side] > space[best] - needed[best] ? side : best,
  );
}

/**
 * How far to slide the tip off-centre so it stays inside the viewport.
 *
 * A `top` or `bottom` tip is centred on its trigger, so a trigger near the
 * left or right edge pushes half of it off screen; the result is a horizontal
 * offset in pixels that pulls it back. For `left` and `right` it's vertical.
 *
 * When the tip is wider than the viewport, its start edge wins, because that's
 * where reading begins. The shift is capped so the arrow always stays on the
 * tip and keeps pointing at the trigger.
 */
export function resolveTooltipShift({
  side,
  trigger,
  tip,
  viewport,
  padding = 8,
}: ResolveTooltipShiftOptions): number {
  const vertical = side === "top" || side === "bottom";
  const size = vertical ? tip.width : tip.height;
  const limit = vertical ? viewport.width : viewport.height;
  const center = vertical
    ? (trigger.left + trigger.right) / 2
    : (trigger.top + trigger.bottom) / 2;

  const start = center - size / 2;
  const end = start + size;

  let shift = 0;
  if (end > limit - padding) shift = limit - padding - end;
  if (start + shift < padding) shift = padding - start;

  const max = Math.max(0, size / 2 - ARROW_INSET);
  return Math.min(max, Math.max(-max, shift));
}
