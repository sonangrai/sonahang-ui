import { useContext, useEffect, useRef } from "react";
import type { ChangeEvent, InputHTMLAttributes, ReactNode, Ref } from "react";

import { CheckboxGroupContext } from "./checkbox.context";
import "./Checkbox.css";

export type CheckboxProps = {
  /** Value this option represents. Required when inside a `CheckboxGroup`. */
  value?: string;
  /** Visible label sitting beside the control. */
  label?: ReactNode;
  /**
   * Renders the mixed state (a dash). Purely visual until toggled — a
   * checkbox is never submitted as indeterminate.
   */
  indeterminate?: boolean;
  /** Class for the wrapping `<label>`. Use `inputClassName` for the control. */
  className?: string;
  /** Class for the underlying `<input type="checkbox">`. */
  inputClassName?: string;
  ref?: Ref<HTMLInputElement>;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "className" | "ref">;

/**
 * A single checkbox. Usually rendered inside a `CheckboxGroup`, which supplies
 * the shared `name` and selection; works standalone too, in which case
 * `checked`/`onChange` behave like a plain `<input type="checkbox">`.
 */
export function Checkbox({
  value,
  label,
  indeterminate = false,
  className,
  inputClassName,
  name,
  checked,
  disabled,
  onChange,
  ref,
  ...props
}: CheckboxProps) {
  const group = useContext(CheckboxGroupContext);
  const innerRef = useRef<HTMLInputElement>(null);

  // `indeterminate` has no HTML attribute — it's a DOM property only, so it
  // has to be assigned after render.
  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  // Keep our ref (needed above) without swallowing one the caller passed.
  const attachRef = (node: HTMLInputElement | null) => {
    innerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  // Inside a group the group owns name/selection/disabled; standalone, the
  // component's own props do.
  const resolvedName = name ?? group?.name;
  const resolvedChecked =
    group && value !== undefined ? group.value.includes(value) : checked;
  const resolvedDisabled = disabled ?? group?.disabled;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (group && value !== undefined) group.onToggle(value, event.target.checked);
    onChange?.(event);
  };

  const classes = ["sh-checkbox", resolvedDisabled && "sh-checkbox--disabled", className]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={classes}>
      <input
        {...props}
        type="checkbox"
        ref={attachRef}
        className={["sh-checkbox__input", inputClassName].filter(Boolean).join(" ")}
        name={resolvedName}
        value={value}
        checked={resolvedChecked}
        disabled={resolvedDisabled}
        onChange={handleChange}
      />
      {label && <span className="sh-checkbox__label">{label}</span>}
    </label>
  );
}
