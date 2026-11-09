import type { HTMLAttributes, ReactNode } from "react";

import { closeIcon, statusIcons as icons } from "../../internal/statusIcons";
import type { AlertVariant } from "./alert.tokens";
import "./Alert.css";

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
          {closeIcon}
        </button>
      )}
    </div>
  );
}
