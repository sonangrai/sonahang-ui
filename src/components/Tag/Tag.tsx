import type { HTMLAttributes, ReactNode } from "react";

import type { TagVariant } from "./tag.tokens";
import "./Tag.css";

export type TagProps = {
  /** Visual style of the tag. Defaults to `primary`. */
  variant?: TagVariant;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLSpanElement>, "children">;

/** Compact label for statuses, categories, and metadata. */
export function Tag({ variant = "primary", className, children, ...props }: TagProps) {
  const classes = ["sh-tag", `sh-tag--${variant}`, className].filter(Boolean).join(" ");

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
