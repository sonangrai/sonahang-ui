import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Radio } from "../Radio";
import { RadioGroup } from "../RadioGroup";

describe("Radio", () => {
  describe("standalone", () => {
    it("renders a radio labelled by its label prop", () => {
      render(<Radio name="plan" value="free" label="Free" />);

      expect(screen.getByRole("radio", { name: "Free" })).toBeInTheDocument();
    });

    it("wraps the input so clicking the label selects it", async () => {
      const user = userEvent.setup();
      render(<Radio name="plan" value="free" label="Free" />);

      await user.click(screen.getByText("Free"));

      expect(screen.getByRole("radio", { name: "Free" })).toBeChecked();
    });

    it("passes through name and value", () => {
      render(<Radio name="plan" value="free" label="Free" />);

      const radio = screen.getByRole("radio", { name: "Free" });
      expect(radio).toHaveAttribute("name", "plan");
      expect(radio).toHaveAttribute("value", "free");
    });

    it("fires its own onChange", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Radio name="plan" value="free" label="Free" onChange={onChange} />);

      await user.click(screen.getByRole("radio", { name: "Free" }));

      expect(onChange).toHaveBeenCalledOnce();
    });

    it("can be disabled on its own", () => {
      render(<Radio name="plan" value="free" label="Free" disabled />);

      expect(screen.getByRole("radio", { name: "Free" })).toBeDisabled();
    });

    it("renders without a label", () => {
      render(<Radio name="plan" value="free" aria-label="Free" />);

      expect(screen.getByRole("radio", { name: "Free" })).toBeInTheDocument();
    });
  });

  describe("inside a group", () => {
    const Plans = (props: Record<string, unknown>) => (
      <RadioGroup label="Plan" {...props}>
        <Radio value="free" label="Free" />
        <Radio value="pro" label="Pro" />
        <Radio value="team" label="Team" />
      </RadioGroup>
    );

    it("exposes a radiogroup", () => {
      render(<Plans />);

      expect(screen.getByRole("radiogroup", { name: "Plan" })).toBeInTheDocument();
    });

    it("falls back to aria-label with no visible label", () => {
      render(
        <RadioGroup aria-label="Plan">
          <Radio value="free" label="Free" />
        </RadioGroup>,
      );

      expect(screen.getByRole("radiogroup", { name: "Plan" })).toBeInTheDocument();
    });

    it("gives every option the same native name", () => {
      // This is what makes the browser enforce single selection and arrow keys.
      render(<Plans />);

      const names = screen.getAllByRole("radio").map((r) => r.getAttribute("name"));

      expect(new Set(names).size).toBe(1);
      expect(names[0]).toBeTruthy();
    });

    it("keeps separate groups in separate native groups", () => {
      render(
        <>
          <RadioGroup label="One">
            <Radio value="a" label="A" />
          </RadioGroup>
          <RadioGroup label="Two">
            <Radio value="a" label="A2" />
          </RadioGroup>
        </>,
      );

      const names = screen.getAllByRole("radio").map((r) => r.getAttribute("name"));

      expect(new Set(names).size).toBe(2);
    });

    it("uses a caller-supplied group name", () => {
      render(<Plans name="plan-picker" />);

      for (const radio of screen.getAllByRole("radio")) {
        expect(radio).toHaveAttribute("name", "plan-picker");
      }
    });

    it("honours defaultValue when uncontrolled", () => {
      render(<Plans defaultValue="pro" />);

      expect(screen.getByRole("radio", { name: "Pro" })).toBeChecked();
      expect(screen.getByRole("radio", { name: "Free" })).not.toBeChecked();
    });

    it("moves selection on click when uncontrolled", async () => {
      const user = userEvent.setup();
      render(<Plans defaultValue="free" />);

      await user.click(screen.getByRole("radio", { name: "Team" }));

      expect(screen.getByRole("radio", { name: "Team" })).toBeChecked();
      expect(screen.getByRole("radio", { name: "Free" })).not.toBeChecked();
    });

    it("reports the selected value to onChange", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Plans onChange={onChange} />);

      await user.click(screen.getByRole("radio", { name: "Pro" }));

      expect(onChange).toHaveBeenCalledExactlyOnceWith("pro");
    });

    it("reflects a controlled value", () => {
      render(<Plans value="team" />);

      expect(screen.getByRole("radio", { name: "Team" })).toBeChecked();
    });

    it("does not self-update when controlled", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Plans value="free" onChange={onChange} />);

      await user.click(screen.getByRole("radio", { name: "Pro" }));

      expect(onChange).toHaveBeenCalledExactlyOnceWith("pro");
      expect(screen.getByRole("radio", { name: "Free" })).toBeChecked();
      expect(screen.getByRole("radio", { name: "Pro" })).not.toBeChecked();
    });

    it("follows a controlled value change", () => {
      const { rerender } = render(<Plans value="free" />);
      expect(screen.getByRole("radio", { name: "Free" })).toBeChecked();

      rerender(<Plans value="team" />);

      expect(screen.getByRole("radio", { name: "Team" })).toBeChecked();
      expect(screen.getByRole("radio", { name: "Free" })).not.toBeChecked();
    });

    it("selects nothing by default", () => {
      render(<Plans />);

      for (const radio of screen.getAllByRole("radio")) {
        expect(radio).not.toBeChecked();
      }
    });
  });

  describe("disabled propagation", () => {
    it("disables every option when the group is disabled", () => {
      render(
        <RadioGroup label="Plan" disabled>
          <Radio value="free" label="Free" />
          <Radio value="pro" label="Pro" />
        </RadioGroup>,
      );

      for (const radio of screen.getAllByRole("radio")) {
        expect(radio).toBeDisabled();
      }
    });

    it("disables a single option inside an enabled group", () => {
      render(
        <RadioGroup label="Plan">
          <Radio value="free" label="Free" />
          <Radio value="pro" label="Pro" disabled />
        </RadioGroup>,
      );

      expect(screen.getByRole("radio", { name: "Pro" })).toBeDisabled();
      expect(screen.getByRole("radio", { name: "Free" })).toBeEnabled();
    });

    it("lets an option opt out of a disabled group", () => {
      render(
        <RadioGroup label="Plan" disabled>
          <Radio value="free" label="Free" disabled={false} />
        </RadioGroup>,
      );

      expect(screen.getByRole("radio", { name: "Free" })).toBeEnabled();
    });
  });

  describe("group messaging", () => {
    it("links helper text to the group", () => {
      render(
        <RadioGroup label="Plan" helperText="Change this any time.">
          <Radio value="free" label="Free" />
        </RadioGroup>,
      );

      expect(screen.getByRole("radiogroup")).toHaveAccessibleDescription("Change this any time.");
    });

    it("shows the error and marks the group invalid", () => {
      render(
        <RadioGroup label="Plan" error="Choose a plan.">
          <Radio value="free" label="Free" />
        </RadioGroup>,
      );

      const group = screen.getByRole("radiogroup");
      expect(group).toHaveAttribute("aria-invalid", "true");
      expect(group).toHaveAccessibleDescription("Choose a plan.");
    });

    it("replaces helper text with the error when both are given", () => {
      render(
        <RadioGroup label="Plan" helperText="Change any time." error="Choose a plan.">
          <Radio value="free" label="Free" />
        </RadioGroup>,
      );

      expect(screen.getByText("Choose a plan.")).toBeInTheDocument();
      expect(screen.queryByText("Change any time.")).not.toBeInTheDocument();
    });

    it("is not marked invalid without an error", () => {
      render(
        <RadioGroup label="Plan" helperText="Change any time.">
          <Radio value="free" label="Free" />
        </RadioGroup>,
      );

      expect(screen.getByRole("radiogroup")).not.toHaveAttribute("aria-invalid");
    });
  });

  describe("styling hooks", () => {
    it("applies the orientation class", () => {
      const { container } = render(
        <RadioGroup label="Plan" orientation="horizontal">
          <Radio value="free" label="Free" />
        </RadioGroup>,
      );

      expect(container.querySelector(".sh-radio-group__options")).toHaveClass(
        "sh-radio-group__options--horizontal",
      );
    });

    it("defaults to vertical", () => {
      const { container } = render(
        <RadioGroup label="Plan">
          <Radio value="free" label="Free" />
        </RadioGroup>,
      );

      expect(container.querySelector(".sh-radio-group__options")).toHaveClass(
        "sh-radio-group__options--vertical",
      );
    });

    it("puts className on the label wrapper and inputClassName on the input", () => {
      const { container } = render(
        <Radio name="plan" value="free" label="Free" className="wrap" inputClassName="ctrl" />,
      );

      expect(container.querySelector(".sh-radio")).toHaveClass("wrap");
      expect(screen.getByRole("radio", { name: "Free" })).toHaveClass("sh-radio__input", "ctrl");
    });
  });
});
