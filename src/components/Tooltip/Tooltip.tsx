import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode } from "react";

import { resolveTooltipPlacement, resolveTooltipShift } from "./resolveTooltipPlacement";
import type { TooltipPlacement, TooltipSide } from "./resolveTooltipPlacement";
import "./Tooltip.css";

export type { TooltipPlacement, TooltipSide };

/*
 * Measuring has to happen before paint, or the tip is visible on the wrong
 * side for a frame. useLayoutEffect warns during server rendering, where
 * there's no layout to measure in the first place.
 */
const useMeasureEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** The one prop the tooltip needs to put on its trigger. */
type TriggerProps = { "aria-describedby"?: string };

export type TooltipProps = {
  /**
   * The element the tip describes. Must be a single element that forwards
   * props to a DOM node — the tip's id has to land on the thing a screen
   * reader focuses, and no wrapper can stand in for it.
   */
  children: ReactElement<TriggerProps>;
  /** Tip body. Nothing renders when this is empty. */
  content?: ReactNode;
  /**
   * Which side of the trigger the tip prefers. Defaults to `top`.
   *
   * The tip is measured against the viewport each time it opens. If the
   * preferred side has no room, it flips to the opposite side, then to
   * whichever side does. `auto` is the same as `top`.
   */
  placement?: TooltipPlacement;
  /**
   * Keeps the tip on screen by flipping it to another side and sliding it
   * away from the viewport edge. Defaults to `true`. Turn it off to pin the
   * tip to `placement` exactly.
   */
  avoidCollisions?: boolean;
  /** Milliseconds to wait before showing on hover. Defaults to 150. */
  delay?: number;
  /** Open state — makes the component controlled. */
  open?: boolean;
  /** Initial open state when uncontrolled. Defaults to closed. */
  defaultOpen?: boolean;
  /** Fired whenever the tip shows or hides. */
  onOpenChange?: (open: boolean) => void;
  /** Suppresses the tip entirely while leaving the trigger untouched. */
  disabled?: boolean;
  className?: string;
} & Omit<HTMLAttributes<HTMLSpanElement>, "className" | "content">;

/**
 * Short label revealed on hover or focus.
 *
 * Supplementary only: a tooltip is never the sole home for information a user
 * needs, because it can't be reached by touch and disappears on the way to
 * anything else. Use it to name an icon button or expand an abbreviation.
 */
export function Tooltip({
  children,
  content,
  placement = "top",
  avoidCollisions = true,
  delay = 150,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  className,
  ...props
}: TooltipProps) {
  const tipId = useId();
  const timerRef = useRef<number | undefined>(undefined);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  /*
   * Set while a press is being handled. A click fires mousedown *then* focus,
   * so without this the focus handler would immediately reopen the tip the
   * press just dismissed, and it would sit there over whatever the click did.
   */
  const pressedRef = useRef(false);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  // An empty tip would otherwise leave an aria-describedby pointing at nothing.
  const hasTip = !disabled && content !== undefined && content !== null && content !== "";

  const clearTimer = () => {
    if (timerRef.current !== undefined) {
      window.clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  };

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const show = () => {
    if (!hasTip || isOpen || pressedRef.current) return;
    clearTimer();
    // A zero delay has to stay synchronous, or a click would land first.
    if (delay > 0) timerRef.current = window.setTimeout(() => setOpen(true), delay);
    else setOpen(true);
  };

  const hide = () => {
    clearTimer();
    if (isOpen) setOpen(false);
  };

  // A pending timer would otherwise fire into an unmounted component.
  useEffect(() => clearTimer, []);

  /*
   * Collision handling. Measured while open rather than once on mount, because
   * the trigger moves: scrolling it towards an edge should move the tip to the
   * side that still has room.
   */
  const preferred: TooltipSide = placement === "auto" ? "top" : placement;
  /*
   * Tagged with the side it was measured for, so a placement change made while
   * closed isn't masked by a measurement taken for the old one.
   */
  const [measured, setMeasured] = useState<{
    preferred: TooltipSide;
    side: TooltipSide;
    shift: number;
  } | null>(null);
  const position =
    avoidCollisions && measured?.preferred === preferred
      ? measured
      : { side: preferred, shift: 0 };
  const side = position.side;

  useMeasureEffect(() => {
    if (!avoidCollisions || !isOpen || !hasTip) return;

    const measure = () => {
      const wrapper = wrapperRef.current;
      const tip = tipRef.current;
      if (!wrapper || !tip) return;

      // offsetWidth/Height ignore the reveal transform, unlike the rect.
      const tipSize = { width: tip.offsetWidth, height: tip.offsetHeight };
      // No layout to measure — a hidden ancestor, or a test environment.
      if (tipSize.width === 0 && tipSize.height === 0) return;

      const trigger = wrapper.getBoundingClientRect();
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const nextSide = resolveTooltipPlacement({ trigger, tip: tipSize, viewport, preferred });
      const shift = resolveTooltipShift({ side: nextSide, trigger, tip: tipSize, viewport });

      // Scroll fires constantly; only re-render when something moved.
      setMeasured((prev) =>
        prev?.preferred === preferred && prev.side === nextSide && prev.shift === shift
          ? prev
          : { preferred, side: nextSide, shift },
      );
    };

    measure();

    // Captured, so scrolling any ancestor container counts, not just the page.
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [avoidCollisions, preferred, isOpen, hasTip]);

  /*
   * Escape dismisses the tip, per the APG. Bound to the document rather than
   * the trigger because the tip can be open without focus being anywhere near
   * it — hover, or a controlled parent — and an undismissable tip can sit on
   * top of whatever the user is trying to read.
   */
  useEffect(() => {
    if (!isOpen || !hasTip) return;

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasTip, setOpen]);

  if (!isValidElement(children)) {
    throw new Error("<Tooltip> expects a single element child to describe.");
  }

  /*
   * The only prop injected into the trigger. Handlers all sit on the wrapper,
   * where they cover the whole subtree and can't collide with the child's own.
   *
   * The reference is permanent rather than added on open: assistive technology
   * computes the description when focus arrives, and a hidden element that is
   * *directly referenced* still contributes its text, so a screen reader gets
   * the tip whether or not it is visually showing.
   */
  const trigger = hasTip
    ? cloneElement(children, {
        "aria-describedby": [children.props["aria-describedby"], tipId]
          .filter(Boolean)
          .join(" "),
      })
    : children;

  return (
    <span
      ref={wrapperRef}
      className={["sh-tooltip", className].filter(Boolean).join(" ")}
      onMouseEnter={show}
      onMouseLeave={() => {
        pressedRef.current = false;
        hide();
      }}
      onFocus={show}
      onBlur={() => {
        pressedRef.current = false;
        hide();
      }}
      // A press means the user has stopped asking what the control is.
      onMouseDown={() => {
        pressedRef.current = true;
        hide();
      }}
      {...props}
    >
      {trigger}

      {hasTip && (
        <span
          ref={tipRef}
          id={tipId}
          role="tooltip"
          className={[
            "sh-tooltip__tip",
            `sh-tooltip__tip--${side}`,
            isOpen && "sh-tooltip__tip--open",
          ]
            .filter(Boolean)
            .join(" ")}
          style={
            position.shift
              ? ({ "--sh-tooltip-shift": `${position.shift}px` } as CSSProperties)
              : undefined
          }
        >
          {content}
        </span>
      )}
    </span>
  );
}
