import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgressBar } from "../ProgressBar";
import { progressBarSizes } from "../progressBar.tokens";

const bar = (container: HTMLElement) =>
  container.querySelector(".sh-progress__bar") as HTMLElement;

const fillOf = (container: HTMLElement) =>
  bar(container).style.getPropertyValue("--sh-progress-fill");

describe("ProgressBar", () => {
  describe("semantics", () => {
    it("exposes a progressbar", () => {
      render(<ProgressBar label="Uploading" value={60} />);

      expect(screen.getByRole("progressbar", { name: "Uploading" })).toBeInTheDocument();
    });

    it("supports an aria-label with no visible label", () => {
      render(<ProgressBar aria-label="Uploading" value={60} />);

      expect(screen.getByRole("progressbar", { name: "Uploading" })).toBeInTheDocument();
    });

    it("reports the bounds", () => {
      render(<ProgressBar label="Uploading" value={3} max={8} />);

      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveAttribute("aria-valuemin", "0");
      expect(progress).toHaveAttribute("aria-valuemax", "8");
      expect(progress).toHaveAttribute("aria-valuenow", "3");
    });

    it("generates a unique label id per instance", () => {
      render(
        <>
          <ProgressBar label="First" value={10} />
          <ProgressBar label="Second" value={20} />
        </>,
      );

      expect(screen.getByRole("progressbar", { name: "First" })).toBeInTheDocument();
      expect(screen.getByRole("progressbar", { name: "Second" })).toBeInTheDocument();
    });
  });

  describe("fill", () => {
    it("is 0% at the minimum", () => {
      const { container } = render(<ProgressBar label="Uploading" value={0} />);

      expect(fillOf(container)).toBe("0%");
    });

    it("is 100% at the maximum", () => {
      const { container } = render(<ProgressBar label="Uploading" value={100} />);

      expect(fillOf(container)).toBe("100%");
    });

    it("is proportional in between", () => {
      const { container } = render(<ProgressBar label="Uploading" value={25} />);

      expect(fillOf(container)).toBe("25%");
    });

    it("scales to a custom max", () => {
      const { container } = render(<ProgressBar label="Uploading" value={2} max={8} />);

      expect(fillOf(container)).toBe("25%");
    });
  });

  describe("out-of-range values", () => {
    it("clamps a value above max", () => {
      // Otherwise the bar overflows its track.
      const { container } = render(<ProgressBar label="Uploading" value={150} />);

      expect(fillOf(container)).toBe("100%");
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
    });

    it("clamps a negative value", () => {
      const { container } = render(<ProgressBar label="Uploading" value={-20} />);

      expect(fillOf(container)).toBe("0%");
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    });

    it("does not divide by zero when max is zero", () => {
      const { container } = render(<ProgressBar label="Uploading" value={5} max={0} />);

      expect(fillOf(container)).toBe("0%");
    });

    it("survives a negative max", () => {
      const { container } = render(<ProgressBar label="Uploading" value={5} max={-10} />);

      expect(fillOf(container)).toBe("0%");
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "0");
    });
  });

  describe("indeterminate", () => {
    it("is indeterminate when no value is given", () => {
      const { container } = render(<ProgressBar label="Preparing" />);

      expect(container.querySelector(".sh-progress")).toHaveClass("sh-progress--indeterminate");
    });

    it("omits aria-valuenow entirely", () => {
      // The absence is what signals "duration unknown" — 0 would mean "no
      // progress yet", which is a different claim.
      render(<ProgressBar label="Preparing" />);

      expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
    });

    it("still reports its bounds", () => {
      render(<ProgressBar label="Preparing" />);

      const progress = screen.getByRole("progressbar");
      expect(progress).toHaveAttribute("aria-valuemin", "0");
      expect(progress).toHaveAttribute("aria-valuemax", "100");
    });

    it("hides the percentage even when showValue is set", () => {
      const { container } = render(<ProgressBar label="Preparing" showValue />);

      expect(container.querySelector(".sh-progress__value")).not.toBeInTheDocument();
    });

    it("is determinate again once a value arrives", () => {
      const { container, rerender } = render(<ProgressBar label="Preparing" />);
      expect(container.querySelector(".sh-progress")).toHaveClass("sh-progress--indeterminate");

      rerender(<ProgressBar label="Preparing" value={40} />);

      expect(container.querySelector(".sh-progress")).not.toHaveClass(
        "sh-progress--indeterminate",
      );
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "40");
    });

    it("treats zero as determinate, not missing", () => {
      render(<ProgressBar label="Uploading" value={0} />);

      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    });
  });

  describe("value display", () => {
    it("hides the percentage by default", () => {
      const { container } = render(<ProgressBar label="Uploading" value={60} />);

      expect(container.querySelector(".sh-progress__value")).not.toBeInTheDocument();
    });

    it("shows a rounded percentage when asked", () => {
      render(<ProgressBar label="Uploading" value={60} showValue />);

      expect(screen.getByText("60%")).toBeInTheDocument();
    });

    it("rounds awkward percentages", () => {
      render(<ProgressBar label="Uploading" value={1} max={3} showValue />);

      expect(screen.getByText("33%")).toBeInTheDocument();
    });

    it("applies formatValue to the display", () => {
      render(
        <ProgressBar
          label="Files"
          value={3}
          max={8}
          showValue
          formatValue={(value, max) => `${value} of ${max} files`}
        />,
      );

      expect(screen.getByText("3 of 8 files")).toBeInTheDocument();
    });

    it("announces the formatted value via aria-valuetext", () => {
      render(
        <ProgressBar
          label="Files"
          value={3}
          max={8}
          formatValue={(value, max) => `${value} of ${max} files`}
        />,
      );

      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuetext",
        "3 of 8 files",
      );
    });

    it("sets no aria-valuetext without a formatter", () => {
      render(<ProgressBar label="Uploading" value={60} />);

      expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuetext");
    });
  });

  describe("sizing and styling hooks", () => {
    it("defaults to md", () => {
      const { container } = render(<ProgressBar label="Uploading" value={60} />);

      expect(container.querySelector(".sh-progress")).toHaveClass("sh-progress--md");
    });

    it.each(progressBarSizes)("applies the %s size class", (size) => {
      const { container } = render(<ProgressBar label="Uploading" value={60} size={size} />);

      expect(container.querySelector(".sh-progress")).toHaveClass(`sh-progress--${size}`);
    });

    it("merges a custom className", () => {
      const { container } = render(
        <ProgressBar label="Uploading" value={60} className="custom" />,
      );

      expect(container.querySelector(".sh-progress")).toHaveClass("sh-progress", "custom");
    });

    it("forwards arbitrary div attributes", () => {
      render(<ProgressBar label="Uploading" value={60} data-testid="progress" />);

      expect(screen.getByTestId("progress")).toBeInTheDocument();
    });
  });
});
