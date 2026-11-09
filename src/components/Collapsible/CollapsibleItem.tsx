import { useContext } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import {
  CollapsibleDepthContext,
  panelId,
  triggerId,
  useCollapsibleContext,
} from "./collapsible.context";
import "./Collapsible.css";

const ChevronIcon = () => (
  <svg
    className="sh-collapsible__chevron"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    aria-hidden="true"
  >
    {/* Points right when closed; the CSS turns it down when open. */}
    <path d="M6.5 4 10.5 8l-4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export type CollapsibleItemProps = {
  /** Identifies this item in the open list. Unique across the whole tree. */
  value: string;
  /** Content of the row. */
  title: ReactNode;
  /** Leading icon, shown between the chevron and the title. Any level. */
  icon?: ReactNode;
  /**
   * Revealed when open — nested `CollapsibleItem`s for another level, or any
   * other content. With no children the item is a plain, non-toggling row.
   */
  children?: ReactNode;
  /** Replaces the chevron on this item while open. */
  expandedIcon?: ReactNode;
  /** Replaces the chevron on this item while closed. */
  collapsedIcon?: ReactNode;
  /** Prevents the item being opened or closed. */
  disabled?: boolean;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "className" | "title">;

/** One row of a `Collapsible`, optionally containing a further level. */
export function CollapsibleItem({
  value,
  title,
  icon,
  children,
  expandedIcon,
  collapsedIcon,
  disabled = false,
  className,
  style,
  ...props
}: CollapsibleItemProps) {
  const context = useCollapsibleContext("CollapsibleItem");
  const depth = useContext(CollapsibleDepthContext);

  const hasChildren = children !== undefined && children !== null && children !== false;
  const isOpen = hasChildren && context.value.includes(value);

  const openIcon = expandedIcon ?? context.expandedIcon;
  const closedIcon = collapsedIcon ?? context.collapsedIcon;
  const customIndicator = isOpen ? openIcon : closedIcon;

  // Leaves keep an empty indicator slot so their titles line up with
  // expandable siblings.
  const indicator = (
    <span className="sh-collapsible__indicator" aria-hidden="true">
      {hasChildren && (customIndicator ?? <ChevronIcon />)}
    </span>
  );

  const rowContent = (
    <>
      {indicator}
      {icon && (
        <span className="sh-collapsible__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="sh-collapsible__title">{title}</span>
    </>
  );

  return (
    <div
      className={[
        "sh-collapsible__item",
        hasChildren && "sh-collapsible__item--expandable",
        isOpen && "sh-collapsible__item--open",
        disabled && "sh-collapsible__item--disabled",
        // Lets consumers rotate a custom icon themselves, or opt out of the
        // default rotation, without touching the internals.
        customIndicator !== undefined && "sh-collapsible__item--custom-indicator",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      data-depth={depth}
      style={{ "--sh-collapsible-depth": depth, ...style } as CSSProperties}
      {...props}
    >
      {hasChildren ? (
        <button
          type="button"
          id={triggerId(context.baseId, value)}
          className="sh-collapsible__row sh-collapsible__trigger"
          aria-expanded={isOpen}
          aria-controls={panelId(context.baseId, value)}
          disabled={disabled}
          onClick={() => context.toggle(value)}
        >
          {rowContent}
        </button>
      ) : (
        <div className="sh-collapsible__row">{rowContent}</div>
      )}

      {hasChildren && (
        /*
          Kept mounted so the transition has something to animate, and so
          nested items keep their state while a parent is closed. Collapsed
          contents leave the tab order and accessibility tree via
          `visibility` — see the CSS.
        */
        <div
          id={panelId(context.baseId, value)}
          className="sh-collapsible__panel"
          role="region"
          aria-labelledby={triggerId(context.baseId, value)}
        >
          <div className="sh-collapsible__panel-inner">
            <CollapsibleDepthContext.Provider value={depth + 1}>
              <div className="sh-collapsible__content">{children}</div>
            </CollapsibleDepthContext.Provider>
          </div>
        </div>
      )}
    </div>
  );
}
