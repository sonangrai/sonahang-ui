import { useEffect, useId, useRef } from "react";
import type { DialogHTMLAttributes, MouseEvent, ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";

import { lockBodyScroll } from "./bodyScrollLock";
import type { DialogRole, DialogSize } from "./dialog.tokens";
import "./Dialog.css";

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" strokeLinecap="round" />
  </svg>
);

export type DialogProps = {
  /**
   * Whether the dialog is showing.
   *
   * Controlled only, deliberately: a modal has no trigger of its own, so it's
   * always opened from somewhere else in the app. An uncontrolled dialog could
   * never be opened.
   */
  open: boolean;
  /**
   * Called when the dialog asks to close — the close button, the backdrop, or
   * Escape. Nothing closes on its own; this has to set `open` to false.
   */
  onClose: () => void;
  /** Accessible name, rendered as the heading. */
  title: ReactNode;
  /** Optional supporting line under the title. */
  description?: ReactNode;
  /** Body content. Scrolls when it outgrows the dialog. */
  children?: ReactNode;
  /** Action row pinned below the body — usually buttons. */
  footer?: ReactNode;
  /** Width of the dialog. Defaults to `md`. */
  size?: DialogSize;
  /** Defaults to `dialog`. Use `alertdialog` for a decision that can't wait. */
  role?: DialogRole;
  /** Whether Escape closes the dialog. Defaults to true. */
  closeOnEscape?: boolean;
  /** Whether clicking the backdrop closes the dialog. Defaults to true. */
  closeOnBackdropClick?: boolean;
  /** Whether to render the × in the header. Defaults to true. */
  showClose?: boolean;
  /** Accessible name for the × button. Defaults to "Close". */
  closeLabel?: string;
  /**
   * Element to focus when the dialog opens. Without it the browser focuses the
   * first focusable thing inside, or anything carrying `autoFocus`.
   */
  initialFocus?: RefObject<HTMLElement | null>;
  /** Whether to freeze page scrolling while open. Defaults to true. */
  lockScroll?: boolean;
  /**
   * Renders the dialog elsewhere in the DOM — `true` for `document.body`, or
   * an element to render into. Off by default.
   *
   * Not needed for stacking or clipping: `showModal()` puts the dialog in the
   * top layer, which sits above the whole document whatever the `z-index` and
   * `overflow` of its ancestors. Reach for this when the dialog's *position in
   * the DOM* is the problem — nested inside a `<form>` whose submission its
   * buttons would trigger, inside an element with a native click listener, or
   * under an ancestor that may become `inert` or unmount beneath it.
   *
   * It does not change event propagation in React: a portal moves the DOM
   * node, not the React tree, so a parent component's `onClick` still fires.
   */
  portal?: boolean | HTMLElement;
  className?: string;
} & Omit<
  DialogHTMLAttributes<HTMLDialogElement>,
  "className" | "title" | "role" | "open" | "onClose" | "onCancel"
>;

/**
 * Modal dialog built on the native `<dialog>` element.
 *
 * `showModal()` puts it in the top layer, which is what makes it immune to
 * `z-index` and `overflow: hidden` on anything around it, and brings the focus
 * trap, the inert background and the backdrop with it. None of that is
 * reimplemented here.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  role = "dialog",
  closeOnEscape = true,
  closeOnBackdropClick = true,
  showClose = true,
  closeLabel = "Close",
  initialFocus,
  lockScroll = true,
  portal = false,
  className,
  ...props
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mouseDownTargetRef = useRef<EventTarget | null>(null);

  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-description`;

  /*
   * The `open` prop is the single source of truth, so the element is driven
   * imperatively. The `open` *attribute* is not an option: it produces a
   * non-modal dialog with no top layer, no backdrop and no focus trap.
   */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!open) {
      if (dialog.open) dialog.close();
      return;
    }

    if (!dialog.open) dialog.showModal();
    initialFocus?.current?.focus();

    return lockScroll ? lockBodyScroll() : undefined;
    // initialFocus is a ref container; re-running on identity changes would
    // re-steal focus mid-interaction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lockScroll]);

  /*
   * Escape reaches the dialog as `cancel`, and the browser closes on it unless
   * told otherwise. It's always refused here so that closing only ever happens
   * through the `open` prop — otherwise the element would already be shut
   * while React still thought it was open.
   */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      if (closeOnEscape) onClose();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [closeOnEscape, onClose]);

  /*
   * Clicks on the backdrop are dispatched to the <dialog> itself, so a target
   * of the element rather than anything inside it means the backdrop. This
   * relies on the element carrying no padding of its own — the panel sections
   * supply it.
   */
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (!closeOnBackdropClick) return;

    // A drag that starts on a control and ends outside still fires a click on
    // the common ancestor. Selecting text in a field shouldn't close anything.
    const startedOnBackdrop = mouseDownTargetRef.current === event.currentTarget;
    if (startedOnBackdrop && event.target === event.currentTarget) onClose();
  };

  const content = (
    <dialog
      ref={dialogRef}
      role={role}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={["sh-dialog", `sh-dialog--${size}`, className].filter(Boolean).join(" ")}
      onMouseDown={(event) => {
        mouseDownTargetRef.current = event.target;
      }}
      onClick={handleClick}
      {...props}
    >
      <div className="sh-dialog__header">
        <div className="sh-dialog__heading">
          <h2 id={titleId} className="sh-dialog__title">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="sh-dialog__description">
              {description}
            </p>
          )}
        </div>

        {showClose && (
          <button
            type="button"
            className="sh-dialog__close"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {children !== undefined && children !== null && children !== false && (
        <div className="sh-dialog__body">{children}</div>
      )}

      {footer && <div className="sh-dialog__footer">{footer}</div>}
    </dialog>
  );

  if (!portal) return content;

  /*
   * `document` is absent when server rendering, where a portal contributes no
   * markup anyway — so returning nothing here matches what the client will
   * produce and can't cause a hydration mismatch.
   */
  const target = portal === true ? (typeof document === "undefined" ? null : document.body) : portal;

  return target ? createPortal(content, target) : null;
}
