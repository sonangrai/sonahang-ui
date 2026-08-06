import { useId } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import type { ProgressBarSize } from "./progressBar.tokens";
import "./ProgressBar.css";

export type ProgressBarProps = {
  /**
   * Progress so far, between `0` and `max`. Omit for an indeterminate bar —
   * for work whose duration isn't known yet.
   */
  value?: number;
  /** Upper bound of `value`. Defaults to `100`. */
  max?: number;
  /** Visible label above the track. Provide this or `aria-label`. */
  label?: ReactNode;
  /** Shows the percentage beside the label. Ignored when indeterminate. */
  showValue?: boolean;
  /**
   * Formats the displayed value. Also drives `aria-valuetext`, so screen
   * readers announce "3 of 8 files" rather than a bare percentage.
   */
  formatValue?: (value: number, max: number) => string;
  /** Track thickness. Defaults to `md`. */
  size?: ProgressBarSize;
  /** Accessible name when there's no visible `label`. */
  "aria-label"?: string;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "className" | "role">;

/**
 * Horizontal progress indicator.
 *
 * Renders `role="progressbar"`, with `aria-valuenow` omitted when
 * indeterminate — that absence is what tells assistive tech the duration
 * isn't known, rather than it sitting at zero.
 */
export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  formatValue,
  size = "md",
  "aria-label": ariaLabel,
  className,
  ...props
}: ProgressBarProps) {
  const labelId = useId();

  const isIndeterminate = value === undefined;

  // Guard both ends: a value outside the range would otherwise overflow the
  // track, and a non-positive max would divide by zero.
  const safeMax = max > 0 ? max : 0;
  const clamped = isIndeterminate ? 0 : Math.min(Math.max(value, 0), safeMax);
  const percent = safeMax === 0 ? 0 : (clamped / safeMax) * 100;

  const displayValue = formatValue
    ? formatValue(clamped, safeMax)
    : `${Math.round(percent)}%`;

  const classes = [
    "sh-progress",
    `sh-progress--${size}`,
    isIndeterminate && "sh-progress--indeterminate",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...props}>
      {(label || (showValue && !isIndeterminate)) && (
        <span className="sh-progress__header">
          {label && (
            <span className="sh-progress__label" id={labelId}>
              {label}
            </span>
          )}
          {showValue && !isIndeterminate && (
            <span className="sh-progress__value">{displayValue}</span>
          )}
        </span>
      )}

      <div
        className="sh-progress__track"
        role="progressbar"
        aria-label={label ? undefined : ariaLabel}
        aria-labelledby={label ? labelId : undefined}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        // Omitted entirely when indeterminate — that's the signal.
        aria-valuenow={isIndeterminate ? undefined : clamped}
        aria-valuetext={isIndeterminate ? undefined : formatValue ? displayValue : undefined}
      >
        <div
          className="sh-progress__bar"
          style={{ "--sh-progress-fill": `${percent}%` } as CSSProperties}
        />
      </div>
    </div>
  );
}
