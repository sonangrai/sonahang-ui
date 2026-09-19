import { CarouselControl } from "./CarouselControl";
import type { CarouselControlProps } from "./CarouselControl";

export type CarouselPreviousProps = CarouselControlProps;

/** Steps back one slide. Overlays the left edge of the slides. */
export function CarouselPrevious(props: CarouselPreviousProps) {
  return (
    <CarouselControl
      direction="previous"
      component="CarouselPrevious"
      defaultLabel="Previous slide"
      {...props}
    />
  );
}
