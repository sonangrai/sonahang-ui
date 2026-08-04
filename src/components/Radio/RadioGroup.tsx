import { useId, useState } from "react";
import type { ReactNode } from "react";

import { RadioGroupContext } from "./radio.context";
import "./Radio.css";

export type RadioGroupProps = {
  children?: ReactNode;
  /** Selected value — makes the group controlled. */
  value?: string;
  /** Initial selection when uncontrolled. */
  defaultValue?: string;
  /** Fired with the newly selected value. */
  onChange?: (value: string) => void;
  /** Visible label for the group. Provide this or `aria-label`. */
  label?: ReactNode;
  /** Hint shown below the options. Replaced by `error` when that's set. */
  helperText?: ReactNode;
  /** Validation message. Its presence also marks the group invalid. */
  error?: ReactNode;
  /** Radio group name. Auto-generated when omitted. */
  name?: string;
  /** Layout direction for the options. Defaults to `vertical`. */
  orientation?: "vertical" | "horizontal";
  /** Disables every option in the group. */
  disabled?: boolean;
  /** Accessible name when there's no visible `label`. */
  "aria-label"?: string;
  className?: string;
};

/** Groups `Radio` options, coordinating their shared name and selection. */
export function RadioGroup({
  children,
  value,
  defaultValue,
  onChange,
  label,
  helperText,
  error,
  name,
  orientation = "vertical",
  disabled = false,
  "aria-label": ariaLabel,
  className,
}: RadioGroupProps) {
  const generatedName = useId();
  const labelId = useId();
  const messageId = useId();
  const groupName = name ?? generatedName;

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const selected = isControlled ? value : uncontrolledValue;

  const handleSelect = (next: string) => {
    if (!isControlled) setUncontrolledValue(next);
    onChange?.(next);
  };

  const invalid = Boolean(error);
  const message = error ?? helperText;

  const classes = ["sh-radio-group", invalid && "sh-radio-group--invalid", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {label && (
        <span className="sh-radio-group__label" id={labelId}>
          {label}
        </span>
      )}

      <div
        className={`sh-radio-group__options sh-radio-group__options--${orientation}`}
        role="radiogroup"
        aria-label={label ? undefined : ariaLabel}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={message ? messageId : undefined}
        aria-invalid={invalid || undefined}
      >
        <RadioGroupContext.Provider
          value={{ name: groupName, value: selected, onSelect: handleSelect, disabled }}
        >
          {children}
        </RadioGroupContext.Provider>
      </div>

      {message && (
        <span id={messageId} className="sh-radio-group__message">
          {message}
        </span>
      )}
    </div>
  );
}
