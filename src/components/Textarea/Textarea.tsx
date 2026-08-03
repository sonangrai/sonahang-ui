import { useId } from "react";
import type { ReactNode, TextareaHTMLAttributes } from "react";

import "./Textarea.css";

export type TextareaResize = "none" | "vertical" | "horizontal" | "both";

export type TextareaProps = {
  /** Visible label, associated with the textarea via `htmlFor`/`id`. */
  label?: ReactNode;
  /** Hint shown below the textarea. Replaced by `error` when that's set. */
  helperText?: ReactNode;
  /** Validation message. Its presence also marks the textarea invalid. */
  error?: ReactNode;
  /** Which directions the user can resize. Defaults to `vertical`. */
  resize?: TextareaResize;
  /** Class for the wrapper element. Use `textareaClassName` for the control. */
  className?: string;
  /** Class for the underlying `<textarea>`. */
  textareaClassName?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className">;

/** Multi-line text field with an associated label, helper text, and error state. */
export function Textarea({
  label,
  helperText,
  error,
  resize = "vertical",
  className,
  textareaClassName,
  id,
  rows = 3,
  required,
  disabled,
  "aria-describedby": ariaDescribedBy,
  ...props
}: TextareaProps) {
  // Only used when the consumer doesn't supply an id — the label needs a
  // stable target either way.
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const messageId = `${textareaId}-message`;

  const invalid = Boolean(error);
  const message = error ?? helperText;

  // Keep any describedby the consumer passed; don't clobber it.
  const describedBy =
    [ariaDescribedBy, message ? messageId : undefined].filter(Boolean).join(" ") || undefined;

  const classes = [
    "sh-textarea",
    invalid && "sh-textarea--invalid",
    disabled && "sh-textarea--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {label && (
        <label className="sh-textarea__label" htmlFor={textareaId}>
          {label}
          {required && (
            <span className="sh-textarea__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <textarea
        id={textareaId}
        className={[
          "sh-textarea__control",
          `sh-textarea__control--resize-${resize}`,
          textareaClassName,
        ]
          .filter(Boolean)
          .join(" ")}
        rows={rows}
        required={required}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        {...props}
      />

      {message && (
        <span id={messageId} className="sh-textarea__message">
          {message}
        </span>
      )}
    </div>
  );
}
