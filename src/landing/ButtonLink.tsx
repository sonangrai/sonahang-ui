import type { AnchorHTMLAttributes, ReactNode } from "react";

// Button itself is imported for its stylesheet — buttonClassNames hands out
// the classes but, being a plain function, pulls no CSS in with it.
import "../components/Button/Button.css";
import { buttonClassNames } from "../components/Button";
import type { ButtonSize, ButtonVariant } from "../components/Button";

export type ButtonLinkProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  children?: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children">;

/**
 * An `<a>` wearing the Button's clothes.
 *
 * The hero and footer calls to action navigate, so they have to be links —
 * a `<button>` with `window.location` in its handler loses middle-click,
 * "open in new tab", and the status bar preview. `buttonClassNames` is
 * exported by the library for exactly this.
 */
export function ButtonLink({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <a className={buttonClassNames({ variant, size, className })} {...props}>
      <span className="sh-button__content">
        {icon && iconPosition === "left" && <span className="sh-button__icon">{icon}</span>}
        {children}
        {icon && iconPosition === "right" && <span className="sh-button__icon">{icon}</span>}
      </span>
    </a>
  );
}
