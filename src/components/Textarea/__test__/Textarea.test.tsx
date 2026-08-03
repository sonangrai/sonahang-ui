import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Textarea } from "../Textarea";

describe("Textarea", () => {
  describe("label association", () => {
    it("links the label to the textarea", () => {
      render(<Textarea label="Description" />);

      // Only resolves if htmlFor/id are wired up correctly.
      expect(screen.getByLabelText("Description")).toBeInstanceOf(HTMLTextAreaElement);
    });

    it("generates a unique id per instance", () => {
      render(
        <>
          <Textarea label="First" />
          <Textarea label="Second" />
        </>,
      );

      const first = screen.getByLabelText("First");
      const second = screen.getByLabelText("Second");

      expect(first.id).toBeTruthy();
      expect(second.id).toBeTruthy();
      expect(first.id).not.toBe(second.id);
    });

    it("uses a caller-supplied id", () => {
      render(<Textarea label="Description" id="my-description" />);

      expect(screen.getByLabelText("Description")).toHaveAttribute("id", "my-description");
    });

    it("renders no label element when none is given", () => {
      const { container } = render(<Textarea aria-label="Description" />);

      expect(container.querySelector("label")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Description")).toBeInTheDocument();
    });
  });

  describe("helper text and errors", () => {
    it("shows helper text and links it to the textarea", () => {
      render(<Textarea label="Description" helperText="Markdown is supported." />);

      expect(screen.getByLabelText("Description")).toHaveAccessibleDescription(
        "Markdown is supported.",
      );
    });

    it("shows the error and marks the textarea invalid", () => {
      render(<Textarea label="Description" error="Required." />);

      const control = screen.getByLabelText("Description");
      expect(control).toHaveAttribute("aria-invalid", "true");
      expect(control).toHaveAccessibleDescription("Required.");
    });

    it("replaces helper text with the error when both are given", () => {
      render(<Textarea label="Description" helperText="Markdown works." error="Required." />);

      expect(screen.getByText("Required.")).toBeInTheDocument();
      expect(screen.queryByText("Markdown works.")).not.toBeInTheDocument();
    });

    it("is not marked invalid without an error", () => {
      render(<Textarea label="Description" helperText="Markdown works." />);

      expect(screen.getByLabelText("Description")).not.toHaveAttribute("aria-invalid");
    });

    it("keeps a caller-supplied aria-describedby alongside its own", () => {
      render(
        <>
          <span id="external">External hint.</span>
          <Textarea label="Description" helperText="Own hint." aria-describedby="external" />
        </>,
      );

      expect(screen.getByLabelText("Description")).toHaveAccessibleDescription(
        "External hint. Own hint.",
      );
    });
  });

  describe("states", () => {
    it("marks the textarea required and shows an indicator", () => {
      const { container } = render(<Textarea label="Description" required />);

      expect(screen.getByLabelText(/Description/)).toBeRequired();
      // Decorative — the `required` attribute is what's announced.
      expect(container.querySelector(".sh-textarea__required")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });

    it("disables the textarea", () => {
      render(<Textarea label="Description" disabled />);

      expect(screen.getByLabelText("Description")).toBeDisabled();
    });
  });

  describe("sizing and resize", () => {
    it("defaults to three rows", () => {
      render(<Textarea label="Description" />);

      expect(screen.getByLabelText("Description")).toHaveAttribute("rows", "3");
    });

    it("honours a caller-supplied rows", () => {
      render(<Textarea label="Description" rows={8} />);

      expect(screen.getByLabelText("Description")).toHaveAttribute("rows", "8");
    });

    it("defaults to vertical resize", () => {
      render(<Textarea label="Description" />);

      expect(screen.getByLabelText("Description")).toHaveClass(
        "sh-textarea__control--resize-vertical",
      );
    });

    it.each(["none", "horizontal", "both"] as const)("applies resize=%s", (resize) => {
      render(<Textarea label="Description" resize={resize} />);

      expect(screen.getByLabelText("Description")).toHaveClass(
        `sh-textarea__control--resize-${resize}`,
      );
    });
  });

  describe("behaviour", () => {
    it("accepts typed input and fires onChange", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Textarea label="Description" onChange={onChange} />);

      await user.type(screen.getByLabelText("Description"), "hi");

      expect(screen.getByLabelText("Description")).toHaveValue("hi");
      expect(onChange).toHaveBeenCalledTimes(2);
    });

    it("forwards arbitrary textarea attributes", () => {
      render(<Textarea label="Description" name="description" maxLength={200} placeholder="..." />);

      const control = screen.getByLabelText("Description");
      expect(control).toHaveAttribute("name", "description");
      expect(control).toHaveAttribute("maxlength", "200");
      expect(control).toHaveAttribute("placeholder", "...");
    });
  });

  describe("styling hooks", () => {
    it("puts className on the wrapper and textareaClassName on the control", () => {
      const { container } = render(
        <Textarea label="Description" className="wrapper-cls" textareaClassName="control-cls" />,
      );

      expect(container.querySelector(".sh-textarea")).toHaveClass("wrapper-cls");
      expect(screen.getByLabelText("Description")).toHaveClass(
        "sh-textarea__control",
        "control-cls",
      );
      expect(screen.getByLabelText("Description")).not.toHaveClass("wrapper-cls");
    });

    it("flags the invalid state on the wrapper", () => {
      const { container } = render(<Textarea label="Description" error="Nope." />);

      expect(container.querySelector(".sh-textarea")).toHaveClass("sh-textarea--invalid");
    });
  });
});
