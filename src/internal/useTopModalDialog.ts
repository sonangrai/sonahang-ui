import { useSyncExternalStore } from "react";

/**
 * The topmost open modal `<dialog>`, or null.
 *
 * Anything outside a modal dialog is inert while it's open — not just
 * covered, but unclickable and unfocusable — so UI that must stay usable on
 * top of one (toasts) has to render inside it. Watching the DOM, rather than
 * asking Dialog and Drawer to report in, also catches modals that aren't ours.
 *
 * Not part of the public API.
 */
export function useTopModalDialog(): HTMLDialogElement | null {
  return useSyncExternalStore(subscribe, getTop, getServerTop);
}

const isModal = (dialog: HTMLDialogElement) => {
  try {
    return dialog.matches(":modal");
  } catch {
    // Engines without `:modal` (older browsers, jsdom). A non-modal `show()`
    // will be mistaken for a modal, which only costs a needless move.
    return dialog.open;
  }
};

/*
 * Kept in the order dialogs became modal. That's the top-layer order, which
 * DOM order isn't: a dialog opened from inside another can sit anywhere in
 * the document.
 */
let stack: HTMLDialogElement[] = [];

function recompute() {
  const current = Array.from(document.querySelectorAll("dialog")).filter(isModal);
  stack = stack.filter((dialog) => current.includes(dialog));
  for (const dialog of current) if (!stack.includes(dialog)) stack.push(dialog);
}

const getTop = () => stack[stack.length - 1] ?? null;
const getServerTop = () => null;

function subscribe(onChange: () => void) {
  const check = () => {
    const before = getTop();
    recompute();
    if (getTop() !== before) onChange();
  };

  check();

  // `showModal()` and `close()` both toggle the `open` attribute; childList
  // catches an open dialog being removed from the document outright.
  const observer = new MutationObserver(check);
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["open"],
  });

  return () => observer.disconnect();
}
