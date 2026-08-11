/*
 * A modal <dialog> takes over the top layer but does nothing about the page
 * behind it, which happily keeps scrolling under the backdrop.
 *
 * Locking is counted rather than a boolean: with dialogs stacked, closing the
 * inner one must not hand scrolling back to the page while the outer one is
 * still up.
 */
let lockCount = 0;
let restore: (() => void) | null = null;

/** Freezes page scrolling. Returns the release, which is safe to call twice. */
export function lockBodyScroll(): () => void {
  if (lockCount === 0) {
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    /*
     * Hiding the scrollbar frees up its width and everything on the page
     * shifts sideways. Pad by the same amount to hold it still.
     */
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      const current = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${current + scrollbarWidth}px`;
    }

    restore = () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }

  lockCount += 1;
  let released = false;

  return () => {
    // A second release would drop the count below the dialogs still open.
    if (released) return;
    released = true;

    lockCount -= 1;
    if (lockCount === 0) {
      restore?.();
      restore = null;
    }
  };
}
