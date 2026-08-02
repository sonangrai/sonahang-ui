import { Children, isValidElement } from "react";
import type { HTMLAttributes, ReactNode } from "react";

import { AvatarSizeContext } from "./avatar.context";
import type { AvatarSize } from "./avatar.tokens";
import "./Avatar.css";

export type AvatarGroupProps = {
  /** Maximum avatars to show before collapsing the rest into a "+N" counter. */
  max?: number;
  /** Size applied to every avatar in the group. Individual `size` props win. */
  size?: AvatarSize;
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;

/** Overlapping stack of `Avatar`s, with optional overflow counter. */
export function AvatarGroup({
  max,
  size = "md",
  className,
  children,
  ...props
}: AvatarGroupProps) {
  const items = Children.toArray(children).filter(isValidElement);
  const limit = typeof max === "number" && max >= 0 ? max : items.length;
  const visible = items.slice(0, limit);
  const overflow = items.length - visible.length;

  const classes = ["sh-avatar-group", className].filter(Boolean).join(" ");

  return (
    <AvatarSizeContext.Provider value={size}>
      <div className={classes} {...props}>
        {visible}
        {overflow > 0 && (
          <span
            className={`sh-avatar sh-avatar--${size} sh-avatar--overflow`}
            role="img"
            aria-label={`${overflow} more`}
          >
            <span className="sh-avatar__fallback" aria-hidden="true">
              +{overflow}
            </span>
          </span>
        )}
      </div>
    </AvatarSizeContext.Provider>
  );
}
