import { useId, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

import "./SegmentedControl.css";

export type SegmentedControlOption = {
  /** Value reported to `onChange` and submitted with a form. */
  value: string;
  /** Visible content for the segment. */
  label: ReactNode;
  /** Disables just this segment. */
  disabled?: boolean;
};

export type SegmentedControlProps = {
  /** The segments, in display order. */
  options: SegmentedControlOption[];
  /** Selected value — makes the component controlled. */
  value?: string;
  /** Initial selection when uncontrolled. */
  defaultValue?: string;
  /** Fired with the newly selected value. */
  onChange?: (value: string) => void;
  /** Visible label for the group. Provide this or `aria-label`. */
  label?: ReactNode;
  /** Radio group name. Auto-generated when omitted. */
  name?: string;
  /** Stretches the control to fill its container, splitting segments evenly. */
  fullWidth?: boolean;
  /** Disables every segment. */
  disabled?: boolean;
  /** Accessible name when there's no visible `label`. */
  "aria-label"?: string;
  className?: string;
};

/**
 * Single-select control rendered as a row of blocks.
 *
 * Built on native `<input type="radio">` rather than `role="radio"` buttons,
 * so arrow-key navigation, group semantics, and form submission all come
 * from the platform instead of being reimplemented.
 */
export function SegmentedControl({
  options,
  value,
  defaultValue,
  onChange,
  label,
  name,
  fullWidth = false,
  disabled = false,
  "aria-label": ariaLabel,
  className,
}: SegmentedControlProps) {
  const generatedName = useId();
  const labelId = useId();
  const groupName = name ?? generatedName;

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const selected = isControlled ? value : uncontrolledValue;

  const handleChange = (next: string) => {
    if (!isControlled) setUncontrolledValue(next);
    onChange?.(next);
  };

  // The sliding indicator is a single ::after on the track, so CSS needs to
  // know which slot to sit in. Segments are equal-width, so the position is
  // just `index * 100%` of one segment.
  const selectedIndex = options.findIndex((option) => option.value === selected);

  const classes = [
    "sh-segmented",
    fullWidth && "sh-segmented--full-width",
    disabled && "sh-segmented--disabled",
    selectedIndex < 0 && "sh-segmented--unselected",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const trackStyle = {
    "--sh-segmented-count": options.length,
    "--sh-segmented-index": Math.max(selectedIndex, 0),
  } as CSSProperties;

  return (
    <div className="sh-segmented-field">
      {label && (
        <span className="sh-segmented__group-label" id={labelId}>
          {label}
        </span>
      )}

      <div
        className={classes}
        style={trackStyle}
        role="radiogroup"
        aria-label={label ? undefined : ariaLabel}
        aria-labelledby={label ? labelId : undefined}
      >
        {options.map((option) => {
          const optionDisabled = disabled || option.disabled;

          return (
            <label
              key={option.value}
              className={[
                "sh-segmented__item",
                optionDisabled && "sh-segmented__item--disabled",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <input
                className="sh-segmented__input"
                type="radio"
                name={groupName}
                value={option.value}
                checked={selected === option.value}
                disabled={optionDisabled}
                onChange={() => handleChange(option.value)}
              />
              <span className="sh-segmented__label">{option.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
