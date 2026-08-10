import type { HTMLAttributes } from "react";

import "./Dropdown.css";

export type DropdownSeparatorProps = {
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "className">;

/**
 * Divider between groups of commands. Carries `role="separator"` rather than
 * `aria-hidden`, so the grouping is conveyed to assistive tech too.
 */
export function DropdownSeparator({ className, ...props }: DropdownSeparatorProps) {
  return (
    <div
      className={["sh-dropdown__separator", className].filter(Boolean).join(" ")}
      role="separator"
      {...props}
    />
  );
}
