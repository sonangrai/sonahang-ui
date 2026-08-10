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
import type { HTMLAttributes, ReactElement, ReactNode } from "react";

import { resolveTooltipPlacement } from "./resolveTooltipPlacement";
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
   * Which side of the trigger the tip sits on. Defaults to `top`.
   *
   * `auto` measures the trigger against the viewport each time the tip opens
   * and picks a side with room for it.
   */
  placement?: TooltipPlacement;
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
   * Auto placement. Measured while open rather than once on mount, because the
   * trigger moves: scrolling it towards an edge should move the tip to the
   * side that still has room.
   */
  const [autoSide, setAutoSide] = useState<TooltipSide>("top");
  const isAuto = placement === "auto";
  const side = isAuto ? autoSide : placement;

  useMeasureEffect(() => {
    if (!isAuto || !isOpen || !hasTip) return;

    const measure = () => {
      const wrapper = wrapperRef.current;
      const tip = tipRef.current;
      if (!wrapper || !tip) return;

      setAutoSide(
        resolveTooltipPlacement({
          trigger: wrapper.getBoundingClientRect(),
          // offsetWidth/Height ignore the reveal transform, unlike the rect.
          tip: { width: tip.offsetWidth, height: tip.offsetHeight },
          viewport: { width: window.innerWidth, height: window.innerHeight },
        }),
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
  }, [isAuto, isOpen, hasTip]);

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
        >
          {content}
        </span>
      )}
    </span>
  );
}
