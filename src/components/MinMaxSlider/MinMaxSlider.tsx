import { useId, useState } from "react";
import type { CSSProperties, ChangeEvent, ReactNode } from "react";

import "./MinMaxSlider.css";

export type MinMaxValue = [number, number];

export type MinMaxSliderProps = {
  /** Visible label for the pair. Provide this or `aria-label`. */
  label?: ReactNode;
  /** Hint shown below the slider. Replaced by `error` when that's set. */
  helperText?: ReactNode;
  /** Validation message. Its presence also marks the slider invalid. */
  error?: ReactNode;
  /** Current `[from, to]` — makes the slider controlled. */
  value?: MinMaxValue;
  /** Initial `[from, to]` when uncontrolled. Defaults to `[min, max]`. */
  defaultValue?: MinMaxValue;
  /** Fired with the new `[from, to]`. */
  onChange?: (value: MinMaxValue) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Smallest allowed distance between the two thumbs. Defaults to `0`. */
  minGap?: number;
  /** Shows the current range beside the label. */
  showValue?: boolean;
  /** Formats each end for display and for `aria-valuetext`. */
  formatValue?: (value: number) => string;
  /** Base field name. The thumbs submit as `${name}-min` and `${name}-max`. */
  name?: string;
  disabled?: boolean;
  /** Accessible name when there's no visible `label`. */
  "aria-label"?: string;
  className?: string;
};

/**
 * Two-thumb slider for picking a from–to range.
 *
 * Built from two overlaid native `<input type="range">` elements rather than a
 * custom widget, so each thumb keeps real `role="slider"` semantics, keyboard
 * stepping, and value announcements. The visible track and fill are decorative
 * spans; the inputs' own tracks are transparent.
 */
export function MinMaxSlider({
  label,
  helperText,
  error,
  value,
  defaultValue,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  minGap = 0,
  showValue = false,
  formatValue,
  name,
  disabled = false,
  "aria-label": ariaLabel,
  className,
}: MinMaxSliderProps) {
  const labelId = useId();
  const messageId = useId();

  const [uncontrolledValue, setUncontrolledValue] = useState<MinMaxValue>(
    defaultValue ?? [min, max],
  );
  const isControlled = value !== undefined;
  const [from, to] = isControlled ? value : uncontrolledValue;

  const invalid = Boolean(error);
  const message = error ?? helperText;

  const commit = (next: MinMaxValue) => {
    if (!isControlled) setUncontrolledValue(next);
    onChange?.(next);
  };

  // Clamp against the other thumb so the two can never cross.
  const handleFromChange = (event: ChangeEvent<HTMLInputElement>) => {
    commit([Math.min(Number(event.target.value), to - minGap), to]);
  };

  const handleToChange = (event: ChangeEvent<HTMLInputElement>) => {
    commit([from, Math.max(Number(event.target.value), from + minGap)]);
  };

  const asPercent = (n: number) => (max === min ? 0 : ((n - min) / (max - min)) * 100);
  const fromPercent = asPercent(from);
  const toPercent = asPercent(to);

  const format = (n: number) => (formatValue ? formatValue(n) : String(n));

  /*
   * Both inputs span the full width, so their thumbs overlap. Pointer events
   * are disabled on the inputs and re-enabled on the thumbs alone, but when
   * the thumbs coincide the later element still wins. Raising the "from" input
   * once it's past halfway keeps it grabbable at the top of the range.
   */
  const fromOnTop = from > (min + max) / 2;

  const classes = [
    "sh-minmax",
    invalid && "sh-minmax--invalid",
    disabled && "sh-minmax--disabled",
    fromOnTop && "sh-minmax--from-on-top",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const accessibleName = label ? undefined : ariaLabel;
  const thumbName = (suffix: string) =>
    label || ariaLabel ? `${label ?? ariaLabel} ${suffix}` : suffix;

  return (
    <div
      className={classes}
      style={
        {
          "--sh-minmax-from": `${fromPercent}%`,
          "--sh-minmax-to": `${toPercent}%`,
        } as CSSProperties
      }
    >
      {(label || showValue) && (
        <span className="sh-minmax__header">
          {label && (
            <span className="sh-minmax__label" id={labelId}>
              {label}
            </span>
          )}
          {showValue && (
            <span className="sh-minmax__value">
              {format(from)} – {format(to)}
            </span>
          )}
        </span>
      )}

      {/* Two sliders, so the pair is a group rather than one labelled control. */}
      <div
        className="sh-minmax__rail"
        role="group"
        aria-label={accessibleName}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={message ? messageId : undefined}
        aria-invalid={invalid || undefined}
      >
        <span className="sh-minmax__track" aria-hidden="true">
          <span className="sh-minmax__fill" />
        </span>

        <input
          type="range"
          className="sh-minmax__input sh-minmax__input--from"
          name={name ? `${name}-min` : undefined}
          min={min}
          max={max}
          step={step}
          value={from}
          disabled={disabled}
          onChange={handleFromChange}
          aria-label={thumbName("minimum")}
          aria-valuetext={formatValue ? format(from) : undefined}
        />
        <input
          type="range"
          className="sh-minmax__input sh-minmax__input--to"
          name={name ? `${name}-max` : undefined}
          min={min}
          max={max}
          step={step}
          value={to}
          disabled={disabled}
          onChange={handleToChange}
          aria-label={thumbName("maximum")}
          aria-valuetext={formatValue ? format(to) : undefined}
        />
      </div>

      {message && (
        <span id={messageId} className="sh-minmax__message">
          {message}
        </span>
      )}
    </div>
  );
}
