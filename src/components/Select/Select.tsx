import { useId } from "react";
import type { ReactNode, SelectHTMLAttributes } from "react";

import "./Select.css";

const ChevronIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path d="M4 6.5 8 10.5l4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectOptionGroup = {
  label: string;
  options: SelectOption[];
};

const isGroup = (item: SelectOption | SelectOptionGroup): item is SelectOptionGroup =>
  "options" in item;

export type SelectProps = {
  /** Visible label, associated with the select via `htmlFor`/`id`. */
  label?: ReactNode;
  /** Hint shown below the select. Replaced by `error` when that's set. */
  helperText?: ReactNode;
  /** Validation message. Its presence also marks the select invalid. */
  error?: ReactNode;
  /** Options to render. Omit and pass `children` to build them yourself. */
  options?: (SelectOption | SelectOptionGroup)[];
  /** Prompt shown while nothing is chosen. Rendered as an unselectable option. */
  placeholder?: string;
  /** Decorative icon rendered at the start of the field. */
  icon?: ReactNode;
  /** Class for the wrapper element. Use `selectClassName` for the control. */
  className?: string;
  /** Class for the underlying `<select>`. */
  selectClassName?: string;
  children?: ReactNode;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "className">;

/**
 * Dropdown built on the native `<select>`, so keyboard support, type-ahead,
 * form submission, and the platform's own picker on mobile all come for free.
 *
 * The closed control is fully styled; the open list is drawn by the OS and
 * can't be. A component that needs custom option rendering, search, or
 * multi-select chips would be a different, much larger widget.
 */
export function Select({
  label,
  helperText,
  error,
  options,
  placeholder,
  icon,
  className,
  selectClassName,
  children,
  id,
  required,
  disabled,
  multiple,
  "aria-describedby": ariaDescribedBy,
  ...props
}: SelectProps) {
  // Only used when the consumer doesn't supply an id — the label needs a
  // stable target either way.
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const messageId = `${selectId}-message`;

  const invalid = Boolean(error);
  const message = error ?? helperText;

  // Keep any describedby the consumer passed; don't clobber it.
  const describedBy =
    [ariaDescribedBy, message ? messageId : undefined].filter(Boolean).join(" ") || undefined;

  const classes = [
    "sh-select",
    invalid && "sh-select--invalid",
    disabled && "sh-select--disabled",
    icon && "sh-select--with-icon",
    // A multiple select is a list box, not a dropdown — no chevron to draw.
    multiple && "sh-select--multiple",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const renderOption = (option: SelectOption) => (
    <option key={option.value} value={option.value} disabled={option.disabled}>
      {option.label}
    </option>
  );

  return (
    <div className={classes}>
      {label && (
        <label className="sh-select__label" htmlFor={selectId}>
          {label}
          {required && (
            <span className="sh-select__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <span className="sh-select__field">
        {icon && (
          <span className="sh-select__icon" aria-hidden="true">
            {icon}
          </span>
        )}

        <select
          {...props}
          id={selectId}
          className={["sh-select__control", selectClassName].filter(Boolean).join(" ")}
          required={required}
          disabled={disabled}
          multiple={multiple}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        >
          {/*
            Disabled so it can't be chosen again once a real option is picked,
            while still showing as the label until one is.
          */}
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options
            ? options.map((item) =>
                isGroup(item) ? (
                  <optgroup key={item.label} label={item.label}>
                    {item.options.map(renderOption)}
                  </optgroup>
                ) : (
                  renderOption(item)
                ),
              )
            : children}
        </select>

        {!multiple && (
          <span className="sh-select__chevron" aria-hidden="true">
            <ChevronIcon />
          </span>
        )}
      </span>

      {message && (
        <span id={messageId} className="sh-select__message">
          {message}
        </span>
      )}
    </div>
  );
}
