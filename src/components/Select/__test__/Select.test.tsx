import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Select } from "../Select";

const FRUIT = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

describe("Select", () => {
  describe("label association", () => {
    it("links the label to the select", () => {
      render(<Select label="Fruit" options={FRUIT} />);

      expect(screen.getByLabelText("Fruit")).toBeInstanceOf(HTMLSelectElement);
    });

    it("generates a unique id per instance", () => {
      render(
        <>
          <Select label="First" options={FRUIT} />
          <Select label="Second" options={FRUIT} />
        </>,
      );

      expect(screen.getByLabelText("First").id).not.toBe(screen.getByLabelText("Second").id);
    });

    it("uses a caller-supplied id", () => {
      render(<Select label="Fruit" id="fruit" options={FRUIT} />);

      expect(screen.getByLabelText("Fruit")).toHaveAttribute("id", "fruit");
    });

    it("renders no label element when none is given", () => {
      const { container } = render(<Select aria-label="Fruit" options={FRUIT} />);

      expect(container.querySelector("label")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Fruit")).toBeInTheDocument();
    });
  });

  describe("options", () => {
    it("renders one option per entry", () => {
      render(<Select label="Fruit" options={FRUIT} />);

      expect(screen.getAllByRole("option")).toHaveLength(3);
      expect(screen.getByRole("option", { name: "Banana" })).toHaveValue("banana");
    });

    it("disables an individual option", () => {
      render(
        <Select
          label="Fruit"
          options={[...FRUIT, { value: "durian", label: "Durian", disabled: true }]}
        />,
      );

      expect(screen.getByRole("option", { name: "Durian" })).toBeDisabled();
      expect(screen.getByRole("option", { name: "Apple" })).toBeEnabled();
    });

    it("renders grouped options", () => {
      const { container } = render(
        <Select
          label="Food"
          options={[
            { label: "Fruit", options: FRUIT },
            { label: "Veg", options: [{ value: "leek", label: "Leek" }] },
          ]}
        />,
      );

      const groups = container.querySelectorAll("optgroup");
      expect(groups).toHaveLength(2);
      expect(groups[0]).toHaveAttribute("label", "Fruit");
      expect(screen.getByRole("option", { name: "Leek" })).toBeInTheDocument();
    });

    it("renders children when no options are given", () => {
      render(
        <Select label="Fruit">
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
        </Select>,
      );

      expect(screen.getAllByRole("option")).toHaveLength(2);
    });

    it("prefers options over children", () => {
      render(
        <Select label="Fruit" options={FRUIT}>
          <option value="ignored">Ignored</option>
        </Select>,
      );

      expect(screen.queryByRole("option", { name: "Ignored" })).not.toBeInTheDocument();
      expect(screen.getAllByRole("option")).toHaveLength(3);
    });
  });

  describe("placeholder", () => {
    it("renders none by default", () => {
      render(<Select label="Fruit" options={FRUIT} />);

      expect(screen.getAllByRole("option")).toHaveLength(3);
    });

    it("renders first when given", () => {
      render(<Select label="Fruit" placeholder="Choose a fruit" options={FRUIT} />);

      expect(screen.getAllByRole("option")[0]).toHaveTextContent("Choose a fruit");
    });

    it("cannot be re-selected once a real option is chosen", () => {
      // Disabled, so it acts as a prompt rather than a valid value.
      render(<Select label="Fruit" placeholder="Choose a fruit" options={FRUIT} />);

      expect(screen.getByRole("option", { name: "Choose a fruit" })).toBeDisabled();
    });

    it("shows as the current value when nothing is chosen", () => {
      render(
        <Select label="Fruit" placeholder="Choose a fruit" options={FRUIT} defaultValue="" />,
      );

      expect(screen.getByLabelText("Fruit")).toHaveValue("");
    });
  });

  describe("behaviour", () => {
    it("selects an option", async () => {
      const user = userEvent.setup();
      render(<Select label="Fruit" options={FRUIT} defaultValue="apple" />);

      await user.selectOptions(screen.getByLabelText("Fruit"), "cherry");

      expect(screen.getByLabelText("Fruit")).toHaveValue("cherry");
    });

    it("fires onChange with the new value", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Select label="Fruit" options={FRUIT} defaultValue="apple" onChange={onChange} />);

      await user.selectOptions(screen.getByLabelText("Fruit"), "banana");

      expect(onChange).toHaveBeenCalledOnce();
      expect(onChange.mock.calls[0][0].target.value).toBe("banana");
    });

    it("reflects a controlled value", () => {
      const { rerender } = render(
        <Select label="Fruit" options={FRUIT} value="apple" onChange={vi.fn()} />,
      );
      expect(screen.getByLabelText("Fruit")).toHaveValue("apple");

      rerender(<Select label="Fruit" options={FRUIT} value="cherry" onChange={vi.fn()} />);

      expect(screen.getByLabelText("Fruit")).toHaveValue("cherry");
    });

    it("forwards arbitrary select attributes", () => {
      render(<Select label="Fruit" options={FRUIT} name="fruit" required />);

      const select = screen.getByLabelText(/Fruit/);
      expect(select).toHaveAttribute("name", "fruit");
      expect(select).toBeRequired();
    });

    it("can be disabled", () => {
      render(<Select label="Fruit" options={FRUIT} disabled />);

      expect(screen.getByLabelText("Fruit")).toBeDisabled();
    });
  });

  describe("required indicator", () => {
    it("shows a decorative asterisk", () => {
      const { container } = render(<Select label="Fruit" options={FRUIT} required />);

      // The `required` attribute is what's announced; the star is visual only.
      expect(container.querySelector(".sh-select__required")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });
  });

  describe("helper text and errors", () => {
    it("links helper text to the select", () => {
      render(<Select label="Fruit" options={FRUIT} helperText="Pick your favourite." />);

      expect(screen.getByLabelText("Fruit")).toHaveAccessibleDescription(
        "Pick your favourite.",
      );
    });

    it("shows the error and marks the select invalid", () => {
      render(<Select label="Fruit" options={FRUIT} error="Choose a fruit." />);

      const select = screen.getByLabelText("Fruit");
      expect(select).toHaveAttribute("aria-invalid", "true");
      expect(select).toHaveAccessibleDescription("Choose a fruit.");
    });

    it("replaces helper text with the error when both are given", () => {
      render(
        <Select label="Fruit" options={FRUIT} helperText="Pick one." error="Required." />,
      );

      expect(screen.getByText("Required.")).toBeInTheDocument();
      expect(screen.queryByText("Pick one.")).not.toBeInTheDocument();
    });

    it("is not marked invalid without an error", () => {
      render(<Select label="Fruit" options={FRUIT} helperText="Pick one." />);

      expect(screen.getByLabelText("Fruit")).not.toHaveAttribute("aria-invalid");
    });

    it("keeps a caller-supplied aria-describedby alongside its own", () => {
      render(
        <>
          <span id="external">External hint.</span>
          <Select
            label="Fruit"
            options={FRUIT}
            helperText="Own hint."
            aria-describedby="external"
          />
        </>,
      );

      expect(screen.getByLabelText("Fruit")).toHaveAccessibleDescription(
        "External hint. Own hint.",
      );
    });
  });

  describe("chevron and icon", () => {
    it("renders a chevron", () => {
      const { container } = render(<Select label="Fruit" options={FRUIT} />);

      expect(container.querySelector(".sh-select__chevron")).toBeInTheDocument();
    });

    it("hides the chevron from assistive tech", () => {
      const { container } = render(<Select label="Fruit" options={FRUIT} />);

      expect(container.querySelector(".sh-select__chevron")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });

    it("drops the chevron for a multiple select", () => {
      // That renders as a list box, so a dropdown arrow would be a lie.
      const { container } = render(<Select label="Fruit" options={FRUIT} multiple />);

      expect(container.querySelector(".sh-select__chevron")).not.toBeInTheDocument();
      expect(container.querySelector(".sh-select")).toHaveClass("sh-select--multiple");
    });

    it("renders no icon by default", () => {
      const { container } = render(<Select label="Fruit" options={FRUIT} />);

      expect(container.querySelector(".sh-select__icon")).not.toBeInTheDocument();
      expect(container.querySelector(".sh-select")).not.toHaveClass("sh-select--with-icon");
    });

    it("renders a leading icon and flags the padding", () => {
      const { container } = render(
        <Select label="Fruit" options={FRUIT} icon={<svg data-testid="icon" />} />,
      );

      expect(screen.getByTestId("icon")).toBeInTheDocument();
      // Drives the padding that keeps the value clear of the icon.
      expect(container.querySelector(".sh-select")).toHaveClass("sh-select--with-icon");
    });
  });

  describe("styling hooks", () => {
    it("puts className on the wrapper and selectClassName on the control", () => {
      const { container } = render(
        <Select label="Fruit" options={FRUIT} className="wrap" selectClassName="ctrl" />,
      );

      expect(container.querySelector(".sh-select")).toHaveClass("wrap");
      expect(screen.getByLabelText("Fruit")).toHaveClass("sh-select__control", "ctrl");
      expect(screen.getByLabelText("Fruit")).not.toHaveClass("wrap");
    });

    it("flags the invalid state on the wrapper", () => {
      const { container } = render(<Select label="Fruit" options={FRUIT} error="Nope." />);

      expect(container.querySelector(".sh-select")).toHaveClass("sh-select--invalid");
    });
  });
});
