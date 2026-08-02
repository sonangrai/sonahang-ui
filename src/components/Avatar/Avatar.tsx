import { useContext, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";

import { AvatarSizeContext } from "./avatar.context";
import type { AvatarSize } from "./avatar.tokens";
import { getInitials } from "./getInitials";
import "./Avatar.css";

const PlaceholderIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="sh-avatar__icon">
    <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 1.8c-3.6 0-7.2 1.8-7.2 4.05V21h14.4v-3.15c0-2.25-3.6-4.05-7.2-4.05Z" />
  </svg>
);

export type AvatarProps = {
  /** Image URL. Falls back to initials (then an icon) if it fails to load. */
  src?: string;
  /** Person's name — used for the accessible label and to derive initials. */
  name?: string;
  /** Overrides the image alt text. Defaults to `name`. */
  alt?: string;
  /** Size of the avatar. Defaults to `md`, or the size set by `AvatarGroup`. */
  size?: AvatarSize;
  /** Custom fallback, rendered instead of initials when there's no image. */
  children?: ReactNode;
} & Omit<HTMLAttributes<HTMLSpanElement>, "children">;

/** User avatar with an image → initials → icon fallback chain. */
export function Avatar({ src, name, alt, size, className, children, ...props }: AvatarProps) {
  // Track *which* src failed rather than a boolean, so swapping in a new
  // `src` automatically retries instead of staying stuck on the fallback.
  const [failedSrc, setFailedSrc] = useState<string | undefined>(undefined);

  const groupSize = useContext(AvatarSizeContext);
  const resolvedSize = size ?? groupSize ?? "md";

  const showImage = Boolean(src) && failedSrc !== src;
  const initials = name ? getInitials(name) : "";
  const label = alt ?? name;

  const classes = ["sh-avatar", `sh-avatar--${resolvedSize}`, className].filter(Boolean).join(" ");

  // When showing an image the <img alt> carries the name, so the wrapper
  // stays a plain span. For the fallback the wrapper has to carry it.
  const labelProps =
    !showImage && label ? ({ role: "img", "aria-label": label } as const) : undefined;

  return (
    <span className={classes} {...labelProps} {...props}>
      {showImage ? (
        <img
          className="sh-avatar__image"
          src={src}
          alt={label ?? ""}
          onError={() => setFailedSrc(src)}
        />
      ) : (
        (children ?? (
          <span className="sh-avatar__fallback" aria-hidden="true">
            {initials || <PlaceholderIcon />}
          </span>
        ))
      )}
    </span>
  );
}
