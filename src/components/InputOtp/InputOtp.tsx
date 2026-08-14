import { Fragment, useId, useRef, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

import { sanitizeOtpValue } from "./sanitizeOtpValue";
import type { OtpType } from "./sanitizeOtpValue";
import "./InputOtp.css";

export type InputOtpProps = {
  /** Number of characters in the code. Defaults to 6. */
  length?: number;
  /** The code — makes the component controlled. */
  value?: string;
  /** Starting code when uncontrolled. */
  defaultValue?: string;
  /** Fired with the whole code whenever it changes. */
  onChange?: (value: string) => void;
  /** Fired once, when the last character lands. */
  onComplete?: (value: string) => void;
  /** Which characters are accepted. Defaults to `numeric`. */
  type?: OtpType;
  /** Hides the characters behind dots, for codes that are secrets. */
  mask?: boolean;
  /** Draws a separator every N characters — 3 gives `123 456`. */
  groupSize?: number;
  /** Visible label, associated with the field via `htmlFor`/`id`. */
  label?: ReactNode;
  /** Hint shown below the field. Replaced by `error` when that's set. */
  helperText?: ReactNode;
  /** Validation message. Its presence also marks the field invalid. */
  error?: ReactNode;
  /** Class for the wrapper element. */
  className?: string;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "value" | "defaultValue" | "onChange" | "type" | "maxLength" | "size"
>;

/**
 * One-time-code field: a row of boxes backed by a single text input.
 *
 * The boxes are presentation. The value lives in one real `<input>` covering
 * them, which is what makes `autocomplete="one-time-code"`, pasting, undo,
 * password managers and screen-reader labelling work without being rebuilt —
 * a row of six separate inputs is six unlabelled fields to assistive tech, and
 * reimplements a text field along the way.
 */
export function InputOtp({
  length = 6,
  value: controlledValue,
  defaultValue = "",
  onChange,
  onComplete,
  type = "numeric",
  mask = false,
  groupSize,
  label,
  helperText,
  error,
  className,
  id,
  required,
  disabled,
  "aria-describedby": ariaDescribedBy,
  onFocus,
  onBlur,
  onSelect,
  onClick,
  ...props
}: InputOtpProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;

  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [caret, setCaret] = useState(0);

  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    sanitizeOtpValue(defaultValue, { length, type }),
  );
  const isControlled = controlledValue !== undefined;
  // Sanitised on the way in as well as out, so a controlled parent handing
  // back "12-34" can't put characters in the boxes that typing couldn't.
  const value = isControlled
    ? sanitizeOtpValue(controlledValue, { length, type })
    : uncontrolledValue;

  const invalid = Boolean(error);
  const message = error ?? helperText;
  const describedBy =
    [ariaDescribedBy, message ? messageId : undefined].filter(Boolean).join(" ") || undefined;

  /*
   * The input is invisible, so a click maps to an arbitrary offset in text
   * nobody can see. Collapsing to the end makes it predictable: focus the
   * field and the next character goes in the next empty box. Arrow keys still
   * move deliberately.
   */
  const moveCaretToEnd = () => {
    const input = inputRef.current;
    if (!input) return;

    const end = input.value.length;
    input.setSelectionRange(end, end);
    setCaret(end);
  };

  const characters = Array.from({ length }, (_, index) => value[index] ?? "");
  const activeIndex = focused && !disabled ? Math.min(caret, length - 1) : -1;

  return (
    <div
      className={[
        "sh-input-otp",
        invalid && "sh-input-otp--invalid",
        disabled && "sh-input-otp--disabled",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label && (
        <label className="sh-input-otp__label" htmlFor={inputId}>
          {label}
          {required && (
            <span className="sh-input-otp__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="sh-input-otp__field">
        <input
          ref={inputRef}
          id={inputId}
          className="sh-input-otp__control"
          value={value}
          /*
           * Deliberately no `maxLength`. The browser truncates a paste to fit
           * it *before* any handler runs, so "123-456" would arrive as
           * "123-45" and clean up to five digits. The length cap lives in
           * sanitizeOtpValue, which counts only the characters it keeps.
           */
          required={required}
          disabled={disabled}
          /* Numeric codes get the number pad; letters need the full keyboard. */
          inputMode={type === "numeric" ? "numeric" : "text"}
          autoComplete="one-time-code"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(event) => {
            const next = sanitizeOtpValue(event.target.value, { length, type });
            // A rejected character leaves the value untouched; React puts the
            // input's DOM value back on its own.
            if (next === value) return;

            if (!isControlled) setUncontrolledValue(next);
            onChange?.(next);

            /*
             * Every time the code becomes full, including when a complete one
             * is replaced by another — pasting a corrected code over the top
             * should still submit. Typing into a full code can't reach here at
             * all, because the value doesn't change.
             */
            if (next.length === length) onComplete?.(next);
          }}
          onFocus={(event) => {
            onFocus?.(event);
            setFocused(true);
            moveCaretToEnd();
          }}
          onBlur={(event) => {
            onBlur?.(event);
            setFocused(false);
          }}
          onClick={(event) => {
            onClick?.(event);
            moveCaretToEnd();
          }}
          onSelect={(event) => {
            onSelect?.(event);
            setCaret(event.currentTarget.selectionStart ?? value.length);
          }}
          {...props}
        />

        {/* Presentation only — the input above carries the value and the name. */}
        <div className="sh-input-otp__boxes" aria-hidden="true">
          {characters.map((character, index) => (
            <Fragment key={index}>
              {groupSize !== undefined && index > 0 && index % groupSize === 0 && (
                <span className="sh-input-otp__separator" />
              )}

              <span
                className={[
                  "sh-input-otp__slot",
                  character && "sh-input-otp__slot--filled",
                  index === activeIndex && "sh-input-otp__slot--active",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {character && mask ? "•" : character}
              </span>
            </Fragment>
          ))}
        </div>
      </div>

      {message && (
        <span id={messageId} className="sh-input-otp__message">
          {message}
        </span>
      )}
    </div>
  );
}
