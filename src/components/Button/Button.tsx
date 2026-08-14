import type { ButtonHTMLAttributes, ReactNode } from "react";

import { buttonClassNames } from "./buttonClassNames";
import type { ButtonSize, ButtonVariant } from "./button.tokens";
import "./Button.css";

export type ButtonProps = {
  /** Visual style of the button. Defaults to `primary`. Use `icon` for an icon-only, square button. */
  variant?: ButtonVariant;
  /** Size of the button. Defaults to `md`. */
  size?: ButtonSize;
  /** Stretches the button to fill its container's width. */
  fullWidth?: boolean;
  /** Icon to render alongside `children`, or on its own when `variant="icon"`. Note: icon-only buttons need an `aria-label`. */
  icon?: ReactNode;
  /** Where `icon` renders relative to `children`. Ignored when `variant="icon"`. Defaults to `left`. */
  iconPosition?: "left" | "right";
  /** Shows a spinner on the left and disables the button while an async action is pending. Content stays visible, so `children` can be swapped for a loading message. */
  loading?: boolean;
  children?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

/** Interactive button primitive for the design system. */
export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  icon,
  iconPosition = "left",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const isIconOnly = variant === "icon";
  const classes = buttonClassNames({ variant, size, fullWidth, loading, className });

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      <span className="sh-button__content">
        {loading && <span className="sh-button__spinner" aria-hidden="true" />}
        {isIconOnly ? (
          !loading && <span className="sh-button__icon">{icon}</span>
        ) : (
          <>
            {icon && iconPosition === "left" && !loading && (
              <span className="sh-button__icon">{icon}</span>
            )}
            {children}
            {icon && iconPosition === "right" && (
              <span className="sh-button__icon">{icon}</span>
            )}
          </>
        )}
      </span>
    </button>
  );
}
