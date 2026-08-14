import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { InputOtp } from "../InputOtp";
import type { InputOtpProps } from "../InputOtp";

const Code = (props: Partial<InputOtpProps>) => <InputOtp label="Code" {...props} />;

const field = () => screen.getByLabelText("Code");
const slots = () => document.querySelectorAll(".sh-input-otp__slot");
const slotText = () => [...slots()].map((slot) => slot.textContent);

describe("InputOtp", () => {
  describe("structure", () => {
    it("renders six boxes by default", () => {
      render(<Code />);

      expect(slots()).toHaveLength(6);
    });

    it("honours a custom length", () => {
      render(<Code length={4} />);

      expect(slots()).toHaveLength(4);
    });

    it("is a single field, not one per box", () => {
      // Six inputs would be six unlabelled fields to a screen reader, and a
      // reimplementation of a text field along the way.
      render(<Code />);

      expect(screen.getAllByRole("textbox")).toHaveLength(1);
    });

    it("keeps the boxes out of the accessibility tree", () => {
      const { container } = render(<Code />);

      expect(container.querySelector(".sh-input-otp__boxes")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
    });

    it("associates the label with the field", () => {
      render(<Code />);

      expect(field()).toBeInTheDocument();
    });

    it("keeps ids unique between instances", () => {
      render(
        <>
          <InputOtp label="First" />
          <InputOtp label="Second" />
        </>,
      );

      expect(screen.getByLabelText("First").id).not.toBe(screen.getByLabelText("Second").id);
    });

    it("does not cap the field with maxlength", () => {
      // The browser truncates a paste to fit maxlength before any handler
      // runs, so "123-456" would arrive as "123-45" and clean up one digit
      // short. The cap lives in sanitizeOtpValue instead.
      render(<Code length={4} />);

      expect(field()).not.toHaveAttribute("maxlength");
    });
  });

  describe("autofill hints", () => {
    it("asks for the one-time code", () => {
      // What lets iOS and Android offer the code straight from the SMS.
      render(<Code />);

      expect(field()).toHaveAttribute("autocomplete", "one-time-code");
    });

    it("asks for the number pad when numeric", () => {
      render(<Code />);

      expect(field()).toHaveAttribute("inputmode", "numeric");
    });

    it("asks for the full keyboard when alphanumeric", () => {
      render(<Code type="alphanumeric" />);

      expect(field()).toHaveAttribute("inputmode", "text");
    });

    it("turns off autocorrect and spellcheck", () => {
      render(<Code />);

      expect(field()).toHaveAttribute("autocorrect", "off");
      expect(field()).toHaveAttribute("spellcheck", "false");
    });
  });

  describe("typing", () => {
    it("fills the boxes in order", async () => {
      const user = userEvent.setup();
      render(<Code />);

      await user.type(field(), "123");

      expect(slotText()).toEqual(["1", "2", "3", "", "", ""]);
    });

    it("reports each change", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Code onChange={onChange} />);

      await user.type(field(), "12");

      expect(onChange.mock.calls).toEqual([["1"], ["12"]]);
    });

    it("rejects characters outside the type", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Code onChange={onChange} />);

      await user.type(field(), "1a2");

      expect(slotText()).toEqual(["1", "2", "", "", "", ""]);
      expect(onChange.mock.calls).toEqual([["1"], ["12"]]);
    });

    it("accepts letters when alphanumeric", async () => {
      const user = userEvent.setup();
      render(<Code type="alphanumeric" />);

      await user.type(field(), "a1B");

      expect(slotText()).toEqual(["a", "1", "B", "", "", ""]);
    });

    it("stops at the length", async () => {
      const user = userEvent.setup();
      render(<Code length={4} />);

      await user.type(field(), "123456");

      expect(slotText()).toEqual(["1", "2", "3", "4"]);
    });

    it("clears backwards on backspace", async () => {
      const user = userEvent.setup();
      render(<Code />);

      await user.type(field(), "123");
      await user.type(field(), "{Backspace}");

      expect(slotText()).toEqual(["1", "2", "", "", "", ""]);
    });
  });

  describe("pasting", () => {
    it("fills the whole code at once", async () => {
      const user = userEvent.setup();
      render(<Code />);

      await user.click(field());
      await user.paste("123456");

      expect(slotText()).toEqual(["1", "2", "3", "4", "5", "6"]);
    });

    it("strips the punctuation a copied code carries", async () => {
      const user = userEvent.setup();
      render(<Code />);

      await user.click(field());
      await user.paste("123-456");

      expect(slotText()).toEqual(["1", "2", "3", "4", "5", "6"]);
    });

    it("truncates a code that is too long", async () => {
      const user = userEvent.setup();
      render(<Code length={4} />);

      await user.click(field());
      await user.paste("123456");

      expect(slotText()).toEqual(["1", "2", "3", "4"]);
    });
  });

  describe("completion", () => {
    it("fires when the last character lands", async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<Code length={3} onComplete={onComplete} />);

      await user.type(field(), "123");

      expect(onComplete).toHaveBeenCalledExactlyOnceWith("123");
    });

    it("does not fire before then", async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<Code length={3} onComplete={onComplete} />);

      await user.type(field(), "12");

      expect(onComplete).not.toHaveBeenCalled();
    });

    it("fires on a paste that completes the code", async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<Code length={4} onComplete={onComplete} />);

      await user.click(field());
      await user.paste("1234");

      expect(onComplete).toHaveBeenCalledExactlyOnceWith("1234");
    });

    it("fires again when a full code is replaced by another", async () => {
      // Correcting a code by selecting all and pasting a new one has to
      // submit, or auto-submit quietly stops working on the second attempt.
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<Code length={4} onComplete={onComplete} defaultValue="1234" />);

      await user.click(field());
      await user.keyboard("{Control>}a{/Control}");
      await user.paste("5678");

      expect(onComplete.mock.calls).toEqual([["5678"]]);
    });

    it("does not re-fire while the code sits full", async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<Code length={3} onComplete={onComplete} />);

      await user.type(field(), "1239999");

      expect(onComplete).toHaveBeenCalledExactlyOnceWith("123");
    });

    it("fires again after the code is broken and refilled", async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<Code length={3} onComplete={onComplete} />);

      await user.type(field(), "123");
      await user.type(field(), "{Backspace}4");

      expect(onComplete.mock.calls).toEqual([["123"], ["124"]]);
    });
  });

  describe("controlled", () => {
    it("reflects the value prop", () => {
      render(<Code value="12" />);

      expect(slotText()).toEqual(["1", "2", "", "", "", ""]);
    });

    it("does not self-update", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Code value="" onChange={onChange} />);

      await user.type(field(), "1");

      expect(onChange).toHaveBeenCalledExactlyOnceWith("1");
      expect(slotText()).toEqual(["", "", "", "", "", ""]);
    });

    it("sanitises what the parent hands back", () => {
      // Otherwise a controlled value could put characters in the boxes that
      // typing them would have rejected.
      render(<Code value="12-34" />);

      expect(slotText()).toEqual(["1", "2", "3", "4", "", ""]);
    });

    it("follows a value change", () => {
      const { rerender } = render(<Code value="11" />);
      rerender(<Code value="22" />);

      expect(slotText()).toEqual(["2", "2", "", "", "", ""]);
    });

    it("honours defaultValue when uncontrolled", () => {
      render(<Code defaultValue="99" />);

      expect(slotText()).toEqual(["9", "9", "", "", "", ""]);
    });

    it("sanitises defaultValue too", () => {
      render(<Code defaultValue="9x9" />);

      expect(slotText()).toEqual(["9", "9", "", "", "", ""]);
    });

    it("drives a real controlled parent", async () => {
      const user = userEvent.setup();
      const Harness = () => {
        const [code, setCode] = useState("");
        return <InputOtp label="Code" value={code} onChange={setCode} />;
      };
      render(<Harness />);

      await user.type(field(), "42");

      expect(slotText()).toEqual(["4", "2", "", "", "", ""]);
    });
  });

  describe("masking", () => {
    it("hides the characters", async () => {
      const user = userEvent.setup();
      render(<Code mask />);

      await user.type(field(), "12");

      expect(slotText()).toEqual(["•", "•", "", "", "", ""]);
    });

    it("leaves the value itself alone", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Code mask onChange={onChange} />);

      await user.type(field(), "12");

      expect(onChange).toHaveBeenLastCalledWith("12");
    });

    it("does not mask empty boxes", () => {
      render(<Code mask />);

      expect(slotText()).toEqual(["", "", "", "", "", ""]);
    });
  });

  describe("the active box", () => {
    it("marks where the next character lands", async () => {
      const user = userEvent.setup();
      const { container } = render(<Code />);

      await user.type(field(), "12");

      const active = container.querySelectorAll(".sh-input-otp__slot--active");
      expect(active).toHaveLength(1);
      expect([...slots()].indexOf(active[0])).toBe(2);
    });

    it("marks the first box on focus", async () => {
      const user = userEvent.setup();
      const { container } = render(<Code />);

      await user.click(field());

      expect([...slots()].indexOf(container.querySelector(".sh-input-otp__slot--active")!)).toBe(0);
    });

    it("marks nothing while unfocused", () => {
      const { container } = render(<Code defaultValue="12" />);

      expect(container.querySelector(".sh-input-otp__slot--active")).not.toBeInTheDocument();
    });

    it("stays inside the boxes when the code is full", async () => {
      // The caret sits past the last character; the highlight has nowhere
      // further to go.
      const user = userEvent.setup();
      const { container } = render(<Code length={3} />);

      await user.type(field(), "123");

      const active = container.querySelector(".sh-input-otp__slot--active");
      expect([...slots()].indexOf(active!)).toBe(2);
    });

    it("flags filled boxes", async () => {
      const user = userEvent.setup();
      const { container } = render(<Code />);

      await user.type(field(), "12");

      expect(container.querySelectorAll(".sh-input-otp__slot--filled")).toHaveLength(2);
    });
  });

  describe("grouping", () => {
    it("adds a separator every N boxes", () => {
      const { container } = render(<Code groupSize={3} />);

      expect(container.querySelectorAll(".sh-input-otp__separator")).toHaveLength(1);
    });

    it("never leads with one", () => {
      const { container } = render(<Code length={6} groupSize={2} />);
      const first = container.querySelector(".sh-input-otp__boxes")?.firstElementChild;

      expect(first).toHaveClass("sh-input-otp__slot");
      expect(container.querySelectorAll(".sh-input-otp__separator")).toHaveLength(2);
    });

    it("adds none without grouping", () => {
      const { container } = render(<Code />);

      expect(container.querySelectorAll(".sh-input-otp__separator")).toHaveLength(0);
    });
  });

  describe("states", () => {
    it("marks the field invalid when there is an error", () => {
      render(<Code error="That code has expired." />);

      expect(field()).toHaveAttribute("aria-invalid", "true");
    });

    it("describes the field with the error", () => {
      render(<Code error="That code has expired." />);

      expect(field()).toHaveAccessibleDescription("That code has expired.");
    });

    it("describes the field with helper text", () => {
      render(<Code helperText="Check your messages." />);

      expect(field()).toHaveAccessibleDescription("Check your messages.");
    });

    it("lets the error replace the helper text", () => {
      render(<Code helperText="Check your messages." error="That code has expired." />);

      expect(screen.queryByText("Check your messages.")).not.toBeInTheDocument();
      expect(screen.getByText("That code has expired.")).toBeInTheDocument();
    });

    it("keeps a describedby the consumer passed", () => {
      render(
        <>
          <span id="outside">Sent to +44…</span>
          <Code aria-describedby="outside" helperText="Check your messages." />
        </>,
      );

      expect(field().getAttribute("aria-describedby")).toMatch(/^outside \S+$/);
    });

    it("is not invalid without an error", () => {
      render(<Code />);

      expect(field()).not.toHaveAttribute("aria-invalid");
    });

    it("disables the field", () => {
      render(<Code disabled />);

      expect(field()).toBeDisabled();
    });

    it("takes no input while disabled", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Code disabled onChange={onChange} />);

      await user.type(field(), "123");

      expect(onChange).not.toHaveBeenCalled();
    });

    it("marks the field required", () => {
      // Queried by role: `required` appends an asterisk to the label text, so
      // the label no longer reads exactly "Code".
      render(<Code required />);

      expect(screen.getByRole("textbox")).toBeRequired();
    });

    it("keeps the required asterisk out of the accessible name", () => {
      render(<Code required />);

      expect(screen.getByRole("textbox")).toHaveAccessibleName("Code");
    });
  });

  describe("forms", () => {
    it("submits under its name", () => {
      render(
        <form data-testid="form">
          <Code name="otp" defaultValue="123456" />
        </form>,
      );

      const form = screen.getByTestId("form") as HTMLFormElement;
      expect(new FormData(form).get("otp")).toBe("123456");
    });
  });

  describe("styling hooks", () => {
    it("merges a className onto the wrapper", () => {
      const { container } = render(<Code className="custom" />);

      expect(container.firstElementChild).toHaveClass("custom");
    });

    it("flags the invalid state for styling", () => {
      const { container } = render(<Code error="Nope" />);

      expect(container.firstElementChild).toHaveClass("sh-input-otp--invalid");
    });

    it("flags the disabled state for styling", () => {
      const { container } = render(<Code disabled />);

      expect(container.firstElementChild).toHaveClass("sh-input-otp--disabled");
    });
  });
});
