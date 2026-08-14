import { createElement } from "react";
import type { HTMLAttributes, ReactNode } from "react";

import { Button, buttonClassNames } from "../Button";
import type { ButtonVariant } from "../Button";
import "./EmptyState.css";

/** Fallback mark: an open, empty tray. */
const EmptyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path
      d="M3 13.5h4l1.5 2.5h7l1.5-2.5h4M3 13.5 5.8 6.2A1.5 1.5 0 0 1 7.2 5.2h9.6a1.5 1.5 0 0 1 1.4 1L21 13.5v3.3a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.8Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export type EmptyStateHeadingLevel = 2 | 3 | 4 | 5 | 6;

/**
 * A call to action.
 *
 * `href` makes it a link and `onClick` makes it a button — the two are the
 * same offer to the user but very different elements, and picking the wrong
 * one costs middle-click, right-click and keyboard behaviour.
 */
export type EmptyStateAction = {
  label: ReactNode;
  /** Renders an `<a>`. Without it the action is a `<button>`. */
  href?: string;
  onClick?: () => void;
  /** Icon rendered before the label. */
  icon?: ReactNode;
  /** Overrides the default styling — `primary` for the main action. */
  variant?: ButtonVariant;
  target?: string;
  rel?: string;
};

export type EmptyStateProps = {
  /** What isn't here. Rendered as a heading. */
  title: ReactNode;
  /** A line under the title, usually explaining what to do about it. */
  description?: ReactNode;
  /**
   * Replaces the default mark, or removes it entirely with `false`. Sized by
   * the component, so a bare `<svg>` is fine.
   */
  icon?: ReactNode | false;
  /** The main call to action. */
  action?: EmptyStateAction;
  /** A quieter second option beside it. */
  secondaryAction?: EmptyStateAction;
  /** Heading rank for the title. Defaults to `3`. */
  headingLevel?: EmptyStateHeadingLevel;
  /** `sm` for an empty state inside a card or panel. Defaults to `md`. */
  size?: "sm" | "md";
  /** Anything extra, rendered below the actions. */
  children?: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "className" | "title" | "children">;

/** Placeholder for a space with nothing in it yet, or nothing left in it. */
export function EmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
  headingLevel = 3,
  size = "md",
  children,
  className,
  ...props
}: EmptyStateProps) {
  /*
   * `undefined` means "no opinion", so the default mark stands in. Both
   * `false` and `null` mean "no icon" — the wrapper carries the gap below the
   * mark, so rendering it around nothing leaves a stray band of space.
   */
  const resolvedIcon = icon === undefined ? <EmptyIcon /> : icon;
  const hasIcon = resolvedIcon !== false && resolvedIcon !== null;

  const renderAction = (config: EmptyStateAction, variant: ButtonVariant) => {
    const { label, href, onClick, icon: actionIcon, variant: override, target, rel } = config;
    const resolvedVariant = override ?? variant;

    if (href === undefined) {
      return (
        <Button variant={resolvedVariant} size={size === "sm" ? "sm" : "md"} icon={actionIcon} onClick={onClick}>
          {label}
        </Button>
      );
    }

    /*
     * A link, wearing the button's own classes rather than a second copy of
     * its rules. `rel` defaults to noreferrer only for a new tab, where the
     * opened page would otherwise get a handle on this one.
     */
    return (
      <a
        href={href}
        target={target}
        rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
        onClick={onClick}
        className={buttonClassNames({
          variant: resolvedVariant,
          size: size === "sm" ? "sm" : "md",
        })}
      >
        <span className="sh-button__content">
          {actionIcon && <span className="sh-button__icon">{actionIcon}</span>}
          {label}
        </span>
      </a>
    );
  };

  return (
    <div
      className={["sh-empty-state", `sh-empty-state--${size}`, className].filter(Boolean).join(" ")}
      {...props}
    >
      {hasIcon && <span className="sh-empty-state__icon">{resolvedIcon}</span>}

      {createElement(
        `h${headingLevel}`,
        { className: "sh-empty-state__title" },
        title,
      )}

      {description && <p className="sh-empty-state__description">{description}</p>}

      {(action || secondaryAction) && (
        <div className="sh-empty-state__actions">
          {action && renderAction(action, "primary")}
          {secondaryAction && renderAction(secondaryAction, "secondary")}
        </div>
      )}

      {children && <div className="sh-empty-state__extra">{children}</div>}
    </div>
  );
}
