import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "../Skeleton";
import { skeletonAnimations, skeletonVariants } from "../skeleton.tokens";

const root = (container: HTMLElement) => container.firstElementChild as HTMLElement;
const items = (container: HTMLElement) => container.querySelectorAll(".sh-skeleton");

describe("Skeleton", () => {
  describe("accessibility", () => {
    it("is hidden from assistive tech", () => {
      // A screen reader shouldn't announce a wall of empty boxes.
      const { container } = render(<Skeleton />);

      expect(root(container)).toHaveAttribute("aria-hidden", "true");
    });

    it("hides the wrapper for multi-line text too", () => {
      const { container } = render(<Skeleton lines={3} />);

      expect(root(container)).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("variants", () => {
    it("defaults to text", () => {
      const { container } = render(<Skeleton />);

      expect(root(container)).toHaveClass("sh-skeleton--text");
    });

    it.each(skeletonVariants)("applies the %s variant class", (variant) => {
      const { container } = render(<Skeleton variant={variant} />);

      expect(root(container)).toHaveClass(`sh-skeleton--${variant}`);
    });
  });

  describe("animations", () => {
    it("defaults to pulse", () => {
      const { container } = render(<Skeleton />);

      expect(root(container)).toHaveClass("sh-skeleton--pulse");
    });

    it.each(skeletonAnimations)("applies the %s animation class", (animation) => {
      const { container } = render(<Skeleton animation={animation} />);

      expect(root(container)).toHaveClass(`sh-skeleton--${animation}`);
    });

    it("applies the animation to every line", () => {
      const { container } = render(<Skeleton lines={3} animation="wave" />);

      for (const item of items(container)) {
        expect(item).toHaveClass("sh-skeleton--wave");
      }
    });
  });

  describe("sizing", () => {
    it("treats a bare number as pixels", () => {
      const { container } = render(<Skeleton width={120} height={20} />);

      expect(root(container)).toHaveStyle({ width: "120px", height: "20px" });
    });

    it("passes a string through as authored", () => {
      // Asserted against the inline declaration, not the computed value:
      // jsdom resolves "4rem" to "64px" when computing.
      const { container } = render(<Skeleton width="60%" height="4rem" />);

      expect(root(container).style.width).toBe("60%");
      expect(root(container).style.height).toBe("4rem");
    });

    it("gives a circular skeleton height from its width", () => {
      // Otherwise a circle with only a width collapses to zero height.
      const { container } = render(<Skeleton variant="circular" width={48} />);

      expect(root(container)).toHaveStyle({ width: "48px", height: "48px" });
    });

    it("lets an explicit height win for circular", () => {
      const { container } = render(<Skeleton variant="circular" width={48} height={20} />);

      expect(root(container)).toHaveStyle({ height: "20px" });
    });

    it("sets no inline size when none is given", () => {
      // The CSS defaults for the variant should apply instead.
      const { container } = render(<Skeleton variant="rectangular" />);

      expect(root(container).style.width).toBe("");
      expect(root(container).style.height).toBe("");
    });
  });

  describe("multiple lines", () => {
    it("renders a single element by default", () => {
      const { container } = render(<Skeleton />);

      expect(items(container)).toHaveLength(1);
    });

    it("renders one element per line", () => {
      const { container } = render(<Skeleton lines={4} />);

      expect(items(container)).toHaveLength(4);
    });

    it("narrows the last line so it reads as a paragraph", () => {
      const { container } = render(<Skeleton lines={3} />);

      const all = items(container);
      // Full lines carry no inline width — the variant's CSS supplies 100%.
      expect((all[0] as HTMLElement).style.width).toBe("");
      expect((all[1] as HTMLElement).style.width).toBe("");
      expect((all[2] as HTMLElement).style.width).toBe("60%");
    });

    it("keeps the caller's width on the full lines", () => {
      const { container } = render(<Skeleton lines={3} width="80%" />);

      const all = items(container);
      expect((all[0] as HTMLElement).style.width).toBe("80%");
      expect((all[2] as HTMLElement).style.width).toBe("60%");
    });

    it("ignores lines for non-text variants", () => {
      // Stacked rectangles aren't a paragraph; lines is a text affordance.
      const { container } = render(<Skeleton variant="rectangular" lines={4} />);

      expect(items(container)).toHaveLength(1);
    });

    it("stays a single element at lines={1}", () => {
      const { container } = render(<Skeleton lines={1} />);

      expect(container.querySelector(".sh-skeleton-lines")).not.toBeInTheDocument();
      expect(items(container)).toHaveLength(1);
    });
  });

  describe("styling hooks", () => {
    it("merges a custom className onto a single skeleton", () => {
      const { container } = render(<Skeleton className="custom" />);

      expect(root(container)).toHaveClass("sh-skeleton", "custom");
    });

    it("merges a custom className onto the multi-line wrapper", () => {
      const { container } = render(<Skeleton lines={3} className="custom" />);

      expect(root(container)).toHaveClass("sh-skeleton-lines", "custom");
    });

    it("forwards arbitrary attributes", () => {
      const { container } = render(<Skeleton data-testid="placeholder" />);

      expect(root(container)).toHaveAttribute("data-testid", "placeholder");
    });
  });
});
