import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Collapsible } from "../Collapsible";
import { CollapsibleItem } from "../CollapsibleItem";
import type { CollapsibleProps } from "../Collapsible";

const Tree = (props: Partial<CollapsibleProps>) => (
  <Collapsible {...props}>
    <CollapsibleItem value="one" title="One" icon={<span data-testid="icon-one" />}>
      <CollapsibleItem value="one-a" title="One A" icon={<span data-testid="icon-one-a" />}>
        <CollapsibleItem value="one-a-i" title="One A i" />
      </CollapsibleItem>
      <CollapsibleItem value="one-b" title="One B" />
    </CollapsibleItem>
    <CollapsibleItem value="two" title="Two" />
  </Collapsible>
);

const trigger = (name: string) => screen.getByRole("button", { name });
const isOpen = (name: string) => trigger(name).getAttribute("aria-expanded") === "true";
const item = (text: string) => screen.getByText(text).closest(".sh-collapsible__item");

describe("Collapsible", () => {
  describe("structure", () => {
    it("renders a toggle only for items with children", () => {
      render(<Tree />);

      expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual([
        "One",
        "One A",
      ]);
      expect(screen.queryByRole("button", { name: "Two" })).not.toBeInTheDocument();
    });

    it("records each item's depth from the nesting", () => {
      render(<Tree />);

      expect(item("One")).toHaveAttribute("data-depth", "0");
      expect(item("One A")).toHaveAttribute("data-depth", "1");
      expect(item("One A i")).toHaveAttribute("data-depth", "2");
      expect(item("Two")).toHaveAttribute("data-depth", "0");
    });

    it("ties each trigger to its panel", () => {
      const { container } = render(<Tree />);
      const panel = container.querySelector(
        "#" + CSS.escape(trigger("One").getAttribute("aria-controls") as string),
      );

      expect(panel).toBeInTheDocument();
      expect(panel).toHaveAttribute("aria-labelledby", trigger("One").id);
    });

    it("gives triggers type=button so none submits a form", () => {
      render(<Tree />);

      for (const button of screen.getAllByRole("button")) {
        expect(button).toHaveAttribute("type", "button");
      }
    });

    it("renders custom icons at any level", () => {
      render(<Tree />);

      expect(screen.getByTestId("icon-one")).toBeInTheDocument();
      expect(screen.getByTestId("icon-one-a")).toBeInTheDocument();
    });

    it("throws a helpful error outside a Collapsible", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => render(<CollapsibleItem value="x" title="X" />)).toThrow(
        "<CollapsibleItem> must be rendered inside <Collapsible>.",
      );
      vi.restoreAllMocks();
    });
  });

  describe("open state", () => {
    it("starts closed by default", () => {
      render(<Tree />);

      expect(isOpen("One")).toBe(false);
      expect(isOpen("One A")).toBe(false);
    });

    it("honours defaultValue at any level", () => {
      render(<Tree defaultValue={["one", "one-a"]} />);

      expect(isOpen("One")).toBe(true);
      expect(isOpen("One A")).toBe(true);
    });

    it("toggles items independently", async () => {
      const user = userEvent.setup();
      render(<Tree />);

      await user.click(trigger("One"));
      await user.click(trigger("One A"));
      expect(isOpen("One")).toBe(true);
      expect(isOpen("One A")).toBe(true);

      await user.click(trigger("One A"));
      expect(isOpen("One")).toBe(true);
      expect(isOpen("One A")).toBe(false);
    });

    it("keeps a child's state when its parent closes and reopens", async () => {
      const user = userEvent.setup();
      render(<Tree defaultValue={["one", "one-a"]} />);

      await user.click(trigger("One"));
      await user.click(trigger("One"));

      expect(isOpen("One A")).toBe(true);
    });

    it("fires onChange with the full open list", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Tree defaultValue={["one"]} onChange={onChange} />);

      await user.click(trigger("One A"));
      expect(onChange).toHaveBeenLastCalledWith(["one", "one-a"]);
    });

    it("follows the value prop when controlled", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Tree value={["one"]} onChange={onChange} />);

      await user.click(trigger("One"));

      expect(onChange).toHaveBeenCalledWith([]);
      expect(isOpen("One")).toBe(true);
    });

    it("doesn't toggle a disabled item", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Collapsible onChange={onChange}>
          <CollapsibleItem value="a" title="A" disabled>
            <CollapsibleItem value="a1" title="A1" />
          </CollapsibleItem>
        </Collapsible>,
      );

      await user.click(trigger("A"));

      expect(onChange).not.toHaveBeenCalled();
      expect(isOpen("A")).toBe(false);
    });
  });

  describe("indicators", () => {
    it("shows the default chevron when no custom icons are given", () => {
      const { container } = render(<Tree />);

      expect(container.querySelectorAll(".sh-collapsible__chevron")).toHaveLength(2);
    });

    it("swaps root-level custom icons with the open state, at every level", async () => {
      const user = userEvent.setup();
      render(
        <Collapsible
          expandedIcon={<span data-testid="open" />}
          collapsedIcon={<span data-testid="closed" />}
        >
          <CollapsibleItem value="a" title="A">
            <CollapsibleItem value="a1" title="A1">
              <CollapsibleItem value="leaf" title="Leaf" />
            </CollapsibleItem>
          </CollapsibleItem>
        </Collapsible>,
      );

      expect(screen.getAllByTestId("closed")).toHaveLength(2);
      expect(screen.queryByTestId("open")).not.toBeInTheDocument();

      await user.click(trigger("A"));
      expect(screen.getAllByTestId("open")).toHaveLength(1);
      expect(screen.getAllByTestId("closed")).toHaveLength(1);
    });

    it("lets an item override the root's icons", () => {
      render(
        <Collapsible collapsedIcon={<span data-testid="root-closed" />}>
          <CollapsibleItem value="a" title="A" collapsedIcon={<span data-testid="own-closed" />}>
            <CollapsibleItem value="a1" title="A1" />
          </CollapsibleItem>
        </Collapsible>,
      );

      expect(screen.getByTestId("own-closed")).toBeInTheDocument();
      expect(screen.queryByTestId("root-closed")).not.toBeInTheDocument();
    });
  });
});
