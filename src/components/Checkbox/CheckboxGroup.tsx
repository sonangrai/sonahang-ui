import { useId, useState } from "react";
import type { ReactNode } from "react";

import { CheckboxGroupContext } from "./checkbox.context";
import "./Checkbox.css";

export type CheckboxGroupProps = {
  children?: ReactNode;
  /** Selected values — makes the group controlled. */
  value?: string[];
  /** Initial selection when uncontrolled. */
  defaultValue?: string[];
  /** Fired with the full list of selected values. */
  onChange?: (value: string[]) => void;
  /** Visible label for the group. Provide this or `aria-label`. */
  label?: ReactNode;
  /** Hint shown below the options. Replaced by `error` when that's set. */
  helperText?: ReactNode;
  /** Validation message. Its presence also marks the group invalid. */
  error?: ReactNode;
  /** Shared field name for the options. Auto-generated when omitted. */
  name?: string;
  /** Layout direction for the options. Defaults to `vertical`. */
  orientation?: "vertical" | "horizontal";
  /** Disables every option in the group. */
  disabled?: boolean;
  /** Accessible name when there's no visible `label`. */
  "aria-label"?: string;
  className?: string;
};

/** Groups `Checkbox` options, coordinating their shared name and selection. */
export function CheckboxGroup({
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
}: CheckboxGroupProps) {
  const generatedName = useId();
  const labelId = useId();
  const messageId = useId();
  const groupName = name ?? generatedName;

  const [uncontrolledValue, setUncontrolledValue] = useState<string[]>(defaultValue ?? []);
  const isControlled = value !== undefined;
  const selected = isControlled ? value : uncontrolledValue;

  const handleToggle = (optionValue: string, checked: boolean) => {
    // Rebuild from the current selection so the callback always receives the
    // complete list, not a delta.
    const next = checked
      ? [...selected, optionValue]
      : selected.filter((item) => item !== optionValue);

    if (!isControlled) setUncontrolledValue(next);
    onChange?.(next);
  };

  const invalid = Boolean(error);
  const message = error ?? helperText;

  const classes = ["sh-checkbox-group", invalid && "sh-checkbox-group--invalid", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {label && (
        <span className="sh-checkbox-group__label" id={labelId}>
          {label}
        </span>
      )}

      {/*
        `group` rather than `radiogroup` — there's no native grouping role for
        checkboxes, since each one is independently toggleable.
      */}
      <div
        className={`sh-checkbox-group__options sh-checkbox-group__options--${orientation}`}
        role="group"
        aria-label={label ? undefined : ariaLabel}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={message ? messageId : undefined}
        aria-invalid={invalid || undefined}
      >
        <CheckboxGroupContext.Provider
          value={{ name: groupName, value: selected, onToggle: handleToggle, disabled }}
        >
          {children}
        </CheckboxGroupContext.Provider>
      </div>

      {message && (
        <span id={messageId} className="sh-checkbox-group__message">
          {message}
        </span>
      )}
    </div>
  );
}
