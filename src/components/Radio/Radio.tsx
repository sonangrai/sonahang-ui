import { useContext } from "react";
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";

import { RadioGroupContext } from "./radio.context";
import "./Radio.css";

export type RadioProps = {
  /** Value this option represents. Required when inside a `RadioGroup`. */
  value?: string;
  /** Visible label sitting beside the control. */
  label?: ReactNode;
  /** Class for the wrapping `<label>`. Use `inputClassName` for the control. */
  className?: string;
  /** Class for the underlying `<input type="radio">`. */
  inputClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "className">;

/**
 * A single radio option. Usually rendered inside a `RadioGroup`, which
 * supplies the shared `name` and selection; works standalone too, in which
 * case `name`/`checked`/`onChange` behave like a plain `<input type="radio">`.
 */
export function Radio({
  value,
  label,
  className,
  inputClassName,
  name,
  checked,
  disabled,
  onChange,
  ...props
}: RadioProps) {
  const group = useContext(RadioGroupContext);

  // Inside a group the group owns name/selection/disabled; standalone, the
  // component's own props do.
  const resolvedName = name ?? group?.name;
  const resolvedChecked = group ? group.value === value : checked;
  const resolvedDisabled = disabled ?? group?.disabled;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (group && value !== undefined) group.onSelect(value);
    onChange?.(event);
  };

  const classes = ["sh-radio", resolvedDisabled && "sh-radio--disabled", className]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={classes}>
      <input
        type="radio"
        className={["sh-radio__input", inputClassName].filter(Boolean).join(" ")}
        name={resolvedName}
        value={value}
        checked={resolvedChecked}
        disabled={resolvedDisabled}
        onChange={handleChange}
        {...props}
      />
      {label && <span className="sh-radio__label">{label}</span>}
    </label>
  );
}
