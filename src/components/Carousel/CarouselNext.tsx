import { CarouselControl } from "./CarouselControl";
import type { CarouselControlProps } from "./CarouselControl";

export type CarouselNextProps = CarouselControlProps;

/** Steps forward one slide. Overlays the right edge of the slides. */
export function CarouselNext(props: CarouselNextProps) {
  return (
    <CarouselControl
      direction="next"
      component="CarouselNext"
      defaultLabel="Next slide"
      {...props}
    />
  );
}
