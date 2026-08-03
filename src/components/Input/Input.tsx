import { useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

import "./Input.css";

export type InputProps = {
  /** Visible label, associated with the input via `htmlFor`/`id`. */
  label?: ReactNode;
  /** Hint shown below the input. Replaced by `error` when that's set. */
  helperText?: ReactNode;
  /** Validation message. Its presence also marks the input invalid. */
  error?: ReactNode;
  /** Decorative icon rendered inside the field. See `iconPosition`. */
  icon?: ReactNode;
  /** Which side `icon` sits on. Defaults to `left`. */
  iconPosition?: "left" | "right";
  /** Class for the wrapper element. Use `inputClassName` for the input itself. */
  className?: string;
  /** Class for the underlying `<input>`. */
  inputClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

/** Text input with an associated label, helper text, error state, and optional icon. */
export function Input({
  label,
  helperText,
  error,
  icon,
  iconPosition = "left",
  className,
  inputClassName,
  id,
  required,
  disabled,
  "aria-describedby": ariaDescribedBy,
  ...props
}: InputProps) {
  // Only used when the consumer doesn't supply an id — the label needs a
  // stable target either way.
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;

  const invalid = Boolean(error);
  const message = error ?? helperText;

  // Keep any describedby the consumer passed; don't clobber it.
  const describedBy =
    [ariaDescribedBy, message ? messageId : undefined].filter(Boolean).join(" ") || undefined;

  const classes = [
    "sh-input",
    invalid && "sh-input--invalid",
    disabled && "sh-input--disabled",
    icon && `sh-input--with-icon-${iconPosition}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {label && (
        <label className="sh-input__label" htmlFor={inputId}>
          {label}
          {required && (
            <span className="sh-input__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <span className="sh-input__field">
        {icon && (
          <span className="sh-input__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={["sh-input__control", inputClassName].filter(Boolean).join(" ")}
          required={required}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          {...props}
        />
      </span>

      {message && (
        <span id={messageId} className="sh-input__message">
          {message}
        </span>
      )}
    </div>
  );
}
