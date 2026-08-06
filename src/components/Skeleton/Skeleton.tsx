import type { CSSProperties, HTMLAttributes } from "react";

import type { SkeletonAnimation, SkeletonVariant } from "./skeleton.tokens";
import "./Skeleton.css";

/** Bare numbers are pixels; strings pass through as authored ("60%", "4rem"). */
const toLength = (value: number | string | undefined) =>
  typeof value === "number" ? `${value}px` : value;

export type SkeletonProps = {
  /** Shape of the placeholder. Defaults to `text`. */
  variant?: SkeletonVariant;
  /** Width. A number is treated as pixels. */
  width?: number | string;
  /** Height. A number is treated as pixels. Circular falls back to `width`. */
  height?: number | string;
  /** Number of text lines to render. Only meaningful for `text`. */
  lines?: number;
  /** Placeholder motion. Defaults to `pulse`. */
  animation?: SkeletonAnimation;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "className">;

/**
 * Placeholder shown while content loads.
 *
 * Hidden from assistive tech: a screen reader shouldn't announce a wall of
 * empty boxes. The surrounding region is what should carry the loading state —
 * `aria-busy`, or a `Spinner`/live region alongside it.
 */
export function Skeleton({
  variant = "text",
  width,
  height,
  lines = 1,
  animation = "pulse",
  className,
  ...props
}: SkeletonProps) {
  const itemClasses = [
    "sh-skeleton",
    `sh-skeleton--${variant}`,
    `sh-skeleton--${animation}`,
  ].join(" ");

  const style: CSSProperties = {
    width: toLength(width),
    // A circle with only a width would otherwise collapse to zero height.
    height: toLength(height ?? (variant === "circular" ? width : undefined)),
  };

  // Multiple lines only make sense for text, and a paragraph whose last line
  // runs the full width doesn't read as text.
  if (variant === "text" && lines > 1) {
    return (
      <div
        className={["sh-skeleton-lines", className].filter(Boolean).join(" ")}
        aria-hidden="true"
        {...props}
      >
        {Array.from({ length: lines }, (_, index) => (
          <span
            key={index}
            className={itemClasses}
            style={index === lines - 1 ? { ...style, width: "60%" } : style}
          />
        ))}
      </div>
    );
  }

  return (
    <span
      className={[itemClasses, className].filter(Boolean).join(" ")}
      style={style}
      aria-hidden="true"
      {...props}
    />
  );
}
