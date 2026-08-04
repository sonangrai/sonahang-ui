import { useId, useState } from "react";
import type { CSSProperties, ChangeEvent, InputHTMLAttributes, ReactNode } from "react";

import "./RangeSlider.css";

export type RangeSliderProps = {
  /** Visible label, associated with the slider via `htmlFor`/`id`. */
  label?: ReactNode;
  /** Hint shown below the slider. Replaced by `error` when that's set. */
  helperText?: ReactNode;
  /** Validation message. Its presence also marks the slider invalid. */
  error?: ReactNode;
  /** Current value — makes the slider controlled. */
  value?: number;
  /** Initial value when uncontrolled. Defaults to `min`. */
  defaultValue?: number;
  /** Fired with the new value. */
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Shows the current value beside the label. */
  showValue?: boolean;
  /**
   * Formats the displayed value. Also drives `aria-valuetext`, so screen
   * readers announce "$50" rather than a bare "50".
   */
  formatValue?: (value: number) => string;
  /** Class for the wrapper element. Use `inputClassName` for the input. */
  className?: string;
  /** Class for the underlying `<input type="range">`. */
  inputClassName?: string;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step" | "className"
>;

/**
 * Single-value slider built on the native `<input type="range">`, so
 * `role="slider"`, the value announcements, keyboard stepping, and form
 * submission all come from the platform.
 */
export function RangeSlider({
  label,
  helperText,
  error,
  value,
  defaultValue,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showValue = false,
  formatValue,
  className,
  inputClassName,
  id,
  disabled,
  "aria-describedby": ariaDescribedBy,
  ...props
}: RangeSliderProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? min);
  const isControlled = value !== undefined;
  const current = isControlled ? value : uncontrolledValue;

  const invalid = Boolean(error);
  const message = error ?? helperText;

  // Keep any describedby the consumer passed; don't clobber it.
  const describedBy =
    [ariaDescribedBy, message ? messageId : undefined].filter(Boolean).join(" ") || undefined;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    if (!isControlled) setUncontrolledValue(next);
    onChange?.(next);
  };

  // WebKit has no equivalent of Firefox's ::-moz-range-progress, so the
  // filled portion is a gradient stop driven by this custom property.
  const fillPercent = max === min ? 0 : ((current - min) / (max - min)) * 100;
  const displayValue = formatValue ? formatValue(current) : String(current);

  const classes = [
    "sh-range",
    invalid && "sh-range--invalid",
    disabled && "sh-range--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {(label || showValue) && (
        <span className="sh-range__header">
          {label && (
            <label className="sh-range__label" htmlFor={inputId}>
              {label}
            </label>
          )}
          {showValue && <span className="sh-range__value">{displayValue}</span>}
        </span>
      )}

      <input
        {...props}
        type="range"
        id={inputId}
        className={["sh-range__input", inputClassName].filter(Boolean).join(" ")}
        style={{ "--sh-range-fill": `${fillPercent}%` } as CSSProperties}
        min={min}
        max={max}
        step={step}
        value={current}
        disabled={disabled}
        onChange={handleChange}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        aria-valuetext={formatValue ? displayValue : undefined}
      />

      {message && (
        <span id={messageId} className="sh-range__message">
          {message}
        </span>
      )}
    </div>
  );
}
