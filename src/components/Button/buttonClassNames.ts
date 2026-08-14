import type { ButtonSize, ButtonVariant } from "./button.tokens";

export type ButtonClassNameOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  className?: string;
};

/**
 * The class list `Button` puts on itself.
 *
 * Exported because `<button>` can't be a link: anything that needs to look
 * like a button while navigating — an `EmptyState` call to action, a "read the
 * docs" link — has to be an `<a>`, and should get its appearance from here
 * rather than from a second copy of the same rules.
 */
export function buttonClassNames({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  className,
}: ButtonClassNameOptions = {}): string {
  return [
    "sh-button",
    `sh-button--${variant}`,
    `sh-button--${size}`,
    fullWidth && "sh-button--full-width",
    loading && "sh-button--loading",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}
