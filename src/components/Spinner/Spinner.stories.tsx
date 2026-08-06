import type { Meta, StoryObj } from "@storybook/react-vite";

import { Spinner } from "./Spinner";
import { spinnerSizes } from "./spinner.tokens";

const meta = {
  title: "Components/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    size: { control: "select", options: spinnerSizes },
    showLabel: { control: "boolean" },
    label: { control: "text" },
  },
  args: {
    label: "Loading",
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  name: "With a visible label",
  args: {
    showLabel: true,
    label: "Loading your dashboard",
  },
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      {spinnerSizes.map((size) => (
        <Spinner key={size} size={size} label={`Loading (${size})`} />
      ))}
    </div>
  ),
};

/** The ring takes `currentColor`, so it picks up whatever context it's in. */
export const InheritsColour: Story = {
  name: "Inherits colour",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <span style={{ color: "var(--color-accent)" }}>
        <Spinner label="Accent" />
      </span>
      <span style={{ color: "var(--color-text-subtle)" }}>
        <Spinner label="Subtle" />
      </span>
      <span style={{ color: "var(--color-danger)" }}>
        <Spinner label="Danger" />
      </span>
    </div>
  ),
};

/** Inline in a sentence — it sits on the text baseline and matches its colour. */
export const InlineWithText: Story = {
  name: "Inline with text",
  parameters: { controls: { disable: true } },
  render: () => (
    <p style={{ fontFamily: "var(--font-family-sans)", color: "var(--color-text)" }}>
      <Spinner size="sm" label="Checking availability" showLabel />
    </p>
  ),
};

export const OnASurface: Story = {
  name: "Centred in a panel",
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 160,
        borderRadius: 10,
        backgroundColor: "var(--color-bg-surface)",
        color: "var(--color-accent)",
      }}
    >
      <Spinner size="lg" label="Loading results" showLabel />
    </div>
  ),
};
