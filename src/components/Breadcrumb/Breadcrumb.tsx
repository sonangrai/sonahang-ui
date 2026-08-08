import { Children, isValidElement } from "react";
import type { HTMLAttributes, ReactNode } from "react";

import { BreadcrumbContext } from "./breadcrumb.context";
import "./Breadcrumb.css";

const ChevronIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path d="M6 3.5 10.5 8 6 12.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export type BreadcrumbProps = {
  children?: ReactNode;
  /** Rendered between crumbs. Defaults to a chevron. */
  separator?: ReactNode;
  /** Accessible name for the landmark. Defaults to "Breadcrumb". */
  "aria-label"?: string;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, "className">;

/**
 * Trail of links showing where the current page sits in the hierarchy.
 *
 * A `nav` landmark wrapping an ordered list, since the order is meaningful.
 * The trailing crumb is treated as the current page automatically — the
 * position in the list is what makes it current, so callers shouldn't have to
 * repeat that.
 */
export function Breadcrumb({
  children,
  separator = <ChevronIcon />,
  "aria-label": ariaLabel = "Breadcrumb",
  className,
  ...props
}: BreadcrumbProps) {
  const crumbs = Children.toArray(children).filter(isValidElement);

  return (
    <nav
      className={["sh-breadcrumb", className].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
      {...props}
    >
      <ol className="sh-breadcrumb__list">
        {crumbs.map((crumb, index) => (
          <BreadcrumbContext.Provider
            key={crumb.key ?? index}
            value={{ isLast: index === crumbs.length - 1, separator }}
          >
            {crumb}
          </BreadcrumbContext.Provider>
        ))}
      </ol>
    </nav>
  );
}
