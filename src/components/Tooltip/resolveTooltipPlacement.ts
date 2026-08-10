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
};

/*
 * Preference order when more than one side fits. `top` leads because it's the
 * default for a fixed placement, and the sides come last: a tip beside the
 * trigger is harder to associate with it than one above or below.
 */
const ORDER: TooltipSide[] = ["top", "bottom", "right", "left"];

/**
 * Picks the side of the trigger with room for the tip.
 *
 * Returns the first side in preference order that fits. When none do — a
 * trigger in a cramped scroll container, say — it returns whichever side
 * overflows least, so the tip is still mostly readable.
 *
 * This looks at the primary axis only: a `top` tip is centred horizontally
 * and can still overrun the left or right edge of a narrow viewport. Shifting
 * along the cross axis would need the tip to be positioned in JavaScript
 * rather than by CSS.
 */
export function resolveTooltipPlacement({
  trigger,
  tip,
  viewport,
  gap = 8,
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

  const fitting = ORDER.find((side) => space[side] >= needed[side]);
  if (fitting) return fitting;

  return ORDER.reduce((best, side) =>
    space[side] - needed[side] > space[best] - needed[best] ? side : best,
  );
}
