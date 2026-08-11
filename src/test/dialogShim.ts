/**
 * jsdom ships `<dialog>` as an element but implements none of its behaviour —
 * `showModal` isn't even a function. This adds just enough of the spec for
 * component tests to drive a dialog: the open state, the `cancel` and `close`
 * events, and Escape on the topmost modal.
 *
 * What it deliberately does NOT simulate, because it can't meaningfully:
 * the top layer, `::backdrop`, the focus trap, inertness of the page behind,
 * and focus restoration on close. Those are the browser's, and nothing in the
 * test suite should be read as covering them.
 */
const openModals: HTMLDialogElement[] = [];

function fire(dialog: HTMLDialogElement, type: "cancel" | "close", cancelable = false) {
  return dialog.dispatchEvent(new Event(type, { cancelable, bubbles: false }));
}

export function installDialogShim() {
  const proto = window.HTMLDialogElement?.prototype;
  if (!proto || typeof proto.showModal === "function") return;

  proto.show = function show(this: HTMLDialogElement) {
    if (this.open) return;
    this.setAttribute("open", "");
  };

  proto.showModal = function showModal(this: HTMLDialogElement) {
    if (this.open) {
      throw new DOMException("The element already has an 'open' attribute", "InvalidStateError");
    }
    this.setAttribute("open", "");
    openModals.push(this);

    // The browser moves focus into the dialog; approximate with the first
    // focusable child so tests of initial focus mean something.
    const focusable = this.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
  };

  proto.close = function close(this: HTMLDialogElement, returnValue?: string) {
    if (!this.open) return;
    if (returnValue !== undefined) this.returnValue = returnValue;

    this.removeAttribute("open");
    const index = openModals.indexOf(this);
    if (index !== -1) openModals.splice(index, 1);

    // The real event is queued as a task, not dispatched synchronously.
    queueMicrotask(() => fire(this, "close"));
  };

  /*
   * Escape reaches the topmost modal as a cancelable `cancel`; the dialog
   * closes only if nothing calls preventDefault.
   */
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || openModals.length === 0) return;

    const topmost = openModals[openModals.length - 1];
    if (fire(topmost, "cancel", true)) topmost.close();
  });
}
