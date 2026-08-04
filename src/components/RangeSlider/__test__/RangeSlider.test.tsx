import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RangeSlider } from "../RangeSlider";

/** jsdom doesn't drag, so value changes go through the change event. */
const slide = (element: HTMLElement, to: number) =>
  fireEvent.change(element, { target: { value: String(to) } });

describe("RangeSlider", () => {
  describe("semantics", () => {
    it("exposes a slider", () => {
      render(<RangeSlider label="Volume" />);

      expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
    });

    it("is a native range input", () => {
      render(<RangeSlider label="Volume" />);

      expect(screen.getByRole("slider")).toHaveAttribute("type", "range");
    });

    it("links the label to the input", () => {
      render(<RangeSlider label="Volume" />);

      expect(screen.getByLabelText("Volume")).toBeInstanceOf(HTMLInputElement);
    });

    it("generates a unique id per instance", () => {
      render(
        <>
          <RangeSlider label="First" />
          <RangeSlider label="Second" />
        </>,
      );

      expect(screen.getByLabelText("First").id).not.toBe(screen.getByLabelText("Second").id);
    });

    it("uses a caller-supplied id", () => {
      render(<RangeSlider label="Volume" id="vol" />);

      expect(screen.getByLabelText("Volume")).toHaveAttribute("id", "vol");
    });

    it("supports an aria-label with no visible label", () => {
      render(<RangeSlider aria-label="Volume" />);

      expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
    });
  });

  describe("range and value", () => {
    it("defaults to 0-100 with step 1", () => {
      render(<RangeSlider label="Volume" />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("min", "0");
      expect(slider).toHaveAttribute("max", "100");
      expect(slider).toHaveAttribute("step", "1");
    });

    it("applies custom min, max, and step", () => {
      render(<RangeSlider label="Budget" min={10} max={50} step={5} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("min", "10");
      expect(slider).toHaveAttribute("max", "50");
      expect(slider).toHaveAttribute("step", "5");
    });

    it("starts at min when no value is given", () => {
      render(<RangeSlider label="Budget" min={10} max={50} />);

      expect(screen.getByRole("slider")).toHaveValue("10");
    });

    it("honours defaultValue when uncontrolled", () => {
      render(<RangeSlider label="Volume" defaultValue={60} />);

      expect(screen.getByRole("slider")).toHaveValue("60");
    });

    it("updates itself when uncontrolled", () => {
      render(<RangeSlider label="Volume" defaultValue={20} />);

      slide(screen.getByRole("slider"), 75);

      expect(screen.getByRole("slider")).toHaveValue("75");
    });

    it("reports the new value as a number", () => {
      const onChange = vi.fn();
      render(<RangeSlider label="Volume" defaultValue={20} onChange={onChange} />);

      slide(screen.getByRole("slider"), 75);

      expect(onChange).toHaveBeenCalledExactlyOnceWith(75);
      expect(onChange.mock.calls[0][0]).toBeTypeOf("number");
    });

    it("reflects a controlled value", () => {
      render(<RangeSlider label="Volume" value={42} onChange={vi.fn()} />);

      expect(screen.getByRole("slider")).toHaveValue("42");
    });

    it("does not self-update when controlled", () => {
      const onChange = vi.fn();
      render(<RangeSlider label="Volume" value={20} onChange={onChange} />);

      slide(screen.getByRole("slider"), 75);

      expect(onChange).toHaveBeenCalledExactlyOnceWith(75);
      expect(screen.getByRole("slider")).toHaveValue("20");
    });

    it("follows a controlled value change", () => {
      const { rerender } = render(<RangeSlider label="Volume" value={20} onChange={vi.fn()} />);
      expect(screen.getByRole("slider")).toHaveValue("20");

      rerender(<RangeSlider label="Volume" value={80} onChange={vi.fn()} />);

      expect(screen.getByRole("slider")).toHaveValue("80");
    });
  });

  describe("fill indicator", () => {
    // WebKit has no ::-moz-range-progress, so the filled portion is a gradient
    // stop driven by this custom property. Pseudo-elements aren't observable
    // in jsdom, so the contract worth pinning is the value CSS reads.
    const fillOf = (element: HTMLElement) => element.style.getPropertyValue("--sh-range-fill");

    it("is 0% at the minimum", () => {
      render(<RangeSlider label="Volume" defaultValue={0} />);

      expect(fillOf(screen.getByRole("slider"))).toBe("0%");
    });

    it("is 100% at the maximum", () => {
      render(<RangeSlider label="Volume" defaultValue={100} />);

      expect(fillOf(screen.getByRole("slider"))).toBe("100%");
    });

    it("is proportional in between", () => {
      render(<RangeSlider label="Volume" defaultValue={25} />);

      expect(fillOf(screen.getByRole("slider"))).toBe("25%");
    });

    it("accounts for a non-zero min", () => {
      // 30 within 20..40 is halfway, not 30%.
      render(<RangeSlider label="Volume" min={20} max={40} defaultValue={30} />);

      expect(fillOf(screen.getByRole("slider"))).toBe("50%");
    });

    it("tracks changes", () => {
      render(<RangeSlider label="Volume" defaultValue={0} />);

      slide(screen.getByRole("slider"), 40);

      expect(fillOf(screen.getByRole("slider"))).toBe("40%");
    });

    it("does not divide by zero when min equals max", () => {
      render(<RangeSlider label="Volume" min={5} max={5} defaultValue={5} />);

      expect(fillOf(screen.getByRole("slider"))).toBe("0%");
    });
  });

  describe("value display", () => {
    it("hides the value by default", () => {
      const { container } = render(<RangeSlider label="Volume" defaultValue={60} />);

      expect(container.querySelector(".sh-range__value")).not.toBeInTheDocument();
    });

    it("shows the value when asked", () => {
      render(<RangeSlider label="Volume" defaultValue={60} showValue />);

      expect(screen.getByText("60")).toBeInTheDocument();
    });

    it("applies formatValue to the display", () => {
      render(
        <RangeSlider label="Budget" defaultValue={150} showValue formatValue={(v) => `$${v}`} />,
      );

      expect(screen.getByText("$150")).toBeInTheDocument();
    });

    it("announces the formatted value via aria-valuetext", () => {
      // Otherwise a screen reader reads a bare "150" with no units.
      render(<RangeSlider label="Budget" defaultValue={150} formatValue={(v) => `$${v}`} />);

      expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", "$150");
    });

    it("sets no aria-valuetext without a formatter", () => {
      render(<RangeSlider label="Volume" defaultValue={60} />);

      expect(screen.getByRole("slider")).not.toHaveAttribute("aria-valuetext");
    });

    it("updates the displayed value as it changes", () => {
      render(<RangeSlider label="Volume" defaultValue={10} showValue />);

      slide(screen.getByRole("slider"), 90);

      expect(screen.getByText("90")).toBeInTheDocument();
    });
  });

  describe("helper text and errors", () => {
    it("links helper text to the slider", () => {
      render(<RangeSlider label="Volume" helperText="Notification sounds only." />);

      expect(screen.getByRole("slider")).toHaveAccessibleDescription(
        "Notification sounds only.",
      );
    });

    it("shows the error and marks the slider invalid", () => {
      render(<RangeSlider label="Volume" error="Pick a higher value." />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-invalid", "true");
      expect(slider).toHaveAccessibleDescription("Pick a higher value.");
    });

    it("replaces helper text with the error when both are given", () => {
      render(<RangeSlider label="Volume" helperText="Sounds only." error="Too low." />);

      expect(screen.getByText("Too low.")).toBeInTheDocument();
      expect(screen.queryByText("Sounds only.")).not.toBeInTheDocument();
    });

    it("is not marked invalid without an error", () => {
      render(<RangeSlider label="Volume" helperText="Sounds only." />);

      expect(screen.getByRole("slider")).not.toHaveAttribute("aria-invalid");
    });

    it("keeps a caller-supplied aria-describedby alongside its own", () => {
      render(
        <>
          <span id="external">External hint.</span>
          <RangeSlider label="Volume" helperText="Own hint." aria-describedby="external" />
        </>,
      );

      expect(screen.getByRole("slider")).toHaveAccessibleDescription("External hint. Own hint.");
    });
  });

  describe("disabled", () => {
    it("disables the input", () => {
      render(<RangeSlider label="Volume" disabled />);

      expect(screen.getByRole("slider")).toBeDisabled();
    });

    it("flags the disabled state on the wrapper", () => {
      const { container } = render(<RangeSlider label="Volume" disabled />);

      expect(container.querySelector(".sh-range")).toHaveClass("sh-range--disabled");
    });
  });

  describe("styling hooks", () => {
    it("puts className on the wrapper and inputClassName on the input", () => {
      const { container } = render(
        <RangeSlider label="Volume" className="wrap" inputClassName="ctrl" />,
      );

      expect(container.querySelector(".sh-range")).toHaveClass("wrap");
      expect(screen.getByRole("slider")).toHaveClass("sh-range__input", "ctrl");
      expect(screen.getByRole("slider")).not.toHaveClass("wrap");
    });

    it("flags the invalid state on the wrapper", () => {
      const { container } = render(<RangeSlider label="Volume" error="Nope." />);

      expect(container.querySelector(".sh-range")).toHaveClass("sh-range--invalid");
    });

    it("forwards arbitrary input attributes", () => {
      render(<RangeSlider label="Volume" name="volume" />);

      expect(screen.getByRole("slider")).toHaveAttribute("name", "volume");
    });
  });
});
