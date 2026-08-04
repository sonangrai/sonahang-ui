import { useContext } from "react";
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";

import { SwitchGroupContext } from "./switch.context";
import "./Switch.css";

export type SwitchProps = {
  /** Value this switch represents. Required when inside a `SwitchGroup`. */
  value?: string;
  /** Visible label sitting beside the control. */
  label?: ReactNode;
  /** Which side the label sits on. Defaults to `right`, or the group's setting. */
  labelPosition?: "left" | "right";
  /** Class for the wrapping `<label>`. Use `inputClassName` for the control. */
  className?: string;
  /** Class for the underlying `<input>`. */
  inputClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "className">;

/**
 * Boolean toggle for a setting that applies immediately.
 *
 * Renders a checkbox with `role="switch"`, so it's announced as on/off rather
 * than checked/unchecked. Works standalone, or inside a `SwitchGroup` which
 * supplies the shared name and selection.
 */
export function Switch({
  value,
  label,
  labelPosition,
  className,
  inputClassName,
  name,
  checked,
  disabled,
  onChange,
  ...props
}: SwitchProps) {
  const group = useContext(SwitchGroupContext);

  // Inside a group the group owns name/selection/disabled; standalone, the
  // component's own props do.
  const resolvedName = name ?? group?.name;
  const resolvedChecked = group && value !== undefined ? group.value.includes(value) : checked;
  const resolvedDisabled = disabled ?? group?.disabled;
  const resolvedLabelPosition = labelPosition ?? group?.labelPosition ?? "right";

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (group && value !== undefined) group.onToggle(value, event.target.checked);
    onChange?.(event);
  };

  const classes = [
    "sh-switch",
    `sh-switch--label-${resolvedLabelPosition}`,
    resolvedDisabled && "sh-switch--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={classes}>
      <input
        {...props}
        type="checkbox"
        role="switch"
        className={["sh-switch__input", inputClassName].filter(Boolean).join(" ")}
        name={resolvedName}
        value={value}
        checked={resolvedChecked}
        disabled={resolvedDisabled}
        onChange={handleChange}
      />
      {/*
        The input is visually hidden but still focusable and still the real
        control; these two are painted in its place, which is what lets the
        thumb slide on a transform instead of a background position.
      */}
      <span className="sh-switch__track" aria-hidden="true">
        <span className="sh-switch__thumb" />
      </span>
      {label && <span className="sh-switch__label">{label}</span>}
    </label>
  );
}
