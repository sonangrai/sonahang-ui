import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MinMaxSlider } from "../MinMaxSlider";

/** jsdom doesn't drag, so value changes go through the change event. */
const slide = (element: HTMLElement, to: number) =>
  fireEvent.change(element, { target: { value: String(to) } });

const fromThumb = () => screen.getByRole("slider", { name: "Price minimum" });
const toThumb = () => screen.getByRole("slider", { name: "Price maximum" });

describe("MinMaxSlider", () => {
  describe("semantics", () => {
    it("renders two sliders", () => {
      render(<MinMaxSlider label="Price" />);

      expect(screen.getAllByRole("slider")).toHaveLength(2);
    });

    it("names each thumb distinctly", () => {
      // Both would otherwise announce as "Price", which is ambiguous.
      render(<MinMaxSlider label="Price" />);

      expect(fromThumb()).toBeInTheDocument();
      expect(toThumb()).toBeInTheDocument();
    });

    it("groups the pair under the label", () => {
      render(<MinMaxSlider label="Price" />);

      expect(screen.getByRole("group", { name: "Price" })).toBeInTheDocument();
    });

    it("supports an aria-label with no visible label", () => {
      render(<MinMaxSlider aria-label="Price" />);

      expect(screen.getByRole("group", { name: "Price" })).toBeInTheDocument();
      expect(screen.getByRole("slider", { name: "Price minimum" })).toBeInTheDocument();
    });

    it("submits each end under a derived name", () => {
      render(<MinMaxSlider label="Price" name="price" />);

      expect(fromThumb()).toHaveAttribute("name", "price-min");
      expect(toThumb()).toHaveAttribute("name", "price-max");
    });
  });

  describe("value", () => {
    it("defaults to the full range", () => {
      render(<MinMaxSlider label="Price" min={10} max={90} />);

      expect(fromThumb()).toHaveValue("10");
      expect(toThumb()).toHaveValue("90");
    });

    it("honours defaultValue when uncontrolled", () => {
      render(<MinMaxSlider label="Price" defaultValue={[20, 70]} />);

      expect(fromThumb()).toHaveValue("20");
      expect(toThumb()).toHaveValue("70");
    });

    it("updates itself when uncontrolled", () => {
      render(<MinMaxSlider label="Price" defaultValue={[20, 70]} />);

      slide(fromThumb(), 35);

      expect(fromThumb()).toHaveValue("35");
    });

    it("reports the whole pair", () => {
      const onChange = vi.fn();
      render(<MinMaxSlider label="Price" defaultValue={[20, 70]} onChange={onChange} />);

      slide(toThumb(), 80);

      expect(onChange).toHaveBeenCalledExactlyOnceWith([20, 80]);
    });

    it("reflects a controlled value", () => {
      render(<MinMaxSlider label="Price" value={[30, 60]} onChange={vi.fn()} />);

      expect(fromThumb()).toHaveValue("30");
      expect(toThumb()).toHaveValue("60");
    });

    it("does not self-update when controlled", () => {
      const onChange = vi.fn();
      render(<MinMaxSlider label="Price" value={[20, 70]} onChange={onChange} />);

      slide(fromThumb(), 40);

      expect(onChange).toHaveBeenCalledExactlyOnceWith([40, 70]);
      expect(fromThumb()).toHaveValue("20");
    });

    it("follows a controlled value change", () => {
      const { rerender } = render(
        <MinMaxSlider label="Price" value={[20, 70]} onChange={vi.fn()} />,
      );

      rerender(<MinMaxSlider label="Price" value={[40, 90]} onChange={vi.fn()} />);

      expect(fromThumb()).toHaveValue("40");
      expect(toThumb()).toHaveValue("90");
    });
  });

  describe("clamping", () => {
    it("stops the lower thumb crossing the upper", () => {
      const onChange = vi.fn();
      render(<MinMaxSlider label="Price" defaultValue={[20, 70]} onChange={onChange} />);

      slide(fromThumb(), 90);

      expect(onChange).toHaveBeenCalledExactlyOnceWith([70, 70]);
    });

    it("stops the upper thumb crossing the lower", () => {
      const onChange = vi.fn();
      render(<MinMaxSlider label="Price" defaultValue={[40, 70]} onChange={onChange} />);

      slide(toThumb(), 10);

      expect(onChange).toHaveBeenCalledExactlyOnceWith([40, 40]);
    });

    it("keeps minGap between the thumbs from below", () => {
      const onChange = vi.fn();
      render(
        <MinMaxSlider label="Price" defaultValue={[20, 70]} minGap={20} onChange={onChange} />,
      );

      slide(fromThumb(), 65);

      expect(onChange).toHaveBeenCalledExactlyOnceWith([50, 70]);
    });

    it("keeps minGap between the thumbs from above", () => {
      const onChange = vi.fn();
      render(
        <MinMaxSlider label="Price" defaultValue={[20, 70]} minGap={20} onChange={onChange} />,
      );

      slide(toThumb(), 25);

      expect(onChange).toHaveBeenCalledExactlyOnceWith([20, 40]);
    });

    it("allows a move that respects the gap", () => {
      const onChange = vi.fn();
      render(
        <MinMaxSlider label="Price" defaultValue={[20, 70]} minGap={20} onChange={onChange} />,
      );

      slide(fromThumb(), 40);

      expect(onChange).toHaveBeenCalledExactlyOnceWith([40, 70]);
    });
  });

  describe("fill indicator", () => {
    const wrapper = (container: HTMLElement) => container.querySelector(".sh-minmax") as HTMLElement;
    const varOf = (container: HTMLElement, prop: string) =>
      wrapper(container).style.getPropertyValue(prop);

    it("spans the selected portion", () => {
      const { container } = render(<MinMaxSlider label="Price" defaultValue={[25, 75]} />);

      expect(varOf(container, "--sh-minmax-from")).toBe("25%");
      expect(varOf(container, "--sh-minmax-to")).toBe("75%");
    });

    it("accounts for a non-zero min", () => {
      const { container } = render(
        <MinMaxSlider label="Price" min={20} max={40} defaultValue={[25, 35]} />,
      );

      expect(varOf(container, "--sh-minmax-from")).toBe("25%");
      expect(varOf(container, "--sh-minmax-to")).toBe("75%");
    });

    it("does not divide by zero when min equals max", () => {
      const { container } = render(
        <MinMaxSlider label="Price" min={5} max={5} defaultValue={[5, 5]} />,
      );

      expect(varOf(container, "--sh-minmax-from")).toBe("0%");
      expect(varOf(container, "--sh-minmax-to")).toBe("0%");
    });

    it("tracks changes", () => {
      const { container } = render(<MinMaxSlider label="Price" defaultValue={[0, 100]} />);

      slide(fromThumb(), 30);

      expect(varOf(container, "--sh-minmax-from")).toBe("30%");
    });
  });

  describe("overlap handling", () => {
    // Both thumbs span the full rail, so above halfway the lower one must be
    // raised or it can't be dragged back down.
    const wrapper = (container: HTMLElement) => container.querySelector(".sh-minmax");

    it("leaves the upper thumb on top in the lower half", () => {
      const { container } = render(<MinMaxSlider label="Price" defaultValue={[20, 70]} />);

      expect(wrapper(container)).not.toHaveClass("sh-minmax--from-on-top");
    });

    it("raises the lower thumb past halfway", () => {
      const { container } = render(<MinMaxSlider label="Price" defaultValue={[80, 90]} />);

      expect(wrapper(container)).toHaveClass("sh-minmax--from-on-top");
    });

    it("raises the lower thumb when both sit at the maximum", () => {
      const { container } = render(<MinMaxSlider label="Price" defaultValue={[100, 100]} />);

      expect(wrapper(container)).toHaveClass("sh-minmax--from-on-top");
    });
  });

  describe("value display", () => {
    it("hides the range by default", () => {
      const { container } = render(<MinMaxSlider label="Price" defaultValue={[20, 70]} />);

      expect(container.querySelector(".sh-minmax__value")).not.toBeInTheDocument();
    });

    it("shows the range when asked", () => {
      render(<MinMaxSlider label="Price" defaultValue={[20, 70]} showValue />);

      expect(screen.getByText("20 – 70")).toBeInTheDocument();
    });

    it("applies formatValue to both ends", () => {
      render(
        <MinMaxSlider
          label="Price"
          defaultValue={[100, 350]}
          max={500}
          showValue
          formatValue={(v) => `$${v}`}
        />,
      );

      expect(screen.getByText("$100 – $350")).toBeInTheDocument();
    });

    it("announces the formatted value on each thumb", () => {
      render(
        <MinMaxSlider label="Price" defaultValue={[100, 350]} max={500} formatValue={(v) => `$${v}`} />,
      );

      expect(fromThumb()).toHaveAttribute("aria-valuetext", "$100");
      expect(toThumb()).toHaveAttribute("aria-valuetext", "$350");
    });

    it("sets no aria-valuetext without a formatter", () => {
      render(<MinMaxSlider label="Price" defaultValue={[20, 70]} />);

      expect(fromThumb()).not.toHaveAttribute("aria-valuetext");
    });
  });

  describe("helper text and errors", () => {
    it("links helper text to the group", () => {
      render(<MinMaxSlider label="Price" helperText="Pick a band." />);

      expect(screen.getByRole("group")).toHaveAccessibleDescription("Pick a band.");
    });

    it("shows the error and marks the group invalid", () => {
      render(<MinMaxSlider label="Price" error="Too wide." />);

      const group = screen.getByRole("group");
      expect(group).toHaveAttribute("aria-invalid", "true");
      expect(group).toHaveAccessibleDescription("Too wide.");
    });

    it("replaces helper text with the error when both are given", () => {
      render(<MinMaxSlider label="Price" helperText="Pick a band." error="Too wide." />);

      expect(screen.getByText("Too wide.")).toBeInTheDocument();
      expect(screen.queryByText("Pick a band.")).not.toBeInTheDocument();
    });

    it("is not marked invalid without an error", () => {
      render(<MinMaxSlider label="Price" helperText="Pick a band." />);

      expect(screen.getByRole("group")).not.toHaveAttribute("aria-invalid");
    });
  });

  describe("disabled", () => {
    it("disables both thumbs", () => {
      render(<MinMaxSlider label="Price" disabled />);

      expect(fromThumb()).toBeDisabled();
      expect(toThumb()).toBeDisabled();
    });

    it("flags the disabled state on the wrapper", () => {
      const { container } = render(<MinMaxSlider label="Price" disabled />);

      expect(container.querySelector(".sh-minmax")).toHaveClass("sh-minmax--disabled");
    });
  });

  describe("styling hooks", () => {
    it("merges a custom className onto the wrapper", () => {
      const { container } = render(<MinMaxSlider label="Price" className="custom" />);

      expect(container.querySelector(".sh-minmax")).toHaveClass("custom");
    });

    it("flags the invalid state on the wrapper", () => {
      const { container } = render(<MinMaxSlider label="Price" error="Nope." />);

      expect(container.querySelector(".sh-minmax")).toHaveClass("sh-minmax--invalid");
    });
  });
});
