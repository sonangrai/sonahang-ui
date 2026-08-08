import { useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";

import { getPaginationRange } from "./getPaginationRange";
import "./Pagination.css";

const Chevron = ({ direction }: { direction: "left" | "right" }) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <path
      d={direction === "left" ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DoubleChevron = ({ direction }: { direction: "left" | "right" }) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <path
      d={direction === "left" ? "M8 3.5 3.5 8 8 12.5M13 3.5 8.5 8l4.5 4.5" : "M8 3.5 12.5 8 8 12.5M3 3.5 7.5 8 3 12.5"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export type PaginationProps = {
  /** Total number of pages. */
  count: number;
  /** Current page, 1-indexed — makes the component controlled. */
  page?: number;
  /** Initial page when uncontrolled. Defaults to `1`. */
  defaultPage?: number;
  /** Fired with the newly selected page. */
  onChange?: (page: number) => void;
  /** Pages to show either side of the current one. Defaults to `1`. */
  siblingCount?: number;
  /** Pages to always show at each end. Defaults to `1`. */
  boundaryCount?: number;
  /** Adds jump-to-first and jump-to-last buttons. */
  showFirstLast?: boolean;
  /** Hides the previous/next buttons. */
  hidePrevNext?: boolean;
  /** Disables every control. */
  disabled?: boolean;
  /** Labels for the navigation buttons and each page. */
  labels?: {
    first?: string;
    previous?: string;
    next?: string;
    last?: string;
    page?: (page: number) => string;
  };
  /** Accessible name for the landmark. Defaults to "Pagination". */
  "aria-label"?: string;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, "className" | "onChange">;

const defaultLabels = {
  first: "First page",
  previous: "Previous page",
  next: "Next page",
  last: "Last page",
  page: (page: number) => `Page ${page}`,
};

/**
 * Page navigation.
 *
 * A `nav` landmark around a list of page buttons, with runs of hidden pages
 * collapsed into gaps. The gaps are inert text, not buttons — there's nothing
 * to activate, so they stay out of the tab order and the accessibility tree.
 */
export function Pagination({
  count,
  page,
  defaultPage = 1,
  onChange,
  siblingCount = 1,
  boundaryCount = 1,
  showFirstLast = false,
  hidePrevNext = false,
  disabled = false,
  labels,
  "aria-label": ariaLabel = "Pagination",
  className,
  ...props
}: PaginationProps) {
  const [uncontrolledPage, setUncontrolledPage] = useState(defaultPage);
  const isControlled = page !== undefined;
  const current = isControlled ? page : uncontrolledPage;

  const text = { ...defaultLabels, ...labels };

  const select = (next: number) => {
    // Guard the arrows at the ends, and any out-of-range page from a caller.
    if (next < 1 || next > count || next === current) return;
    if (!isControlled) setUncontrolledPage(next);
    onChange?.(next);
  };

  const items = getPaginationRange({ page: current, count, siblingCount, boundaryCount });

  // Nothing to navigate.
  if (count <= 0) return null;

  const navButton = (key: string, label: string, to: number, icon: ReactNode) => (
    <li className="sh-pagination__item" key={key}>
      <button
        type="button"
        className="sh-pagination__control"
        onClick={() => select(to)}
        /*
         * Also disabled when the target is the page you're already on —
         * otherwise "First page" stays enabled on page 1 and does nothing
         * when clicked, which reads as broken.
         */
        disabled={disabled || to < 1 || to > count || to === current}
        aria-label={label}
      >
        {icon}
      </button>
    </li>
  );

  return (
    <nav
      className={["sh-pagination", className].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
      {...props}
    >
      <ul className="sh-pagination__list">
        {showFirstLast &&
          navButton("first", text.first, 1, <DoubleChevron direction="left" />)}
        {!hidePrevNext &&
          navButton("prev", text.previous, current - 1, <Chevron direction="left" />)}

        {items.map((item, index) =>
          item === "ellipsis" ? (
            <li className="sh-pagination__item" key={`ellipsis-${index}`}>
              {/*
                Inert: there's no page to go to, and announcing "ellipsis"
                between page numbers is noise.
              */}
              <span className="sh-pagination__ellipsis" aria-hidden="true">
                …
              </span>
            </li>
          ) : (
            <li className="sh-pagination__item" key={item}>
              <button
                type="button"
                className={[
                  "sh-pagination__page",
                  item === current && "sh-pagination__page--current",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => select(item)}
                disabled={disabled}
                aria-label={text.page(item)}
                aria-current={item === current ? "page" : undefined}
              >
                {item}
              </button>
            </li>
          ),
        )}

        {!hidePrevNext &&
          navButton("next", text.next, current + 1, <Chevron direction="right" />)}
        {showFirstLast &&
          navButton("last", text.last, count, <DoubleChevron direction="right" />)}
      </ul>
    </nav>
  );
}
