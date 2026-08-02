import type { HTMLAttributes, ReactNode } from "react";

import type { ChipAction, ChipVariant } from "./chip.tokens";
import "./Chip.css";

const actionIcons: Record<ChipAction, ReactNode> = {
  add: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path d="M8 3.5v9M3.5 8h9" strokeLinecap="round" />
    </svg>
  ),
  remove: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
      <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" strokeLinecap="round" />
    </svg>
  ),
};

const actionVerbs: Record<ChipAction, string> = {
  add: "Add",
  remove: "Remove",
};

export type ChipProps = {
  /** Visual style of the chip. Defaults to `primary`. */
  variant?: ChipVariant;
  /** Trailing icon button to render. Omit for a chip with no action. */
  action?: ChipAction;
  /** Fired when the trailing icon button is activated. */
  onAction?: () => void;
  /**
   * Accessible name for the trailing button. Defaults to the action verb
   * plus the label when `children` is a string — e.g. "Remove Vite".
   */
  actionLabel?: string;
  /** Disables the trailing button and mutes the chip. */
  disabled?: boolean;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLSpanElement>, "children">;

/** Compact, actionable label — a `Tag` with a trailing add or remove button. */
export function Chip({
  variant = "primary",
  action,
  onAction,
  actionLabel,
  disabled = false,
  className,
  children,
  ...props
}: ChipProps) {
  const classes = [
    "sh-chip",
    `sh-chip--${variant}`,
    action && "sh-chip--with-action",
    disabled && "sh-chip--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // An icon-only button needs a name; fall back to the verb alone when the
  // label isn't plain text, since we can't read it out of an arbitrary node.
  const label =
    actionLabel ??
    (action
      ? typeof children === "string"
        ? `${actionVerbs[action]} ${children}`
        : actionVerbs[action]
      : undefined);

  return (
    <span className={classes} {...props}>
      <span className="sh-chip__label">{children}</span>
      {action && (
        <button
          type="button"
          className="sh-chip__action"
          onClick={onAction}
          disabled={disabled}
          aria-label={label}
        >
          {actionIcons[action]}
        </button>
      )}
    </span>
  );
}
