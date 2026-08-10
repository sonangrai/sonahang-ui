import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Accordion } from "../Accordion";
import { AccordionItem } from "../AccordionItem";
import type { AccordionProps } from "../Accordion";

const Faq = (props: Partial<AccordionProps>) => (
  <Accordion {...props}>
    <AccordionItem value="one" title="First">
      First answer
    </AccordionItem>
    <AccordionItem value="two" title="Second">
      Second answer
    </AccordionItem>
    <AccordionItem value="three" title="Third">
      Third answer
    </AccordionItem>
  </Accordion>
);

const trigger = (name: string) => screen.getByRole("button", { name });
const isOpen = (name: string) => trigger(name).getAttribute("aria-expanded") === "true";

describe("Accordion", () => {
  describe("structure", () => {
    it("renders a trigger per item", () => {
      render(<Faq />);

      expect(screen.getAllByRole("button")).toHaveLength(3);
    });

    it("wraps each trigger in a heading", () => {
      // Without this the sections are missing from the document outline and
      // from screen-reader heading navigation.
      render(<Faq />);

      expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
      expect(screen.getByRole("heading", { name: "First" })).toBeInTheDocument();
    });

    it("honours a custom heading level", () => {
      render(<Faq headingLevel={2} />);

      expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(3);
      expect(screen.queryAllByRole("heading", { level: 3 })).toHaveLength(0);
    });

    it("ties each trigger to its panel", () => {
      const { container } = render(<Faq defaultValue={["one"]} />);
      const panel = container.querySelector("#" + CSS.escape(
        trigger("First").getAttribute("aria-controls") as string,
      ));

      expect(panel).toBeInTheDocument();
      expect(panel).toHaveAttribute("aria-labelledby", trigger("First").id);
    });

    it("keeps ids unique between instances", () => {
      render(
        <>
          <Faq />
          <Faq />
        </>,
      );

      const ids = screen.getAllByRole("button", { name: "First" }).map((b) => b.id);
      expect(new Set(ids).size).toBe(2);
    });

    it("gives triggers type=button so none submits a form", () => {
      render(<Faq />);

      for (const button of screen.getAllByRole("button")) {
        expect(button).toHaveAttribute("type", "button");
      }
    });

    it("puts every trigger in the tab order", () => {
      // Accordion headers are ordinary tab stops — no roving tabindex here.
      render(<Faq />);

      for (const button of screen.getAllByRole("button")) {
        expect(button).not.toHaveAttribute("tabindex");
      }
    });
  });

  describe("opening and closing", () => {
    it("starts closed", () => {
      render(<Faq />);

      expect(isOpen("First")).toBe(false);
      expect(isOpen("Second")).toBe(false);
    });

    it("honours defaultValue", () => {
      render(<Faq defaultValue={["two"]} />);

      expect(isOpen("Second")).toBe(true);
      expect(isOpen("First")).toBe(false);
    });

    it("opens on click", async () => {
      const user = userEvent.setup();
      render(<Faq />);

      await user.click(trigger("First"));

      expect(isOpen("First")).toBe(true);
    });

    it("closes again on a second click", async () => {
      const user = userEvent.setup();
      render(<Faq defaultValue={["one"]} />);

      await user.click(trigger("First"));

      expect(isOpen("First")).toBe(false);
    });

    it("reports the full open list", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Faq onChange={onChange} />);

      await user.click(trigger("Second"));

      expect(onChange).toHaveBeenCalledExactlyOnceWith(["two"]);
    });

    it("flags the open item for styling", async () => {
      const user = userEvent.setup();
      const { container } = render(<Faq />);

      await user.click(trigger("First"));

      expect(container.querySelector(".sh-accordion__item--open")).toBeInTheDocument();
    });
  });

  describe("single vs multiple", () => {
    it("closes the previous item by default", async () => {
      const user = userEvent.setup();
      render(<Faq defaultValue={["one"]} />);

      await user.click(trigger("Second"));

      expect(isOpen("Second")).toBe(true);
      expect(isOpen("First")).toBe(false);
    });

    it("keeps items open with type=multiple", async () => {
      const user = userEvent.setup();
      render(<Faq type="multiple" defaultValue={["one"]} />);

      await user.click(trigger("Second"));

      expect(isOpen("First")).toBe(true);
      expect(isOpen("Second")).toBe(true);
    });

    it("closes only the clicked item with type=multiple", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Faq type="multiple" defaultValue={["one", "two"]} onChange={onChange} />);

      await user.click(trigger("First"));

      expect(onChange).toHaveBeenCalledExactlyOnceWith(["two"]);
    });

    it("refuses to close the last item when not collapsible", async () => {
      const user = userEvent.setup();
      render(<Faq defaultValue={["one"]} collapsible={false} />);

      await user.click(trigger("First"));

      expect(isOpen("First")).toBe(true);
    });

    it("still switches items when not collapsible", async () => {
      const user = userEvent.setup();
      render(<Faq defaultValue={["one"]} collapsible={false} />);

      await user.click(trigger("Second"));

      expect(isOpen("Second")).toBe(true);
      expect(isOpen("First")).toBe(false);
    });
  });

  describe("controlled", () => {
    it("reflects the value prop", () => {
      render(<Faq value={["three"]} />);

      expect(isOpen("Third")).toBe(true);
    });

    it("does not self-update", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Faq value={[]} onChange={onChange} />);

      await user.click(trigger("First"));

      expect(onChange).toHaveBeenCalledExactlyOnceWith(["one"]);
      expect(isOpen("First")).toBe(false);
    });

    it("follows a value change", () => {
      const { rerender } = render(<Faq value={["one"]} />);
      rerender(<Faq value={["two"]} />);

      expect(isOpen("Second")).toBe(true);
      expect(isOpen("First")).toBe(false);
    });
  });

  describe("disabled items", () => {
    it("disables the trigger", () => {
      render(
        <Accordion>
          <AccordionItem value="one" title="First" disabled>
            First answer
          </AccordionItem>
        </Accordion>,
      );

      expect(trigger("First")).toBeDisabled();
    });

    it("does not open on click", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Accordion onChange={onChange}>
          <AccordionItem value="one" title="First" disabled>
            First answer
          </AccordionItem>
        </Accordion>,
      );

      await user.click(trigger("First"));

      expect(onChange).not.toHaveBeenCalled();
      expect(isOpen("First")).toBe(false);
    });
  });

  describe("panel content", () => {
    /*
     * The panel stays mounted so the open/close transition has something to
     * animate; `visibility: hidden` in the CSS is what removes a collapsed
     * panel's contents from the accessibility tree and tab order. jsdom
     * applies no stylesheet, so that part can't be asserted here — the
     * testable contract is `aria-expanded` and the open modifier, which is
     * also what drives the CSS.
     */
    it("keeps content mounted while collapsed", () => {
      render(<Faq />);

      expect(screen.getByText("First answer")).toBeInTheDocument();
    });

    it("marks each panel as a labelled region", () => {
      render(<Faq defaultValue={["one"]} />);

      expect(screen.getByRole("region", { name: "First" })).toBeInTheDocument();
    });
  });

  describe("misuse", () => {
    it("fails loudly outside an Accordion", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => render(<AccordionItem value="x" title="Orphan" />)).toThrow(
        "<AccordionItem> must be rendered inside <Accordion>.",
      );

      spy.mockRestore();
    });
  });

  describe("styling hooks", () => {
    it("merges a className onto the root", () => {
      const { container } = render(<Faq className="custom" />);

      expect(container.querySelector(".sh-accordion")).toHaveClass("custom");
    });

    it("merges a className onto an item", () => {
      const { container } = render(
        <Accordion>
          <AccordionItem value="one" title="First" className="custom">
            Body
          </AccordionItem>
        </Accordion>,
      );

      expect(container.querySelector(".sh-accordion__item")).toHaveClass("custom");
    });
  });
});
