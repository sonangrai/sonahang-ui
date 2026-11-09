import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { FocusEvent, KeyboardEvent } from "react";

import { portalInto } from "../../internal/portalInto";
import { useTopModalDialog } from "../../internal/useTopModalDialog";
import { Toast } from "./Toast";
import { toast, toastStore } from "./toast.store";
import type { ToastRecord } from "./toast.store";
import type { ToastPosition } from "./toast.tokens";
import "./Toast.css";

// Server rendering has no layout to measure, and React warns about
// useLayoutEffect there; the overflow check simply waits for the client.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const supportsPopover = () =>
  typeof HTMLElement !== "undefined" && typeof HTMLElement.prototype.showPopover === "function";

/*
 * Each toast's timer progress, kept outside React. The stack is rebuilt
 * whenever it moves into or out of a modal dialog (a portal can't change
 * container without remounting), and this is what stops that from restarting
 * timers and replaying the enter animation.
 */
const progress = new Map<string, { version: number; duration: number; remaining: number }>();

export type ToasterProps = {
  /** Corner or edge the stack sits in. Defaults to `bottom-right`. */
  position?: ToastPosition;
  /** Default time on screen in ms, when a toast doesn't set its own. Defaults to 5000. */
  duration?: number;
  /**
   * Most toasts shown at once. When another arrives, the oldest closes to
   * make room. Defaults to 3.
   */
  max?: number;
  /** Default for whether toasts show a close button. Defaults to true. */
  closeButton?: boolean;
  /** Accessible name of the notification region. Defaults to "Notifications". */
  label?: string;
  /** Accessible name of each close button. Defaults to "Dismiss". */
  dismissLabel?: string;
  /**
   * Where to render. `true` (default) portals to `document.body`, an element
   * portals there, `false` renders in place.
   *
   * While a modal `Dialog` or `Drawer` is open, toasts move inside it
   * regardless — everything outside a modal is inert, so they'd otherwise be
   * unclickable.
   */
  portal?: boolean | HTMLElement;
  className?: string;
};

/**
 * Renders the toasts raised with `toast()`. Mount one, once, near the root
 * of the app — no provider needed.
 *
 * Timers pause while the pointer is over the stack, while focus is inside
 * it, and while the tab is hidden, so nothing disappears mid-read.
 * Escape closes the focused toast.
 *
 * Toasts stay on top of, and usable over, an open modal `Dialog` or `Drawer`:
 * the stack is a popover, so it's in the top layer, and it moves into the
 * topmost modal while one is open, so it isn't made inert.
 */
export function Toaster({
  position = "bottom-right",
  duration = 5000,
  max = 3,
  closeButton = true,
  label = "Notifications",
  dismissLabel = "Dismiss",
  portal = true,
  className,
}: ToasterProps) {
  const toasts = useSyncExternalStore(
    toastStore.subscribe,
    toastStore.getSnapshot,
    toastStore.getServerSnapshot,
  );

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const documentHidden = useDocumentHidden();
  const paused = hovered || focused || documentHidden;

  const listRef = useRef<HTMLOListElement>(null);
  const topModal = useTopModalDialog();
  // Only follow a modal when the stack can be a popover: rendered into a
  // dialog without the top layer, it would be clipped by the dialog's
  // overflow and positioned against its transform.
  const target = topModal && supportsPopover() ? topModal : portal;

  // A new container means a new list element, and a popover leaves the top
  // layer whenever it's moved — so show it again each time. Doing so after
  // the modal opened is also what stacks it above that modal.
  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;
    if (!list || !supportsPopover() || list.matches(":popover-open")) return;
    list.showPopover();
  }, [target]);

  useEffect(() => {
    for (const id of progress.keys()) {
      if (!toasts.some((item) => item.id === id)) progress.delete(id);
    }
  }, [toasts]);

  // Before paint, so the toast pushed out of the stack animates away rather
  // than vanishing for a frame first.
  useIsomorphicLayoutEffect(() => {
    const open = toasts.filter((item) => !item.closing);
    const overflow = open.length - Math.max(1, max);
    for (let index = 0; index < overflow; index++) toast.dismiss(open[index].id);
  }, [toasts, max]);

  const handleBlur = (event: FocusEvent<HTMLOListElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
  };

  const [vertical, horizontal] = position.split("-") as ["top" | "bottom", string];

  return portalInto(
    /*
     * `section` + `aria-label` makes this a named landmark, so screen-reader
     * users can find notifications they missed. The list is the live region:
     * it's always in the DOM, which is what lets additions be announced.
     */
    <section aria-label={label} className="sh-toaster-region">
      <ol
        ref={listRef}
        // `manual`: no light dismiss, and it doesn't close other popovers.
        // Omitted where unsupported, since such a browser can't show it.
        popover={supportsPopover() ? "manual" : undefined}
        className={[
          "sh-toaster",
          `sh-toaster--${vertical}`,
          `sh-toaster--${horizontal}`,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-live="polite"
        aria-relevant="additions text"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
      >
        {toasts.map((item) => (
          <ToasterItem
            key={item.id}
            item={item}
            duration={item.duration ?? duration}
            paused={paused}
            closeButton={item.dismissible ?? closeButton}
            dismissLabel={dismissLabel}
          />
        ))}
      </ol>
    </section>,
    target,
  );
}

type ToasterItemProps = {
  item: ToastRecord;
  duration: number;
  paused: boolean;
  closeButton: boolean;
  dismissLabel: string;
};

function ToasterItem({ item, duration, paused, closeButton, dismissLabel }: ToasterItemProps) {
  const { id, version, closing } = item;

  // Remounted after a move rather than newly shown: skip the enter animation.
  const [alreadyShown] = useState(() => progress.has(id));

  // A new toast, or an update (same id, new content), starts a fresh clock;
  // a remount picks up where it left off. Declared before the timer effect
  // so it runs first, after the timer's cleanup has recorded the time used.
  useEffect(() => {
    const saved = progress.get(id);
    if (!saved || saved.version !== version || saved.duration !== duration) {
      progress.set(id, { version, duration, remaining: duration });
    }
  }, [id, version, duration]);

  useEffect(() => {
    const saved = progress.get(id);
    if (!saved || closing || paused || !Number.isFinite(duration)) return;

    const startedAt = Date.now();
    const timer = setTimeout(() => toast.dismiss(id), Math.max(0, saved.remaining));

    return () => {
      clearTimeout(timer);
      saved.remaining -= Date.now() - startedAt;
    };
  }, [id, version, duration, paused, closing]);

  const dismiss = () => toast.dismiss(id);

  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
    if (event.key === "Escape") {
      // Inside a modal, Escape would also close the dialog. preventDefault
      // stops the browser turning this keypress into the dialog's `cancel`.
      event.preventDefault();
      event.stopPropagation();
      dismiss();
    }
  };

  const action = item.action && {
    label: item.action.label,
    onClick: (event: Parameters<NonNullable<typeof item.action>["onClick"]>[0]) => {
      item.action?.onClick(event);
      if (!event.defaultPrevented) dismiss();
    },
  };

  return (
    <li
      className={[
        "sh-toaster__item",
        alreadyShown && "sh-toaster__item--shown",
        closing && "sh-toaster__item--closing",
      ]
        .filter(Boolean)
        .join(" ")}
      data-variant={item.variant}
      onKeyDown={handleKeyDown}
    >
      <Toast
        variant={item.variant}
        title={item.title}
        description={item.description}
        icon={item.icon}
        action={action}
        onDismiss={closeButton ? dismiss : undefined}
        dismissLabel={dismissLabel}
        // The list is already a polite live region; giving every toast
        // `status` too would announce it twice. Urgent ones still use
        // `alert` so they interrupt.
        role={item.variant === "warning" || item.variant === "error" ? "alert" : "none"}
      />
    </li>
  );
}

function useDocumentHidden() {
  return useSyncExternalStore(
    (onChange) => {
      document.addEventListener("visibilitychange", onChange);
      return () => document.removeEventListener("visibilitychange", onChange);
    },
    () => document.visibilityState === "hidden",
    () => false,
  );
}
