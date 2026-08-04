import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Checkbox } from "../Checkbox";
import { CheckboxGroup } from "../CheckboxGroup";

const TOPPINGS = ["Cheese", "Mushroom", "Olive"];

const Toppings = (props: Record<string, unknown>) => (
  <CheckboxGroup label="Toppings" {...props}>
    {TOPPINGS.map((topping) => (
      <Checkbox key={topping} value={topping} label={topping} />
    ))}
  </CheckboxGroup>
);

describe("Checkbox", () => {
  describe("standalone", () => {
    it("renders a checkbox labelled by its label prop", () => {
      render(<Checkbox value="terms" label="Accept terms" />);

      expect(screen.getByRole("checkbox", { name: "Accept terms" })).toBeInTheDocument();
    });

    it("wraps the input so clicking the label toggles it", async () => {
      const user = userEvent.setup();
      render(<Checkbox value="terms" label="Accept terms" />);

      await user.click(screen.getByText("Accept terms"));

      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("toggles off again", async () => {
      const user = userEvent.setup();
      render(<Checkbox value="terms" label="Accept terms" defaultChecked />);

      await user.click(screen.getByRole("checkbox"));

      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("passes through name and value", () => {
      render(<Checkbox name="agreement" value="terms" label="Accept terms" />);

      const box = screen.getByRole("checkbox");
      expect(box).toHaveAttribute("name", "agreement");
      expect(box).toHaveAttribute("value", "terms");
    });

    it("fires its own onChange", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Checkbox value="terms" label="Accept terms" onChange={onChange} />);

      await user.click(screen.getByRole("checkbox"));

      expect(onChange).toHaveBeenCalledOnce();
    });

    it("can be disabled on its own", () => {
      render(<Checkbox value="terms" label="Accept terms" disabled />);

      expect(screen.getByRole("checkbox")).toBeDisabled();
    });
  });

  describe("indeterminate", () => {
    it("sets the DOM property, which has no HTML attribute", () => {
      render(<Checkbox value="all" label="Select all" indeterminate />);

      expect((screen.getByRole("checkbox") as HTMLInputElement).indeterminate).toBe(true);
    });

    it("is not indeterminate by default", () => {
      render(<Checkbox value="all" label="Select all" />);

      expect((screen.getByRole("checkbox") as HTMLInputElement).indeterminate).toBe(false);
    });

    it("clears when the prop goes false", () => {
      const { rerender } = render(<Checkbox value="all" label="Select all" indeterminate />);
      expect((screen.getByRole("checkbox") as HTMLInputElement).indeterminate).toBe(true);

      rerender(<Checkbox value="all" label="Select all" indeterminate={false} />);

      expect((screen.getByRole("checkbox") as HTMLInputElement).indeterminate).toBe(false);
    });

    it("is announced as mixed", () => {
      render(<Checkbox value="all" label="Select all" indeterminate />);

      expect(screen.getByRole("checkbox")).toBePartiallyChecked();
    });
  });

  describe("ref", () => {
    it("still forwards a caller ref while using its own internally", () => {
      // The internal ref drives `indeterminate`; a caller ref must survive it.
      const ref = createRef<HTMLInputElement>();
      render(<Checkbox value="all" label="Select all" indeterminate ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.indeterminate).toBe(true);
    });
  });

  describe("inside a group", () => {
    it("exposes a group with an accessible name", () => {
      render(<Toppings />);

      expect(screen.getByRole("group", { name: "Toppings" })).toBeInTheDocument();
    });

    it("falls back to aria-label with no visible label", () => {
      render(
        <CheckboxGroup aria-label="Toppings">
          <Checkbox value="Cheese" label="Cheese" />
        </CheckboxGroup>,
      );

      expect(screen.getByRole("group", { name: "Toppings" })).toBeInTheDocument();
    });

    it("gives every option the same field name", () => {
      render(<Toppings />);

      const names = screen.getAllByRole("checkbox").map((b) => b.getAttribute("name"));

      expect(new Set(names).size).toBe(1);
      expect(names[0]).toBeTruthy();
    });

    it("keeps separate groups in separate fields", () => {
      render(
        <>
          <CheckboxGroup label="One">
            <Checkbox value="a" label="A" />
          </CheckboxGroup>
          <CheckboxGroup label="Two">
            <Checkbox value="a" label="A2" />
          </CheckboxGroup>
        </>,
      );

      const names = screen.getAllByRole("checkbox").map((b) => b.getAttribute("name"));

      expect(new Set(names).size).toBe(2);
    });

    it("uses a caller-supplied group name", () => {
      render(<Toppings name="toppings" />);

      for (const box of screen.getAllByRole("checkbox")) {
        expect(box).toHaveAttribute("name", "toppings");
      }
    });

    it("honours defaultValue when uncontrolled", () => {
      render(<Toppings defaultValue={["Mushroom"]} />);

      expect(screen.getByRole("checkbox", { name: "Mushroom" })).toBeChecked();
      expect(screen.getByRole("checkbox", { name: "Cheese" })).not.toBeChecked();
    });

    it("selects nothing by default", () => {
      render(<Toppings />);

      for (const box of screen.getAllByRole("checkbox")) {
        expect(box).not.toBeChecked();
      }
    });

    it("allows more than one selection at a time", async () => {
      // The key difference from RadioGroup.
      const user = userEvent.setup();
      render(<Toppings />);

      await user.click(screen.getByRole("checkbox", { name: "Cheese" }));
      await user.click(screen.getByRole("checkbox", { name: "Olive" }));

      expect(screen.getByRole("checkbox", { name: "Cheese" })).toBeChecked();
      expect(screen.getByRole("checkbox", { name: "Olive" })).toBeChecked();
    });

    it("reports the whole selection, not a delta", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Toppings defaultValue={["Cheese"]} onChange={onChange} />);

      await user.click(screen.getByRole("checkbox", { name: "Olive" }));

      expect(onChange).toHaveBeenCalledExactlyOnceWith(["Cheese", "Olive"]);
    });

    it("removes a value when unchecked", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Toppings defaultValue={["Cheese", "Olive"]} onChange={onChange} />);

      await user.click(screen.getByRole("checkbox", { name: "Cheese" }));

      expect(onChange).toHaveBeenCalledExactlyOnceWith(["Olive"]);
      expect(screen.getByRole("checkbox", { name: "Cheese" })).not.toBeChecked();
    });

    it("reflects a controlled value", () => {
      render(<Toppings value={["Olive"]} />);

      expect(screen.getByRole("checkbox", { name: "Olive" })).toBeChecked();
    });

    it("does not self-update when controlled", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Toppings value={[]} onChange={onChange} />);

      await user.click(screen.getByRole("checkbox", { name: "Cheese" }));

      expect(onChange).toHaveBeenCalledExactlyOnceWith(["Cheese"]);
      expect(screen.getByRole("checkbox", { name: "Cheese" })).not.toBeChecked();
    });

    it("follows a controlled value change", () => {
      const { rerender } = render(<Toppings value={["Cheese"]} />);
      expect(screen.getByRole("checkbox", { name: "Cheese" })).toBeChecked();

      rerender(<Toppings value={["Olive"]} />);

      expect(screen.getByRole("checkbox", { name: "Olive" })).toBeChecked();
      expect(screen.getByRole("checkbox", { name: "Cheese" })).not.toBeChecked();
    });
  });

  describe("disabled propagation", () => {
    it("disables every option when the group is disabled", () => {
      render(<Toppings disabled />);

      for (const box of screen.getAllByRole("checkbox")) {
        expect(box).toBeDisabled();
      }
    });

    it("disables a single option inside an enabled group", () => {
      render(
        <CheckboxGroup label="Toppings">
          <Checkbox value="Cheese" label="Cheese" />
          <Checkbox value="Olive" label="Olive" disabled />
        </CheckboxGroup>,
      );

      expect(screen.getByRole("checkbox", { name: "Olive" })).toBeDisabled();
      expect(screen.getByRole("checkbox", { name: "Cheese" })).toBeEnabled();
    });

    it("lets an option opt out of a disabled group", () => {
      render(
        <CheckboxGroup label="Toppings" disabled>
          <Checkbox value="Cheese" label="Cheese" disabled={false} />
        </CheckboxGroup>,
      );

      expect(screen.getByRole("checkbox", { name: "Cheese" })).toBeEnabled();
    });
  });

  describe("group messaging", () => {
    it("links helper text to the group", () => {
      render(<Toppings helperText="Pick as many as you like." />);

      expect(screen.getByRole("group")).toHaveAccessibleDescription(
        "Pick as many as you like.",
      );
    });

    it("shows the error and marks the group invalid", () => {
      render(<Toppings error="Choose at least one." />);

      const group = screen.getByRole("group");
      expect(group).toHaveAttribute("aria-invalid", "true");
      expect(group).toHaveAccessibleDescription("Choose at least one.");
    });

    it("replaces helper text with the error when both are given", () => {
      render(<Toppings helperText="Pick any." error="Choose at least one." />);

      expect(screen.getByText("Choose at least one.")).toBeInTheDocument();
      expect(screen.queryByText("Pick any.")).not.toBeInTheDocument();
    });

    it("is not marked invalid without an error", () => {
      render(<Toppings helperText="Pick any." />);

      expect(screen.getByRole("group")).not.toHaveAttribute("aria-invalid");
    });
  });

  describe("styling hooks", () => {
    it("applies the orientation class", () => {
      const { container } = render(<Toppings orientation="horizontal" />);

      expect(container.querySelector(".sh-checkbox-group__options")).toHaveClass(
        "sh-checkbox-group__options--horizontal",
      );
    });

    it("defaults to vertical", () => {
      const { container } = render(<Toppings />);

      expect(container.querySelector(".sh-checkbox-group__options")).toHaveClass(
        "sh-checkbox-group__options--vertical",
      );
    });

    it("puts className on the label wrapper and inputClassName on the input", () => {
      const { container } = render(
        <Checkbox value="terms" label="Terms" className="wrap" inputClassName="ctrl" />,
      );

      expect(container.querySelector(".sh-checkbox")).toHaveClass("wrap");
      expect(screen.getByRole("checkbox")).toHaveClass("sh-checkbox__input", "ctrl");
    });
  });
});
