import type { HTMLAttributes, ReactNode } from "react";

import { slideId, useCarouselContext, useSlideIndex } from "./carousel.context";
import "./Carousel.css";

export type CarouselSlideProps = {
  children?: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "className">;

/** A single slide. Must be rendered inside `CarouselSlides`. */
export function CarouselSlide({ children, className, ...props }: CarouselSlideProps) {
  const { index: current, count, baseId } = useCarouselContext("CarouselSlide");
  const index = useSlideIndex("CarouselSlide");
  const isCurrent = index === current;

  const classes = ["sh-carousel__slide", isCurrent && "sh-carousel__slide--current", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      id={slideId(baseId, index)}
      className={classes}
      role="group"
      aria-roledescription="slide"
      // Position, not content — "3 of 7" is what's missing when you can't see
      // the dots. Pass your own `aria-label` to say something better.
      aria-label={`${index + 1} of ${count}`}
      /*
       * Off-screen slides are still laid out, just translated away. Without
       * `inert` their links and buttons stay focusable, and tabbing into one
       * would drag the viewport to a slide nobody chose.
       */
      inert={!isCurrent}
      {...props}
    >
      {children}
    </div>
  );
}
