import type { HTMLAttributes, ReactNode } from "react";

import type { AlertVariant } from "./alert.tokens";
import "./Alert.css";

const icons: Record<AlertVariant, ReactNode> = {
  success: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" />
      <path d="M6.75 10.25l2.25 2.25 4.25-4.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 9v4.5" strokeLinecap="round" />
      <circle cx="10" cy="6.4" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <path d="M10 2.8 18 16.5H2L10 2.8Z" strokeLinejoin="round" />
      <path d="M10 8v3.5" strokeLinecap="round" />
      <circle cx="10" cy="13.9" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" />
      <path d="M7.5 7.5l5 5M12.5 7.5l-5 5" strokeLinecap="round" />
    </svg>
  ),
};

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" strokeLinecap="round" />
  </svg>
);

/**
 * Errors and warnings interrupt; confirmations and information shouldn't.
 * `alert` is assertive and cuts off whatever a screen reader is saying, so
 * it's reserved for the two that warrant it.
 */
const defaultRole: Record<AlertVariant, "alert" | "status"> = {
  success: "status",
  info: "status",
  warning: "alert",
  error: "alert",
};

export type AlertProps = {
  /** Status this alert conveys. Defaults to `info`. */
  variant?: AlertVariant;
  /** Bolded heading above the body. */
  title?: ReactNode;
  /** Body content. */
  children?: ReactNode;
  /** Replaces the variant's icon, or hides it entirely with `false`. */
  icon?: ReactNode | false;
  /** Renders a dismiss button and is called when it's activated. */
  onDismiss?: () => void;
  /** Accessible name for the dismiss button. Defaults to "Dismiss". */
  dismissLabel?: string;
  /**
   * Overrides how assistive tech announces this. Defaults to `alert` for
   * warning/error and `status` for success/info.
   */
  role?: "alert" | "status" | "none";
} & Omit<HTMLAttributes<HTMLDivElement>, "title" | "role">;

/** Coloured banner conveying the outcome or status of something. */
export function Alert({
  variant = "info",
  title,
  children,
  icon,
  onDismiss,
  dismissLabel = "Dismiss",
  role,
  className,
  ...props
}: AlertProps) {
  const classes = ["sh-alert", `sh-alert--${variant}`, className].filter(Boolean).join(" ");
  const resolvedIcon = icon === undefined ? icons[variant] : icon;

  return (
    <div className={classes} role={role ?? defaultRole[variant]} {...props}>
      {resolvedIcon !== false && <span className="sh-alert__icon">{resolvedIcon}</span>}

      <div className="sh-alert__content">
        {title && <p className="sh-alert__title">{title}</p>}
        {children && <div className="sh-alert__body">{children}</div>}
      </div>

      {onDismiss && (
        <button
          type="button"
          className="sh-alert__dismiss"
          onClick={onDismiss}
          aria-label={dismissLabel}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}
