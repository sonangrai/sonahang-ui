import type { HTMLAttributes, ReactNode } from "react";

import { closeIcon, statusIcons } from "../../internal/statusIcons";
import type { ToastAction } from "./toast.store";
import type { ToastVariant } from "./toast.tokens";
import "./Toast.css";

/** Same split as Alert: only warnings and errors interrupt. */
const defaultRole: Record<ToastVariant, "alert" | "status"> = {
  default: "status",
  success: "status",
  info: "status",
  warning: "alert",
  error: "alert",
  loading: "status",
};

const loadingIcon = <span className="sh-toast__spinner" />;

export type ToastProps = {
  /** Defaults to `default`, which has no icon. `loading` shows a spinner. */
  variant?: ToastVariant;
  title: ReactNode;
  /** Secondary line under the title. */
  description?: ReactNode;
  /** Replaces the variant's icon, or hides it with `false`. */
  icon?: ReactNode | false;
  /** A single button, e.g. "Undo". */
  action?: ToastAction;
  /** Renders a close button and is called when it's activated. */
  onDismiss?: () => void;
  /** Accessible name for the close button. Defaults to "Dismiss". */
  dismissLabel?: string;
  /**
   * Overrides how assistive tech announces this. Defaults to `alert` for
   * warning/error and `status` otherwise.
   */
  role?: "alert" | "status" | "none";
} & Omit<HTMLAttributes<HTMLDivElement>, "title" | "role">;

/**
 * A single notification card.
 *
 * Usually you won't render this yourself — call `toast()` and let
 * `<Toaster />` handle stacking, timing and dismissal. It's exported for
 * custom layouts and for documentation.
 */
export function Toast({
  variant = "default",
  title,
  description,
  icon,
  action,
  onDismiss,
  dismissLabel = "Dismiss",
  role,
  className,
  ...props
}: ToastProps) {
  const resolvedIcon =
    icon !== undefined
      ? icon
      : variant === "default"
        ? false
        : variant === "loading"
          ? loadingIcon
          : statusIcons[variant];

  return (
    <div
      className={["sh-toast", `sh-toast--${variant}`, className].filter(Boolean).join(" ")}
      role={role ?? defaultRole[variant]}
      {...props}
    >
      {resolvedIcon !== false && (
        <span className="sh-toast__icon" aria-hidden="true">
          {resolvedIcon}
        </span>
      )}

      <div className="sh-toast__content">
        <div className="sh-toast__title">{title}</div>
        {description && <div className="sh-toast__description">{description}</div>}
      </div>

      {action && (
        <button type="button" className="sh-toast__action" onClick={action.onClick}>
          {action.label}
        </button>
      )}

      {onDismiss && (
        <button
          type="button"
          className="sh-toast__dismiss"
          onClick={onDismiss}
          aria-label={dismissLabel}
        >
          {closeIcon}
        </button>
      )}
    </div>
  );
}
