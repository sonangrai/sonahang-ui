import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Tooltip } from "../Tooltip";
import type { TooltipProps } from "../Tooltip";

/** Default delay off, so the common case doesn't need fake timers. */
const Target = (props: Partial<TooltipProps>) => (
  <Tooltip content="Saves your work" delay={0} {...props}>
    <button type="button">Save</button>
  </Tooltip>
);

const trigger = () => screen.getByRole("button", { name: "Save" });
const tip = () => screen.queryByRole("tooltip");
const isShowing = () => tip()?.className.includes("sh-tooltip__tip--open") ?? false;

/** Real timers throughout: fake ones deadlock against user-event's own waits. */
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Tooltip", () => {
  describe("structure", () => {
    it("renders the trigger", () => {
      render(<Target />);

      expect(trigger()).toBeInTheDocument();
    });

    it("gives the tip role=tooltip", () => {
      render(<Target />);

      expect(tip()).toHaveTextContent("Saves your work");
    });

    it("points the trigger at the tip", () => {
      // Without this the tip is invisible to a screen reader, which is most of
      // the reason to use a tooltip rather than a title attribute.
      render(<Target />);

      expect(trigger()).toHaveAttribute("aria-describedby", tip()?.id);
    });

    it("keeps the reference while closed", () => {
      // Assistive technology computes the description when focus arrives, and
      // a directly referenced hidden element still contributes its text.
      render(<Target />);

      expect(isShowing()).toBe(false);
      expect(trigger()).toHaveAttribute("aria-describedby");
    });

    it("keeps a describedby the trigger already had", () => {
      render(
        <>
          <span id="hint">Existing hint</span>
          <Tooltip content="Saves your work">
            <button type="button" aria-describedby="hint">
              Save
            </button>
          </Tooltip>
        </>,
      );

      expect(trigger().getAttribute("aria-describedby")).toMatch(/^hint \S+$/);
    });

    it("keeps ids unique between instances", () => {
      render(
        <>
          <Target />
          <Target />
        </>,
      );

      const ids = screen.getAllByRole("tooltip").map((element) => element.id);
      expect(new Set(ids).size).toBe(2);
    });

    it("leaves the trigger's own props alone", () => {
      const onClick = vi.fn();
      render(
        <Tooltip content="Saves your work">
          <button type="button" className="mine" onClick={onClick}>
            Save
          </button>
        </Tooltip>,
      );

      expect(trigger()).toHaveClass("mine");
    });

    it("applies the placement class", () => {
      render(<Target placement="right" />);

      expect(tip()).toHaveClass("sh-tooltip__tip--right");
    });

    it("defaults to the top placement", () => {
      render(<Target />);

      expect(tip()).toHaveClass("sh-tooltip__tip--top");
    });
  });

  describe("showing and hiding", () => {
    it("starts hidden", () => {
      render(<Target />);

      expect(isShowing()).toBe(false);
    });

    it("shows on hover", async () => {
      const user = userEvent.setup();
      render(<Target />);

      await user.hover(trigger());

      expect(isShowing()).toBe(true);
    });

    it("hides again on unhover", async () => {
      const user = userEvent.setup();
      render(<Target />);

      await user.hover(trigger());
      await user.unhover(trigger());

      expect(isShowing()).toBe(false);
    });

    it("shows on keyboard focus", async () => {
      const user = userEvent.setup();
      render(<Target />);

      await user.tab();

      expect(trigger()).toHaveFocus();
      expect(isShowing()).toBe(true);
    });

    it("hides on blur", async () => {
      const user = userEvent.setup();
      render(
        <>
          <Target />
          <button type="button">Elsewhere</button>
        </>,
      );

      await user.tab();
      await user.tab();

      expect(isShowing()).toBe(false);
    });

    it("hides on press", async () => {
      // Focus stays on the trigger after a click; without this the tip would
      // hang around covering whatever the click just did.
      const user = userEvent.setup();
      render(<Target />);

      await user.hover(trigger());
      await user.click(trigger());

      expect(isShowing()).toBe(false);
    });

    it("shows again once the pointer has left and come back", async () => {
      // The press only suppresses the tip for that visit, not permanently.
      const user = userEvent.setup();
      render(<Target />);

      await user.click(trigger());
      await user.unhover(trigger());
      await user.hover(trigger());

      expect(isShowing()).toBe(true);
    });

    it("hides on Escape", async () => {
      const user = userEvent.setup();
      render(<Target />);

      await user.hover(trigger());
      await user.keyboard("{Escape}");

      expect(isShowing()).toBe(false);
    });

    it("reports each change once", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<Target onOpenChange={onOpenChange} />);

      await user.hover(trigger());
      await user.unhover(trigger());

      expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    });

    it("stays quiet when nothing changes", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<Target onOpenChange={onOpenChange} />);

      await user.unhover(trigger());

      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it("honours defaultOpen", () => {
      render(<Target defaultOpen />);

      expect(isShowing()).toBe(true);
    });
  });

  describe("delay", () => {
    it("waits before showing", async () => {
      const user = userEvent.setup();
      render(<Target delay={100} />);

      await user.hover(trigger());
      expect(isShowing()).toBe(false);

      await waitFor(() => expect(isShowing()).toBe(true));
    });

    it("cancels a pending tip when the pointer leaves first", async () => {
      // Sweeping the pointer across a row of icons shouldn't leave a trail of
      // tips popping up behind it.
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<Target delay={100} onOpenChange={onOpenChange} />);

      await user.hover(trigger());
      await user.unhover(trigger());
      await wait(200);

      expect(isShowing()).toBe(false);
      expect(onOpenChange).not.toHaveBeenCalled();
    });

    it("defaults to a delay rather than showing instantly", async () => {
      const user = userEvent.setup();
      render(
        <Tooltip content="Saves your work">
          <button type="button">Save</button>
        </Tooltip>,
      );

      await user.hover(trigger());

      expect(isShowing()).toBe(false);
    });
  });

  describe("controlled", () => {
    it("reflects the open prop", () => {
      render(<Target open />);

      expect(isShowing()).toBe(true);
    });

    it("does not self-update", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<Target open={false} onOpenChange={onOpenChange} />);

      await user.hover(trigger());

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);
      expect(isShowing()).toBe(false);
    });

    it("follows a value change", () => {
      const { rerender } = render(<Target open={false} />);
      rerender(<Target open />);

      expect(isShowing()).toBe(true);
    });

    it("can be dismissed with Escape while held open", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<Target open onOpenChange={onOpenChange} />);

      await user.keyboard("{Escape}");

      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
    });
  });

  describe("no tip to show", () => {
    it("renders nothing extra when disabled", () => {
      render(<Target disabled />);

      expect(tip()).not.toBeInTheDocument();
      expect(trigger()).not.toHaveAttribute("aria-describedby");
    });

    it("stays closed when disabled", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<Target disabled onOpenChange={onOpenChange} />);

      await user.hover(trigger());

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(tip()).not.toBeInTheDocument();
    });

    it("renders nothing extra with empty content", () => {
      // An empty tip would leave aria-describedby pointing at nothing, which
      // reads worse than no description at all.
      render(<Target content="" />);

      expect(tip()).not.toBeInTheDocument();
      expect(trigger()).not.toHaveAttribute("aria-describedby");
    });

    it("renders nothing extra with no content prop", () => {
      render(
        <Tooltip>
          <button type="button">Save</button>
        </Tooltip>,
      );

      expect(tip()).not.toBeInTheDocument();
    });
  });

  describe("misuse", () => {
    it("fails loudly on a non-element child", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() =>
        // @ts-expect-error - the point of the test is the runtime guard.
        render(<Tooltip content="Nope">just text</Tooltip>),
      ).toThrow("<Tooltip> expects a single element child to describe.");

      spy.mockRestore();
    });
  });

  describe("styling hooks", () => {
    it("merges a className onto the wrapper", () => {
      const { container } = render(<Target className="custom" />);

      expect(container.querySelector(".sh-tooltip")).toHaveClass("custom");
    });
  });
});
