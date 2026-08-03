import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SegmentedControl } from "../SegmentedControl";

const VIEWS = [
  { value: "list", label: "List" },
  { value: "grid", label: "Grid" },
  { value: "board", label: "Board" },
];

describe("SegmentedControl", () => {
  describe("semantics", () => {
    it("exposes a radiogroup", () => {
      render(<SegmentedControl label="View" options={VIEWS} />);

      expect(screen.getByRole("radiogroup", { name: "View" })).toBeInTheDocument();
    });

    it("falls back to aria-label when there's no visible label", () => {
      render(<SegmentedControl aria-label="View" options={VIEWS} />);

      expect(screen.getByRole("radiogroup", { name: "View" })).toBeInTheDocument();
    });

    it("renders one radio per option", () => {
      render(<SegmentedControl label="View" options={VIEWS} />);

      expect(screen.getAllByRole("radio")).toHaveLength(3);
      expect(screen.getByRole("radio", { name: "List" })).toBeInTheDocument();
    });

    it("puts every radio in the same native group", () => {
      // This is what gives arrow-key navigation and single-selection for free.
      render(<SegmentedControl label="View" options={VIEWS} />);

      const names = screen.getAllByRole("radio").map((r) => r.getAttribute("name"));

      expect(new Set(names).size).toBe(1);
      expect(names[0]).toBeTruthy();
    });

    it("uses a caller-supplied group name", () => {
      render(<SegmentedControl label="View" options={VIEWS} name="view-picker" />);

      for (const radio of screen.getAllByRole("radio")) {
        expect(radio).toHaveAttribute("name", "view-picker");
      }
    });

    it("keeps separate instances in separate groups", () => {
      render(
        <>
          <SegmentedControl label="One" options={VIEWS} />
          <SegmentedControl label="Two" options={VIEWS} />
        </>,
      );

      const names = screen.getAllByRole("radio").map((r) => r.getAttribute("name"));

      expect(new Set(names).size).toBe(2);
    });
  });

  describe("selection", () => {
    it("selects nothing by default", () => {
      render(<SegmentedControl label="View" options={VIEWS} />);

      for (const radio of screen.getAllByRole("radio")) {
        expect(radio).not.toBeChecked();
      }
    });

    it("honours defaultValue when uncontrolled", () => {
      render(<SegmentedControl label="View" options={VIEWS} defaultValue="grid" />);

      expect(screen.getByRole("radio", { name: "Grid" })).toBeChecked();
      expect(screen.getByRole("radio", { name: "List" })).not.toBeChecked();
    });

    it("updates its own selection when uncontrolled", async () => {
      const user = userEvent.setup();
      render(<SegmentedControl label="View" options={VIEWS} defaultValue="list" />);

      await user.click(screen.getByRole("radio", { name: "Board" }));

      expect(screen.getByRole("radio", { name: "Board" })).toBeChecked();
      expect(screen.getByRole("radio", { name: "List" })).not.toBeChecked();
    });

    it("reports the new value to onChange", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<SegmentedControl label="View" options={VIEWS} onChange={onChange} />);

      await user.click(screen.getByRole("radio", { name: "Grid" }));

      expect(onChange).toHaveBeenCalledExactlyOnceWith("grid");
    });

    it("reflects the controlled value", () => {
      render(<SegmentedControl label="View" options={VIEWS} value="board" />);

      expect(screen.getByRole("radio", { name: "Board" })).toBeChecked();
    });

    it("does not self-update when controlled", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <SegmentedControl label="View" options={VIEWS} value="list" onChange={onChange} />,
      );

      await user.click(screen.getByRole("radio", { name: "Grid" }));

      // The parent owns the value; without a prop change nothing moves.
      expect(onChange).toHaveBeenCalledExactlyOnceWith("grid");
      expect(screen.getByRole("radio", { name: "List" })).toBeChecked();
      expect(screen.getByRole("radio", { name: "Grid" })).not.toBeChecked();
    });

    it("follows a controlled value change", () => {
      const { rerender } = render(
        <SegmentedControl label="View" options={VIEWS} value="list" />,
      );
      expect(screen.getByRole("radio", { name: "List" })).toBeChecked();

      rerender(<SegmentedControl label="View" options={VIEWS} value="board" />);

      expect(screen.getByRole("radio", { name: "Board" })).toBeChecked();
      expect(screen.getByRole("radio", { name: "List" })).not.toBeChecked();
    });
  });

  describe("keyboard", () => {
    it("is reachable by tab and selectable with space", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <SegmentedControl label="View" options={VIEWS} defaultValue="list" onChange={onChange} />,
      );

      await user.tab();
      expect(screen.getByRole("radio", { name: "List" })).toHaveFocus();

      await user.keyboard(" ");
      expect(screen.getByRole("radio", { name: "List" })).toBeChecked();
    });
  });

  describe("disabled", () => {
    it("disables a single segment", () => {
      render(
        <SegmentedControl
          label="View"
          options={[...VIEWS.slice(0, 2), { value: "board", label: "Board", disabled: true }]}
        />,
      );

      expect(screen.getByRole("radio", { name: "Board" })).toBeDisabled();
      expect(screen.getByRole("radio", { name: "List" })).toBeEnabled();
    });

    it("disables every segment when the group is disabled", () => {
      render(<SegmentedControl label="View" options={VIEWS} disabled />);

      for (const radio of screen.getAllByRole("radio")) {
        expect(radio).toBeDisabled();
      }
    });

    it("does not fire onChange for a disabled segment", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <SegmentedControl
          label="View"
          options={[{ value: "list", label: "List", disabled: true }]}
          onChange={onChange}
        />,
      );

      await user.click(screen.getByRole("radio", { name: "List" }));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("sliding indicator", () => {
    // The indicator is a single ::after on the track, positioned from these
    // custom properties. Pseudo-elements aren't observable in jsdom, so the
    // contract worth pinning is the values CSS reads.
    const track = (container: HTMLElement) =>
      container.querySelector(".sh-segmented") as HTMLElement;

    it("publishes the segment count", () => {
      const { container } = render(<SegmentedControl label="View" options={VIEWS} />);

      expect(track(container).style.getPropertyValue("--sh-segmented-count")).toBe("3");
    });

    it("publishes the index of the selected segment", () => {
      const { container } = render(
        <SegmentedControl label="View" options={VIEWS} value="board" />,
      );

      expect(track(container).style.getPropertyValue("--sh-segmented-index")).toBe("2");
    });

    it("moves the index when the selection changes", async () => {
      const user = userEvent.setup();
      const { container } = render(
        <SegmentedControl label="View" options={VIEWS} defaultValue="list" />,
      );
      expect(track(container).style.getPropertyValue("--sh-segmented-index")).toBe("0");

      await user.click(screen.getByRole("radio", { name: "Grid" }));

      expect(track(container).style.getPropertyValue("--sh-segmented-index")).toBe("1");
    });

    it("hides the indicator while nothing is selected", () => {
      const { container } = render(<SegmentedControl label="View" options={VIEWS} />);

      expect(track(container)).toHaveClass("sh-segmented--unselected");
    });

    it("shows the indicator once something is selected", () => {
      const { container } = render(
        <SegmentedControl label="View" options={VIEWS} defaultValue="list" />,
      );

      expect(track(container)).not.toHaveClass("sh-segmented--unselected");
    });

    it("never emits a negative index", () => {
      // A translateX of -100% would park the indicator outside the track.
      const { container } = render(<SegmentedControl label="View" options={VIEWS} />);

      expect(track(container).style.getPropertyValue("--sh-segmented-index")).toBe("0");
    });
  });

  describe("styling hooks", () => {
    it("merges a custom className onto the track", () => {
      const { container } = render(
        <SegmentedControl label="View" options={VIEWS} className="custom" />,
      );

      expect(container.querySelector(".sh-segmented")).toHaveClass("custom");
    });

    it("flags full width", () => {
      const { container } = render(
        <SegmentedControl label="View" options={VIEWS} fullWidth />,
      );

      expect(container.querySelector(".sh-segmented")).toHaveClass("sh-segmented--full-width");
    });
  });
});
