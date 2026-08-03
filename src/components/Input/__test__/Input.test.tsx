import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Input } from "../Input";

describe("Input", () => {
  describe("label association", () => {
    it("links the label to the input", () => {
      render(<Input label="Email" />);

      // Only resolves if htmlFor/id are wired up correctly.
      expect(screen.getByLabelText("Email")).toBeInstanceOf(HTMLInputElement);
    });

    it("generates a unique id per instance", () => {
      render(
        <>
          <Input label="First" />
          <Input label="Second" />
        </>,
      );

      const first = screen.getByLabelText("First");
      const second = screen.getByLabelText("Second");

      expect(first.id).toBeTruthy();
      expect(second.id).toBeTruthy();
      expect(first.id).not.toBe(second.id);
    });

    it("uses a caller-supplied id", () => {
      render(<Input label="Email" id="my-email" />);

      expect(screen.getByLabelText("Email")).toHaveAttribute("id", "my-email");
    });

    it("renders no label element when none is given", () => {
      const { container } = render(<Input aria-label="Email" />);

      expect(container.querySelector("label")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });
  });

  describe("helper text and errors", () => {
    it("shows helper text and links it to the input", () => {
      render(<Input label="Email" helperText="We won't share it." />);

      expect(screen.getByLabelText("Email")).toHaveAccessibleDescription("We won't share it.");
    });

    it("shows the error and marks the input invalid", () => {
      render(<Input label="Email" error="Invalid address." />);

      const input = screen.getByLabelText("Email");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAccessibleDescription("Invalid address.");
    });

    it("replaces helper text with the error when both are given", () => {
      render(<Input label="Email" helperText="We won't share it." error="Invalid address." />);

      expect(screen.getByText("Invalid address.")).toBeInTheDocument();
      expect(screen.queryByText("We won't share it.")).not.toBeInTheDocument();
    });

    it("is not marked invalid without an error", () => {
      render(<Input label="Email" helperText="We won't share it." />);

      expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid");
    });

    it("keeps a caller-supplied aria-describedby alongside its own", () => {
      render(
        <>
          <span id="external">External hint.</span>
          <Input label="Email" helperText="Own hint." aria-describedby="external" />
        </>,
      );

      expect(screen.getByLabelText("Email")).toHaveAccessibleDescription("External hint. Own hint.");
    });
  });

  describe("states", () => {
    it("marks the input required and shows an indicator", () => {
      const { container } = render(<Input label="Email" required />);

      expect(screen.getByLabelText(/Email/)).toBeRequired();
      // Decorative — the `required` attribute is what's announced.
      expect(container.querySelector(".sh-input__required")).toHaveAttribute("aria-hidden", "true");
    });

    it("disables the input", () => {
      render(<Input label="Email" disabled />);

      expect(screen.getByLabelText("Email")).toBeDisabled();
    });
  });

  describe("behaviour", () => {
    it("accepts typed input and fires onChange", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Input label="Email" onChange={onChange} />);

      await user.type(screen.getByLabelText("Email"), "ada");

      expect(screen.getByLabelText("Email")).toHaveValue("ada");
      expect(onChange).toHaveBeenCalledTimes(3);
    });

    it("forwards arbitrary input attributes", () => {
      render(<Input label="Email" type="email" placeholder="ada@example.com" name="email" />);

      const input = screen.getByLabelText("Email");
      expect(input).toHaveAttribute("type", "email");
      expect(input).toHaveAttribute("placeholder", "ada@example.com");
      expect(input).toHaveAttribute("name", "email");
    });
  });

  describe("icon", () => {
    const SearchIcon = () => <svg data-testid="search-icon" viewBox="0 0 16 16" />;

    it("renders no icon element when none is given", () => {
      const { container } = render(<Input label="Email" />);

      expect(container.querySelector(".sh-input__icon")).not.toBeInTheDocument();
      expect(container.querySelector(".sh-input")).not.toHaveClass(
        "sh-input--with-icon-left",
        "sh-input--with-icon-right",
      );
    });

    it("renders the icon on the left by default", () => {
      const { container } = render(<Input label="Search" icon={<SearchIcon />} />);

      expect(screen.getByTestId("search-icon")).toBeInTheDocument();
      // Drives the padding that keeps text clear of the icon.
      expect(container.querySelector(".sh-input")).toHaveClass("sh-input--with-icon-left");
    });

    it("renders the icon on the right when asked", () => {
      const { container } = render(
        <Input label="Search" icon={<SearchIcon />} iconPosition="right" />,
      );

      expect(container.querySelector(".sh-input")).toHaveClass("sh-input--with-icon-right");
      expect(container.querySelector(".sh-input")).not.toHaveClass("sh-input--with-icon-left");
    });

    it("hides the icon from assistive tech", () => {
      const { container } = render(<Input label="Search" icon={<SearchIcon />} />);

      expect(container.querySelector(".sh-input__icon")).toHaveAttribute("aria-hidden", "true");
    });

    it("leaves the label association intact", () => {
      render(<Input label="Search" icon={<SearchIcon />} />);

      expect(screen.getByLabelText("Search")).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe("styling hooks", () => {
    it("puts className on the wrapper and inputClassName on the input", () => {
      const { container } = render(
        <Input label="Email" className="wrapper-cls" inputClassName="input-cls" />,
      );

      expect(container.querySelector(".sh-input")).toHaveClass("wrapper-cls");
      expect(screen.getByLabelText("Email")).toHaveClass("sh-input__control", "input-cls");
      expect(screen.getByLabelText("Email")).not.toHaveClass("wrapper-cls");
    });

    it("flags the invalid state on the wrapper", () => {
      const { container } = render(<Input label="Email" error="Nope." />);

      expect(container.querySelector(".sh-input")).toHaveClass("sh-input--invalid");
    });
  });
});
