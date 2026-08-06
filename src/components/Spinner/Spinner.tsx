import { useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";

import type { SpinnerSize } from "./spinner.tokens";
import "./Spinner.css";

export type SpinnerProps = {
  /** Size of the ring. Defaults to `md`. */
  size?: SpinnerSize;
  /**
   * What's being waited on. Always in the accessibility tree — a spinner with
   * no name announces nothing. Defaults to "Loading".
   */
  label?: ReactNode;
  /** Also renders the label visibly beside the ring. */
  showLabel?: boolean;
  className?: string;
} & Omit<HTMLAttributes<HTMLSpanElement>, "className" | "role">;

/**
 * Indeterminate loading indicator.
 *
 * Takes its colour from `currentColor`, so it inherits whatever it's placed
 * in — a button, a link, a paragraph — instead of needing a colour prop.
 */
export function Spinner({
  size = "md",
  label = "Loading",
  showLabel = false,
  className,
  ...props
}: SpinnerProps) {
  const labelId = useId();

  const classes = [
    "sh-spinner",
    `sh-spinner--${size}`,
    showLabel && "sh-spinner--with-label",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    /*
     * `aria-labelledby` rather than relying on the text inside: `status` isn't
     * a name-from-content role, so without this the element is an anonymous
     * status. Pointing at the label element works for any ReactNode, which
     * `aria-label` (string-only) would not.
     */
    <span className={classes} role="status" aria-labelledby={labelId} {...props}>
      <span className="sh-spinner__ring" aria-hidden="true" />
      {/*
        Present either way: hidden visually when `showLabel` is false, but
        never removed, so the status always has a name and something to
        announce when it appears.
      */}
      <span
        id={labelId}
        className={showLabel ? "sh-spinner__label" : "sh-spinner__label--visually-hidden"}
      >
        {label}
      </span>
    </span>
  );
}
