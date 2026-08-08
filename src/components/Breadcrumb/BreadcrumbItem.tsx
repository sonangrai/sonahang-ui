import type { AnchorHTMLAttributes, ReactNode } from "react";

import { useBreadcrumbContext } from "./breadcrumb.context";
import "./Breadcrumb.css";

export type BreadcrumbItemProps = {
  children?: ReactNode;
  /** Destination. Omit to render plain text, or to supply your own link. */
  href?: string;
  /**
   * Marks this crumb as the current page. Defaults to true for the trailing
   * crumb; set it explicitly to override that.
   */
  current?: boolean;
  className?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className">;

/**
 * One crumb in a `Breadcrumb`.
 *
 * Renders an anchor when given an `href`, plain text otherwise. The current
 * crumb is never a link — linking to the page you're already on is noise —
 * and carries `aria-current="page"`.
 *
 * For router links, omit `href` and pass your own element as children; it's
 * rendered as-is. The current crumb shouldn't be a link anyway, so that only
 * applies to the earlier ones.
 */
export function BreadcrumbItem({
  children,
  href,
  current,
  className,
  ...props
}: BreadcrumbItemProps) {
  const { isLast, separator } = useBreadcrumbContext("BreadcrumbItem");
  const isCurrent = current ?? isLast;

  return (
    <li className={["sh-breadcrumb__item", className].filter(Boolean).join(" ")}>
      {isCurrent ? (
        <span className="sh-breadcrumb__current" aria-current="page">
          {children}
        </span>
      ) : href ? (
        <a className="sh-breadcrumb__link" href={href} {...props}>
          {children}
        </a>
      ) : (
        <span className="sh-breadcrumb__text">{children}</span>
      )}

      {/* Decorative: the list structure already conveys the hierarchy. */}
      {!isLast && (
        <span className="sh-breadcrumb__separator" aria-hidden="true">
          {separator}
        </span>
      )}
    </li>
  );
}
