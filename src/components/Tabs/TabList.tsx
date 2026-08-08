import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, KeyboardEvent, ReactNode } from "react";

import { useTabsContext } from "./tabs.context";
import "./Tabs.css";

/** Measuring has to happen before paint, but useLayoutEffect warns under SSR. */
const useMeasureEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type Indicator = {
  offset: number;
  size: number;
  /** False on the first measurement, so the indicator doesn't fly in on mount. */
  animated: boolean;
};

export type TabListProps = {
  children?: ReactNode;
  /** Accessible name for the tab list. */
  "aria-label"?: string;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "className">;

/**
 * Row (or column) of `Tab`s.
 *
 * Owns the keyboard behaviour the ARIA tabs pattern requires — arrow keys to
 * move, Home/End to jump — because unlike radios there's no native element
 * that provides it. Roving tabindex lives on `Tab` itself.
 *
 * Also owns the sliding selection indicator. Unlike `SegmentedControl`, whose
 * segments are equal width and can be positioned with pure CSS, tabs are
 * content-sized, so the selected tab has to be measured.
 */
export function TabList({ children, className, onKeyDown, ...props }: TabListProps) {
  const { value, orientation, activation, select } = useTabsContext("TabList");
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<Indicator | null>(null);

  const isVertical = orientation === "vertical";

  useMeasureEffect(() => {
    const list = listRef.current;
    if (!list) return;

    // Matched by scanning rather than a selector, so arbitrary `value` strings
    // don't need escaping.
    const tabs = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]'));
    const selectedTab = tabs.find((tab) => tab.dataset.value === value);

    if (!selectedTab) {
      setIndicator(null);
      return;
    }

    const measure = () => {
      const offset = isVertical ? selectedTab.offsetTop : selectedTab.offsetLeft;
      const size = isVertical ? selectedTab.offsetHeight : selectedTab.offsetWidth;
      // `prev !== null` is what distinguishes the first placement from a move.
      setIndicator((prev) => ({ offset, size, animated: prev !== null }));
    };

    measure();

    // Re-measure when the list reflows — a resize, a font swap, a label change.
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(measure);
    observer.observe(list);
    observer.observe(selectedTab);
    return () => observer.disconnect();
  }, [value, isVertical]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !listRef.current) return;

    const nextKey = isVertical ? "ArrowDown" : "ArrowRight";
    const prevKey = isVertical ? "ArrowUp" : "ArrowLeft";

    const handled = [nextKey, prevKey, "Home", "End"];
    if (!handled.includes(event.key)) return;

    /*
     * Read order from the DOM rather than tracking registrations: it stays
     * correct as children change, and `:not([disabled])` skips unusable tabs
     * without any extra bookkeeping.
     */
    const tabs = Array.from(
      listRef.current.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'),
    );
    if (tabs.length === 0) return;

    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);

    let index: number;
    if (event.key === "Home") index = 0;
    else if (event.key === "End") index = tabs.length - 1;
    else if (current === -1) index = 0;
    // Wrap at both ends, as the pattern specifies.
    else if (event.key === nextKey) index = (current + 1) % tabs.length;
    else index = (current - 1 + tabs.length) % tabs.length;

    const target = tabs[index];
    if (!target) return;

    // Stop the arrow keys scrolling the page.
    event.preventDefault();
    target.focus();

    if (activation === "automatic") {
      const nextValue = target.dataset.value;
      if (nextValue !== undefined) select(nextValue);
    }
  };

  return (
    <div
      ref={listRef}
      className={["sh-tabs__list", className].filter(Boolean).join(" ")}
      role="tablist"
      aria-orientation={orientation}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
      {indicator && (
        <span
          className={[
            "sh-tabs__indicator",
            indicator.animated && "sh-tabs__indicator--animated",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
          style={
            {
              "--sh-tabs-indicator-offset": `${indicator.offset}px`,
              "--sh-tabs-indicator-size": `${indicator.size}px`,
            } as CSSProperties
          }
        />
      )}
    </div>
  );
}
