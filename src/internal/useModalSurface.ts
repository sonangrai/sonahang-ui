import { useEffect, useId, useRef } from "react";
import type { MouseEventHandler, RefObject } from "react";

import { lockBodyScroll } from "./bodyScrollLock";

/**
 * Shared behaviour for anything built on a modal `<dialog>` — `Dialog` and
 * `Drawer` differ only in geometry, and a bug fixed in one has to be a bug
 * fixed in both.
 *
 * Not part of the public API.
 */
export type ModalSurfaceOptions = {
  open: boolean;
  onClose: () => void;
  closeOnEscape: boolean;
  closeOnBackdropClick: boolean;
  initialFocus?: RefObject<HTMLElement | null>;
  lockScroll: boolean;
};

export type ModalSurface = {
  titleId: string;
  descriptionId: string;
  /** Spread onto the `<dialog>` element. */
  surfaceProps: {
    ref: RefObject<HTMLDialogElement | null>;
    onMouseDown: MouseEventHandler<HTMLDialogElement>;
    onClick: MouseEventHandler<HTMLDialogElement>;
  };
};

export function useModalSurface({
  open,
  onClose,
  closeOnEscape,
  closeOnBackdropClick,
  initialFocus,
  lockScroll,
}: ModalSurfaceOptions): ModalSurface {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mouseDownTargetRef = useRef<EventTarget | null>(null);

  const baseId = useId();

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
   * Escape reaches the element as `cancel`, and the browser closes on it
   * unless told otherwise. It's always refused here so that closing only ever
   * happens through the `open` prop — otherwise the element would already be
   * shut while React still thought it was open.
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

  return {
    titleId: `${baseId}-title`,
    descriptionId: `${baseId}-description`,
    surfaceProps: {
      ref: dialogRef,
      onMouseDown: (event) => {
        mouseDownTargetRef.current = event.target;
      },
      /*
       * Clicks on the backdrop are dispatched to the <dialog> itself, so a
       * target of the element rather than anything inside it means the
       * backdrop. This relies on the element carrying no padding of its own —
       * the panel sections supply it.
       */
      onClick: (event) => {
        if (!closeOnBackdropClick) return;

        // A drag that starts on a control and ends outside still fires a click
        // on the common ancestor. Selecting text in a field shouldn't close
        // anything.
        const startedOnBackdrop = mouseDownTargetRef.current === event.currentTarget;
        if (startedOnBackdrop && event.target === event.currentTarget) onClose();
      },
    },
  };
}
