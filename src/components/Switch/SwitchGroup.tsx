import { useId, useState } from "react";
import type { ReactNode } from "react";

import { SwitchGroupContext } from "./switch.context";
import "./Switch.css";

export type SwitchGroupProps = {
  children?: ReactNode;
  /** Values of the switches that are on — makes the group controlled. */
  value?: string[];
  /** Initially-on switches when uncontrolled. */
  defaultValue?: string[];
  /** Fired with the full list of switches that are on. */
  onChange?: (value: string[]) => void;
  /** Visible label for the group. Provide this or `aria-label`. */
  label?: ReactNode;
  /** Hint shown below the switches. Replaced by `error` when that's set. */
  helperText?: ReactNode;
  /** Validation message. Its presence also marks the group invalid. */
  error?: ReactNode;
  /** Shared field name for the switches. Auto-generated when omitted. */
  name?: string;
  /** Layout direction for the switches. Defaults to `vertical`. */
  orientation?: "vertical" | "horizontal";
  /** Default label side for every switch in the group. Individual props win. */
  labelPosition?: "left" | "right";
  /** Disables every switch in the group. */
  disabled?: boolean;
  /** Accessible name when there's no visible `label`. */
  "aria-label"?: string;
  className?: string;
};

/** Groups `Switch` toggles, coordinating their shared name and state. */
export function SwitchGroup({
  children,
  value,
  defaultValue,
  onChange,
  label,
  helperText,
  error,
  name,
  orientation = "vertical",
  labelPosition,
  disabled = false,
  "aria-label": ariaLabel,
  className,
}: SwitchGroupProps) {
  const generatedName = useId();
  const labelId = useId();
  const messageId = useId();
  const groupName = name ?? generatedName;

  const [uncontrolledValue, setUncontrolledValue] = useState<string[]>(defaultValue ?? []);
  const isControlled = value !== undefined;
  const selected = isControlled ? value : uncontrolledValue;

  const handleToggle = (switchValue: string, checked: boolean) => {
    // Rebuild from the current selection so the callback always receives the
    // complete list, not a delta.
    const next = checked
      ? [...selected, switchValue]
      : selected.filter((item) => item !== switchValue);

    if (!isControlled) setUncontrolledValue(next);
    onChange?.(next);
  };

  const invalid = Boolean(error);
  const message = error ?? helperText;

  const classes = ["sh-switch-group", invalid && "sh-switch-group--invalid", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {label && (
        <span className="sh-switch-group__label" id={labelId}>
          {label}
        </span>
      )}

      {/*
        `group` rather than a select-style role — switches toggle
        independently, so there's no native grouping role for them.
      */}
      <div
        className={`sh-switch-group__options sh-switch-group__options--${orientation}`}
        role="group"
        aria-label={label ? undefined : ariaLabel}
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={message ? messageId : undefined}
        aria-invalid={invalid || undefined}
      >
        <SwitchGroupContext.Provider
          value={{
            name: groupName,
            value: selected,
            onToggle: handleToggle,
            disabled,
            labelPosition,
          }}
        >
          {children}
        </SwitchGroupContext.Provider>
      </div>

      {message && (
        <span id={messageId} className="sh-switch-group__message">
          {message}
        </span>
      )}
    </div>
  );
}
