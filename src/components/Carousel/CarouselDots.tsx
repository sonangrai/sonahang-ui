import type { HTMLAttributes } from "react";

import { slideId, useCarouselContext } from "./carousel.context";
import "./Carousel.css";

export type CarouselDotsProps = {
  /** Accessible name for the group. Defaults to "Choose slide". */
  "aria-label"?: string;
  /** Names each dot. Defaults to "Slide 1", "Slide 2", … */
  label?: (index: number) => string;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "className">;

/**
 * One dot per slide, doubling as a position readout and a way to jump.
 *
 * Plain buttons rather than tabs: the slides are groups, not tab panels, and
 * claiming tab semantics here would promise arrow-key behaviour the ARIA
 * carousel pattern doesn't have.
 */
export function CarouselDots({
  "aria-label": ariaLabel = "Choose slide",
  label = (index) => `Slide ${index + 1}`,
  className,
  ...props
}: CarouselDotsProps) {
  const { index, count, goTo, baseId } = useCarouselContext("CarouselDots");

  // Nothing to choose between.
  if (count <= 1) return null;

  return (
    <div
      className={["sh-carousel__dots", className].filter(Boolean).join(" ")}
      role="group"
      aria-label={ariaLabel}
      {...props}
    >
      {Array.from({ length: count }, (_, position) => {
        const isCurrent = position === index;

        return (
          <button
            key={position}
            type="button"
            className={["sh-carousel__dot", isCurrent && "sh-carousel__dot--current"]
              .filter(Boolean)
              .join(" ")}
            aria-label={label(position)}
            // Still clickable when current, unlike a disabled dot, so the row
            // never loses a tab stop as the slide changes under the keyboard.
            aria-current={isCurrent ? "true" : undefined}
            aria-controls={slideId(baseId, position)}
            onClick={() => goTo(position, "user")}
          />
        );
      })}
    </div>
  );
}
