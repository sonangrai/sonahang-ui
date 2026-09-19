import type { ButtonHTMLAttributes, ReactNode } from "react";

import { useCarouselContext } from "./carousel.context";
import "./Carousel.css";

const Chevron = ({ direction }: { direction: "left" | "right" }) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <path
      d={direction === "left" ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export type CarouselControlProps = {
  /** Replaces the default chevron. */
  children?: ReactNode;
  /** Accessible name for the button. */
  "aria-label"?: string;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

type InternalProps = CarouselControlProps & {
  direction: "previous" | "next";
  component: string;
  defaultLabel: string;
};

/**
 * Shared body of the two arrows — they differ only in which way they step and
 * which end they run out at.
 */
export function CarouselControl({
  direction,
  component,
  defaultLabel,
  children,
  "aria-label": ariaLabel = defaultLabel,
  className,
  disabled,
  onClick,
  ...props
}: InternalProps) {
  const { index, count, loop, goTo } = useCarouselContext(component);

  const isNext = direction === "next";
  // Without looping the arrows run out; with it they never do.
  const atEnd = !loop && (isNext ? index >= count - 1 : index <= 0);

  const classes = ["sh-carousel__control", `sh-carousel__control--${direction}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      aria-label={ariaLabel}
      /*
       * Also disabled with nothing to move between — an arrow that stays lit
       * and does nothing when clicked reads as broken.
       */
      disabled={disabled || atEnd || count <= 1}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) goTo(isNext ? index + 1 : index - 1, "user");
      }}
      {...props}
    >
      {children ?? <Chevron direction={isNext ? "right" : "left"} />}
    </button>
  );
}
