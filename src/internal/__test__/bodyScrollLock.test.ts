import { afterEach, describe, expect, it, vi } from "vitest";

import { lockBodyScroll } from "../bodyScrollLock";

/*
 * The lock count lives in the module, so a test that takes a lock and never
 * gives it back leaves every later test locked. Everything goes through `lock`
 * and is drained between tests.
 */
const held: Array<() => void> = [];

const lock = () => {
  const release = lockBodyScroll();
  held.push(release);
  return release;
};

afterEach(() => {
  while (held.length > 0) held.pop()?.();

  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
  vi.restoreAllMocks();
});

describe("lockBodyScroll", () => {
  it("freezes scrolling", () => {
    lock();

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores on release", () => {
    const release = lock();
    release();

    expect(document.body.style.overflow).toBe("");
  });

  it("puts back whatever was there before", () => {
    document.body.style.overflow = "scroll";

    const release = lock();
    release();

    expect(document.body.style.overflow).toBe("scroll");
  });

  describe("stacking", () => {
    it("stays locked until the last release", () => {
      const first = lock();
      const second = lock();

      first();
      expect(document.body.style.overflow).toBe("hidden");

      second();
      expect(document.body.style.overflow).toBe("");
    });

    it("ignores a repeated release", () => {
      // Otherwise the count drops below the dialogs still open and the page
      // unlocks under them.
      const first = lock();
      const second = lock();

      first();
      first();

      expect(document.body.style.overflow).toBe("hidden");
      second();
      expect(document.body.style.overflow).toBe("");
    });
  });

  describe("scrollbar compensation", () => {
    /** jsdom reports no scrollbar, so the width has to be faked. */
    const stubScrollbar = (width: number) => {
      vi.spyOn(window, "innerWidth", "get").mockReturnValue(1000);
      vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(1000 - width);
    };

    it("pads by the scrollbar width so the page doesn't shift", () => {
      stubScrollbar(15);

      lock();

      expect(document.body.style.paddingRight).toBe("15px");
    });

    it("adds to padding that was already there", () => {
      stubScrollbar(15);
      document.body.style.paddingRight = "10px";

      lock();

      expect(document.body.style.paddingRight).toBe("25px");
    });

    it("leaves padding alone when there is no scrollbar", () => {
      stubScrollbar(0);

      lock();

      expect(document.body.style.paddingRight).toBe("");
    });

    it("restores the original padding", () => {
      stubScrollbar(15);
      document.body.style.paddingRight = "10px";

      const release = lock();
      release();

      expect(document.body.style.paddingRight).toBe("10px");
    });
  });
});
