import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Tab } from "../Tab";
import { TabList } from "../TabList";
import { TabPanel } from "../TabPanel";
import { Tabs } from "../Tabs";
import type { TabsProps } from "../Tabs";

const Basic = (props: Partial<TabsProps>) => (
  <Tabs defaultValue="one" {...props}>
    <TabList aria-label="Sections">
      <Tab value="one">One</Tab>
      <Tab value="two">Two</Tab>
      <Tab value="three">Three</Tab>
    </TabList>
    <TabPanel value="one">First panel</TabPanel>
    <TabPanel value="two">Second panel</TabPanel>
    <TabPanel value="three">Third panel</TabPanel>
  </Tabs>
);

const tab = (name: string) => screen.getByRole("tab", { name });

describe("Tabs", () => {
  describe("structure", () => {
    it("exposes a named tablist with a tab each", () => {
      render(<Basic />);

      expect(screen.getByRole("tablist", { name: "Sections" })).toBeInTheDocument();
      expect(screen.getAllByRole("tab")).toHaveLength(3);
    });

    it("shows only the selected panel", () => {
      render(<Basic />);

      expect(screen.getByRole("tabpanel")).toHaveTextContent("First panel");
      expect(screen.queryByText("Second panel")).not.toBeInTheDocument();
    });

    it("ties each tab to its panel", () => {
      render(<Basic />);

      const panel = screen.getByRole("tabpanel");
      expect(tab("One")).toHaveAttribute("aria-controls", panel.id);
      expect(panel).toHaveAttribute("aria-labelledby", tab("One").id);
    });

    it("marks only the selected tab", () => {
      render(<Basic />);

      expect(tab("One")).toHaveAttribute("aria-selected", "true");
      expect(tab("Two")).toHaveAttribute("aria-selected", "false");
    });

    it("keeps ids unique between instances", () => {
      render(
        <>
          <Basic />
          <Basic />
        </>,
      );

      const ids = screen.getAllByRole("tab", { name: "One" }).map((element) => element.id);
      expect(new Set(ids).size).toBe(2);
    });

    it("gives tabs type=button so they never submit a form", () => {
      render(<Basic />);

      expect(tab("One")).toHaveAttribute("type", "button");
    });

    it("makes the panel focusable so it can be scrolled", () => {
      render(<Basic />);

      expect(screen.getByRole("tabpanel")).toHaveAttribute("tabindex", "0");
    });
  });

  describe("roving tabindex", () => {
    // Tab should skip past the whole widget, not walk through every tab.
    it("puts only the selected tab in the tab order", () => {
      render(<Basic />);

      expect(tab("One")).toHaveAttribute("tabindex", "0");
      expect(tab("Two")).toHaveAttribute("tabindex", "-1");
      expect(tab("Three")).toHaveAttribute("tabindex", "-1");
    });

    it("moves with the selection", async () => {
      const user = userEvent.setup();
      render(<Basic />);

      await user.click(tab("Three"));

      expect(tab("One")).toHaveAttribute("tabindex", "-1");
      expect(tab("Three")).toHaveAttribute("tabindex", "0");
    });

    it("reaches the panel with one more Tab press", async () => {
      const user = userEvent.setup();
      render(<Basic />);

      await user.tab();
      expect(tab("One")).toHaveFocus();

      await user.tab();
      expect(screen.getByRole("tabpanel")).toHaveFocus();
    });
  });

  describe("selection", () => {
    it("selects on click", async () => {
      const user = userEvent.setup();
      render(<Basic />);

      await user.click(tab("Two"));

      expect(tab("Two")).toHaveAttribute("aria-selected", "true");
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Second panel");
    });

    it("reports the new value", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Basic onChange={onChange} />);

      await user.click(tab("Two"));

      expect(onChange).toHaveBeenCalledExactlyOnceWith("two");
    });

    it("selects nothing when no default is given", () => {
      render(
        <Tabs>
          <TabList aria-label="Sections">
            <Tab value="one">One</Tab>
          </TabList>
          <TabPanel value="one">First panel</TabPanel>
        </Tabs>,
      );

      expect(screen.queryByRole("tabpanel")).not.toBeInTheDocument();
      expect(tab("One")).toHaveAttribute("aria-selected", "false");
    });

    it("reflects a controlled value", () => {
      render(<Basic value="three" />);

      expect(tab("Three")).toHaveAttribute("aria-selected", "true");
    });

    it("does not self-update when controlled", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Basic value="one" onChange={onChange} />);

      await user.click(tab("Two"));

      expect(onChange).toHaveBeenCalledExactlyOnceWith("two");
      expect(tab("One")).toHaveAttribute("aria-selected", "true");
    });

    it("follows a controlled value change", () => {
      const { rerender } = render(<Basic value="one" />);
      rerender(<Basic value="two" />);

      expect(screen.getByRole("tabpanel")).toHaveTextContent("Second panel");
    });
  });

  describe("keyboard: automatic activation", () => {
    it("moves right and selects", async () => {
      const user = userEvent.setup();
      render(<Basic />);

      tab("One").focus();
      await user.keyboard("{ArrowRight}");

      expect(tab("Two")).toHaveFocus();
      expect(tab("Two")).toHaveAttribute("aria-selected", "true");
    });

    it("moves left", async () => {
      const user = userEvent.setup();
      render(<Basic defaultValue="two" />);

      tab("Two").focus();
      await user.keyboard("{ArrowLeft}");

      expect(tab("One")).toHaveFocus();
    });

    it("wraps past the end", async () => {
      const user = userEvent.setup();
      render(<Basic defaultValue="three" />);

      tab("Three").focus();
      await user.keyboard("{ArrowRight}");

      expect(tab("One")).toHaveFocus();
    });

    it("wraps before the start", async () => {
      const user = userEvent.setup();
      render(<Basic />);

      tab("One").focus();
      await user.keyboard("{ArrowLeft}");

      expect(tab("Three")).toHaveFocus();
    });

    it("jumps to the first with Home and last with End", async () => {
      const user = userEvent.setup();
      render(<Basic defaultValue="two" />);

      tab("Two").focus();
      await user.keyboard("{End}");
      expect(tab("Three")).toHaveFocus();

      await user.keyboard("{Home}");
      expect(tab("One")).toHaveFocus();
    });

    it("ignores the cross-axis arrows when horizontal", async () => {
      const user = userEvent.setup();
      render(<Basic />);

      tab("One").focus();
      await user.keyboard("{ArrowDown}");

      expect(tab("One")).toHaveFocus();
    });

    it("skips disabled tabs", async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="one">
          <TabList aria-label="Sections">
            <Tab value="one">One</Tab>
            <Tab value="two" disabled>
              Two
            </Tab>
            <Tab value="three">Three</Tab>
          </TabList>
          <TabPanel value="one">First panel</TabPanel>
          <TabPanel value="three">Third panel</TabPanel>
        </Tabs>,
      );

      tab("One").focus();
      await user.keyboard("{ArrowRight}");

      expect(tab("Three")).toHaveFocus();
    });
  });

  describe("keyboard: vertical", () => {
    it("moves with the vertical arrows", async () => {
      const user = userEvent.setup();
      render(<Basic orientation="vertical" />);

      tab("One").focus();
      await user.keyboard("{ArrowDown}");
      expect(tab("Two")).toHaveFocus();

      await user.keyboard("{ArrowUp}");
      expect(tab("One")).toHaveFocus();
    });

    it("ignores the cross-axis arrows when vertical", async () => {
      const user = userEvent.setup();
      render(<Basic orientation="vertical" />);

      tab("One").focus();
      await user.keyboard("{ArrowRight}");

      expect(tab("One")).toHaveFocus();
    });

    it("advertises its orientation", () => {
      render(<Basic orientation="vertical" />);

      expect(screen.getByRole("tablist")).toHaveAttribute("aria-orientation", "vertical");
    });
  });

  describe("keyboard: manual activation", () => {
    it("moves focus without selecting", async () => {
      const user = userEvent.setup();
      render(<Basic activation="manual" />);

      tab("One").focus();
      await user.keyboard("{ArrowRight}");

      expect(tab("Two")).toHaveFocus();
      expect(tab("Two")).toHaveAttribute("aria-selected", "false");
      expect(tab("One")).toHaveAttribute("aria-selected", "true");
    });

    it("selects on Enter", async () => {
      const user = userEvent.setup();
      render(<Basic activation="manual" />);

      tab("One").focus();
      await user.keyboard("{ArrowRight}{Enter}");

      expect(tab("Two")).toHaveAttribute("aria-selected", "true");
    });

    it("selects on Space", async () => {
      const user = userEvent.setup();
      render(<Basic activation="manual" />);

      tab("One").focus();
      await user.keyboard("{ArrowRight}[Space]");

      expect(tab("Two")).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("keepMounted", () => {
    it("keeps hidden panels in the DOM but hidden", () => {
      render(
        <Tabs defaultValue="one">
          <TabList aria-label="Sections">
            <Tab value="one">One</Tab>
            <Tab value="two">Two</Tab>
          </TabList>
          <TabPanel value="one" keepMounted>
            First panel
          </TabPanel>
          <TabPanel value="two" keepMounted>
            Second panel
          </TabPanel>
        </Tabs>,
      );

      // Present in the DOM, absent from the accessibility tree.
      expect(screen.getByText("Second panel", { ignore: "" })).toBeInTheDocument();
      expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
    });

    it("preserves state across a switch", async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="one">
          <TabList aria-label="Sections">
            <Tab value="one">One</Tab>
            <Tab value="two">Two</Tab>
          </TabList>
          <TabPanel value="one" keepMounted>
            <input aria-label="Note" />
          </TabPanel>
          <TabPanel value="two" keepMounted>
            Second panel
          </TabPanel>
        </Tabs>,
      );

      await user.type(screen.getByLabelText("Note"), "kept");
      await user.click(tab("Two"));
      await user.click(tab("One"));

      expect(screen.getByLabelText("Note")).toHaveValue("kept");
    });
  });

  describe("misuse", () => {
    it.each([
      ["Tab", <Tab value="x">X</Tab>],
      ["TabPanel", <TabPanel value="x">X</TabPanel>],
    ])("fails loudly when %s is used outside Tabs", (name, element) => {
      // Silently rendering an unwired tab would be far harder to debug.
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => render(element)).toThrow(`<${name}> must be rendered inside <Tabs>.`);

      spy.mockRestore();
    });
  });

  describe("sliding indicator", () => {
    /*
     * jsdom has no layout, so every offset/size measures 0 — the geometry
     * itself can't be asserted here. What's pinned is the surrounding
     * contract: when the indicator exists, that it's decorative, and that it
     * doesn't animate into place on first paint.
     */
    const indicator = (container: HTMLElement) =>
      container.querySelector(".sh-tabs__indicator");

    it("renders an indicator when a tab is selected", () => {
      const { container } = render(<Basic />);

      expect(indicator(container)).toBeInTheDocument();
    });

    it("renders none when nothing is selected", () => {
      const { container } = render(
        <Tabs>
          <TabList aria-label="Sections">
            <Tab value="one">One</Tab>
          </TabList>
          <TabPanel value="one">First panel</TabPanel>
        </Tabs>,
      );

      expect(indicator(container)).not.toBeInTheDocument();
    });

    it("clears the indicator when the value matches no tab", () => {
      /*
       * Reachable when `value` and the rendered tabs fall out of sync — a
       * stale indicator would be left underlining a tab that isn't selected.
       * Note `value={undefined}` can't express this: undefined is the sentinel
       * for uncontrolled, so it reverts to `defaultValue` rather than
       * deselecting.
       */
      const { container, rerender } = render(<Basic value="one" />);
      expect(indicator(container)).toBeInTheDocument();

      rerender(<Basic value="removed" />);

      expect(indicator(container)).not.toBeInTheDocument();
    });

    it("hides the indicator from assistive tech", () => {
      const { container } = render(<Basic />);

      expect(indicator(container)).toHaveAttribute("aria-hidden", "true");
    });

    it("does not animate on first paint", () => {
      // Otherwise it slides in from the left every time the widget mounts.
      const { container } = render(<Basic />);

      expect(indicator(container)).not.toHaveClass("sh-tabs__indicator--animated");
    });

    it("animates once the selection moves", async () => {
      const user = userEvent.setup();
      const { container } = render(<Basic />);

      await user.click(tab("Two"));

      expect(indicator(container)).toHaveClass("sh-tabs__indicator--animated");
    });

    it("publishes offset and size for CSS to position it", () => {
      const { container } = render(<Basic />);
      const style = (indicator(container) as HTMLElement).style;

      expect(style.getPropertyValue("--sh-tabs-indicator-offset")).toBeTruthy();
      expect(style.getPropertyValue("--sh-tabs-indicator-size")).toBeTruthy();
    });

    it("survives an environment without ResizeObserver", () => {
      // jsdom has none by default; the component must not assume one exists.
      const { container } = render(<Basic />);

      expect(indicator(container)).toBeInTheDocument();
    });
  });

  describe("styling hooks", () => {
    it("flags the selected tab", () => {
      const { container } = render(<Basic />);

      expect(container.querySelector(".sh-tabs__tab--selected")).toHaveTextContent("One");
    });

    it("applies the orientation class", () => {
      const { container } = render(<Basic orientation="vertical" />);

      expect(container.querySelector(".sh-tabs")).toHaveClass("sh-tabs--vertical");
    });

    it("merges custom classNames", () => {
      const { container } = render(<Basic className="custom" />);

      expect(container.querySelector(".sh-tabs")).toHaveClass("custom");
    });
  });
});
