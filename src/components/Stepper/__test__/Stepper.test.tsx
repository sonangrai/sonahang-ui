import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Step } from "../Step";
import { Stepper } from "../Stepper";
import type { StepperProps } from "../Stepper";

const Flow = (props: Partial<StepperProps>) => (
  <Stepper {...props}>
    <Step title="Account" description="Your details" />
    <Step title="Address" description="Where to ship" />
    <Step title="Payment" />
  </Stepper>
);

const stepItem = (container: HTMLElement, index: number) =>
  container.querySelectorAll(".sh-step")[index] as HTMLElement;

const connectors = (container: HTMLElement) => container.querySelectorAll(".sh-step__connector");

describe("Stepper", () => {
  describe("structure", () => {
    it("uses an ordered list, since the order is the meaning", () => {
      const { container } = render(<Flow />);

      expect(container.querySelector("ol")).toBeInTheDocument();
      expect(screen.getAllByRole("listitem")).toHaveLength(3);
    });

    it("names the list", () => {
      render(<Flow />);

      expect(screen.getByRole("list", { name: "Progress" })).toBeInTheDocument();
    });

    it("accepts a custom name", () => {
      render(<Flow aria-label="Checkout progress" />);

      expect(screen.getByRole("list", { name: "Checkout progress" })).toBeInTheDocument();
    });

    it("is not a navigation landmark", () => {
      // It's a progress indicator; steps are only navigation with an onClick.
      render(<Flow />);

      expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    });

    it("renders each title and description", () => {
      render(<Flow />);

      expect(screen.getByText("Account")).toBeInTheDocument();
      expect(screen.getByText("Your details")).toBeInTheDocument();
      expect(screen.getByText("Payment")).toBeInTheDocument();
    });

    it("renders no description element when none is given", () => {
      const { container } = render(
        <Stepper>
          <Step title="Only" />
        </Stepper>,
      );

      expect(container.querySelector(".sh-step__description")).not.toBeInTheDocument();
    });
  });

  describe("status from position", () => {
    it("treats the first step as current by default", () => {
      const { container } = render(<Flow />);

      expect(stepItem(container, 0)).toHaveClass("sh-step--current");
      expect(stepItem(container, 1)).toHaveClass("sh-step--upcoming");
    });

    it("marks earlier steps complete and later ones upcoming", () => {
      const { container } = render(<Flow activeStep={1} />);

      expect(stepItem(container, 0)).toHaveClass("sh-step--complete");
      expect(stepItem(container, 1)).toHaveClass("sh-step--current");
      expect(stepItem(container, 2)).toHaveClass("sh-step--upcoming");
    });

    it("marks every step complete past the end", () => {
      const { container } = render(<Flow activeStep={3} />);

      for (let index = 0; index < 3; index += 1) {
        expect(stepItem(container, index)).toHaveClass("sh-step--complete");
      }
    });

    it("announces only the current step", () => {
      const { container } = render(<Flow activeStep={1} />);

      const current = container.querySelectorAll('[aria-current="step"]');
      expect(current).toHaveLength(1);
      expect(current[0]).toHaveTextContent("Address");
    });

    it("lets a step override its status", () => {
      const { container } = render(
        <Stepper activeStep={2}>
          <Step title="Account" />
          <Step title="Address" status="error" />
          <Step title="Payment" />
        </Stepper>,
      );

      expect(stepItem(container, 1)).toHaveClass("sh-step--error");
      expect(stepItem(container, 1)).not.toHaveClass("sh-step--complete");
    });
  });

  describe("indicator", () => {
    it("numbers steps from one, not from the array index", () => {
      render(<Flow activeStep={0} />);

      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("replaces the number with a glyph once complete", () => {
      const { container } = render(<Flow activeStep={1} />);

      expect(stepItem(container, 0).querySelector(".sh-step__indicator svg")).toBeInTheDocument();
      expect(screen.queryByText("1")).not.toBeInTheDocument();
    });

    it("shows a glyph for an errored step", () => {
      const { container } = render(
        <Stepper>
          <Step title="Account" status="error" />
        </Stepper>,
      );

      expect(container.querySelector(".sh-step__indicator svg")).toBeInTheDocument();
    });

    it("hides the glyph from assistive tech", () => {
      // The status is conveyed by aria-current and the text, not the icon.
      const { container } = render(<Flow activeStep={1} />);

      expect(container.querySelector(".sh-step__indicator svg")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });

    it("accepts a custom icon", () => {
      render(
        <Stepper>
          <Step title="Account" icon={<svg data-testid="custom" />} />
        </Stepper>,
      );

      expect(screen.getByTestId("custom")).toBeInTheDocument();
    });
  });

  describe("connectors", () => {
    it("puts one between each pair of steps", () => {
      const { container } = render(<Flow />);

      expect(connectors(container)).toHaveLength(2);
    });

    it("renders none for a lone step", () => {
      const { container } = render(
        <Stepper>
          <Step title="Only" />
        </Stepper>,
      );

      expect(connectors(container)).toHaveLength(0);
    });

    it("hides them from assistive tech", () => {
      const { container } = render(<Flow />);

      for (const connector of connectors(container)) {
        expect(connector).toHaveAttribute("aria-hidden", "true");
      }
    });

    it("flags the last step so it drops its connector spacing", () => {
      const { container } = render(<Flow />);

      expect(stepItem(container, 2)).toHaveClass("sh-step--last");
      expect(stepItem(container, 0)).not.toHaveClass("sh-step--last");
    });
  });

  describe("interactive steps", () => {
    it("renders plain text when no onClick is given", () => {
      render(<Flow />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders a button when given an onClick", () => {
      render(
        <Stepper activeStep={1}>
          <Step title="Account" onClick={vi.fn()} />
          <Step title="Address" />
        </Stepper>,
      );

      expect(screen.getByRole("button", { name: /Account/ })).toBeInTheDocument();
    });

    it("calls onClick when activated", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Stepper activeStep={1}>
          <Step title="Account" onClick={onClick} />
          <Step title="Address" />
        </Stepper>,
      );

      await user.click(screen.getByRole("button", { name: /Account/ }));

      expect(onClick).toHaveBeenCalledOnce();
    });

    it("is type=button so it never submits a surrounding form", () => {
      render(
        <Stepper>
          <Step title="Account" onClick={vi.fn()} />
        </Stepper>,
      );

      expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });

    it("can be disabled", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Stepper>
          <Step title="Account" onClick={onClick} disabled />
        </Stepper>,
      );

      await user.click(screen.getByRole("button"));

      expect(screen.getByRole("button")).toBeDisabled();
      expect(onClick).not.toHaveBeenCalled();
    });

    it("still announces the current step on a button", () => {
      render(
        <Stepper activeStep={0}>
          <Step title="Account" onClick={vi.fn()} />
        </Stepper>,
      );

      expect(screen.getByRole("button")).toHaveAttribute("aria-current", "step");
    });
  });

  describe("orientation", () => {
    it("defaults to horizontal", () => {
      const { container } = render(<Flow />);

      expect(container.querySelector(".sh-stepper")).toHaveClass("sh-stepper--horizontal");
      expect(stepItem(container, 0)).toHaveClass("sh-step--horizontal");
    });

    it("applies vertical to the list and every step", () => {
      // Steps need it too: the two layouts position the connector differently.
      const { container } = render(<Flow orientation="vertical" />);

      expect(container.querySelector(".sh-stepper")).toHaveClass("sh-stepper--vertical");
      for (let index = 0; index < 3; index += 1) {
        expect(stepItem(container, index)).toHaveClass("sh-step--vertical");
      }
    });
  });

  describe("misuse", () => {
    it("fails loudly outside a Stepper", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => render(<Step title="Orphan" />)).toThrow(
        "<Step> must be rendered inside <Stepper>.",
      );

      spy.mockRestore();
    });
  });

  describe("styling hooks", () => {
    it("merges a className onto the list", () => {
      const { container } = render(<Flow className="custom" />);

      expect(container.querySelector(".sh-stepper")).toHaveClass("custom");
    });

    it("merges a className onto a step", () => {
      const { container } = render(
        <Stepper>
          <Step title="Account" className="custom" />
        </Stepper>,
      );

      expect(stepItem(container, 0)).toHaveClass("custom");
    });
  });
});
