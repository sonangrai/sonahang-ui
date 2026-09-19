import { Children, isValidElement, useEffect, useLayoutEffect } from "react";
import type { CSSProperties, HTMLAttributes, KeyboardEvent, ReactNode } from "react";

import { CarouselSlideIndexContext, useCarouselContext } from "./carousel.context";
import "./Carousel.css";

/** The count has to reach the controls before paint, but useLayoutEffect warns under SSR. */
const useRegisterEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export type CarouselSlidesProps = {
  children?: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "className">;

/**
 * Window onto the slides, and the track that slides beneath it.
 *
 * Slides are declared here but counted by the root, because the arrows and
 * dots sit outside this subtree and still need to know how many there are.
 * Position comes from the same place: a slide can't work out which one it is,
 * so each child is handed its index on the way past.
 */
export function CarouselSlides({ children, className, onKeyDown, ...props }: CarouselSlidesProps) {
  const { index, count, setCount, goTo, isPlaying } = useCarouselContext("CarouselSlides");

  // `toArray` drops the nulls and booleans a conditional slide leaves behind,
  // so the count matches what actually renders.
  const slides = Children.toArray(children);

  useRegisterEffect(() => {
    setCount(slides.length);
  }, [slides.length, setCount]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || count <= 1) return;

    const moves: Record<string, number> = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      Home: 0,
      End: count - 1,
    };

    const next = moves[event.key];
    if (next === undefined) return;

    // Stop the arrow keys scrolling the page.
    event.preventDefault();
    goTo(next, "user");
  };

  return (
    <div
      className={["sh-carousel__viewport", className].filter(Boolean).join(" ")}
      /*
       * Silent while rotating on its own — announcing a slide nobody asked
       * for, every few seconds, talks over whatever else is being read. Once
       * rotation is off, every change is the reader's own doing and worth
       * hearing.
       */
      aria-live={isPlaying ? "off" : "polite"}
      aria-atomic="false"
      /*
       * Focusable so the arrow keys below have somewhere to land, and so a
       * slide taller than its window can be scrolled by keyboard even when
       * its content holds nothing focusable.
       */
      tabIndex={0}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <div
        className="sh-carousel__track"
        // The offset is a plain number; the CSS turns it into a percentage,
        // which keeps the travel correct at any viewport width.
        style={{ "--sh-carousel-index": index } as CSSProperties}
      >
        {slides.map((slide, position) => (
          <CarouselSlideIndexContext.Provider
            // `toArray` has already given every element a stable key, so a
            // reordered slide keeps its identity and its state.
            key={isValidElement(slide) ? slide.key : position}
            value={position}
          >
            {slide}
          </CarouselSlideIndexContext.Provider>
        ))}
      </div>
    </div>
  );
}
