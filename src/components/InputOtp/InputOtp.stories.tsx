import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { InputOtp } from "./InputOtp";
import { otpTypes } from "./sanitizeOtpValue";
import { Button } from "../Button";

const meta = {
  title: "Components/InputOtp",
  component: InputOtp,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    type: { control: "inline-radio", options: otpTypes },
    length: { control: { type: "number", min: 3, max: 8 } },
    groupSize: { control: { type: "number", min: 2, max: 4 } },
    mask: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "Verification code",
    helperText: "Enter the 6-digit code we sent you.",
  },
} satisfies Meta<typeof InputOtp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A shorter code, and a separator splitting it into readable halves. */
export const Grouped: Story = {
  args: {
    length: 6,
    groupSize: 3,
    helperText: "Codes are easier to read in threes.",
  },
};

/** `type="alphanumeric"` also accepts letters, and keeps their case. */
export const Alphanumeric: Story = {
  args: {
    type: "alphanumeric",
    length: 5,
    label: "Invite code",
    helperText: "Five characters, letters or digits.",
  },
};

/** `mask` hides the characters. The value handed to `onChange` is unchanged. */
export const Masked: Story = {
  args: {
    mask: true,
    label: "PIN",
    length: 4,
    helperText: "Shielded from anyone reading over your shoulder.",
  },
};

/** `error` marks the field invalid and replaces the helper text. */
export const Invalid: Story = {
  args: {
    defaultValue: "123456",
    error: "That code has expired. Request a new one.",
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "1234" },
};

export const WithoutALabel: Story = {
  name: "Without a label",
  args: {
    label: undefined,
    helperText: undefined,
    "aria-label": "Verification code",
  },
};

/** Longer and shorter codes; the boxes just follow `length`. */
export const Lengths: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {[4, 6, 8].map((length) => (
        <InputOtp {...args} key={length} length={length} label={`${length} characters`} helperText={undefined} />
      ))}
    </div>
  ),
};

/**
 * `onComplete` fires once, as the last character lands — the usual place to
 * submit without making the user reach for a button.
 */
export const AutoSubmit: Story = {
  name: "Submitting on completion",
  parameters: { controls: { disable: true } },
  render: () => {
    const [status, setStatus] = useState<"idle" | "checking" | "done">("idle");
    const [code, setCode] = useState("");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
        <InputOtp
          label="Verification code"
          value={code}
          onChange={(next) => {
            setCode(next);
            if (next.length < 6) setStatus("idle");
          }}
          onComplete={() => {
            setStatus("checking");
            window.setTimeout(() => setStatus("done"), 700);
          }}
          helperText="Fills in and submits itself."
          error={undefined}
        />

        <span style={{ fontSize: 14, color: "var(--color-text-subtle)" }}>
          {status === "idle" && "Waiting for six digits…"}
          {status === "checking" && "Checking…"}
          {status === "done" && `Verified ${code}`}
        </span>
      </div>
    );
  },
};

/** Driven from outside — paste, clear and prefill all go through `value`. */
export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [code, setCode] = useState("12");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
        <InputOtp label="Verification code" value={code} onChange={setCode} groupSize={3} />

        <div style={{ display: "flex", gap: 8 }}>
          <Button size="sm" variant="secondary" onClick={() => setCode("")}>
            Clear
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setCode("246813")}>
            Prefill
          </Button>
        </div>

        <span style={{ fontSize: 14, color: "var(--color-text-subtle)" }}>
          Value: <code>{code || "—"}</code>
        </span>
      </div>
    );
  },
};
