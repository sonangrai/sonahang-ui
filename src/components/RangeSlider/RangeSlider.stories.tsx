import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { RangeSlider } from "./RangeSlider";

const meta = {
  title: "Components/RangeSlider",
  component: RangeSlider,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    disabled: { control: "boolean" },
    showValue: { control: "boolean" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
  },
  args: {
    label: "Volume",
    defaultValue: 60,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RangeSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  name: "Showing the value",
  args: {
    showValue: true,
  },
};

export const WithHelperText: Story = {
  args: {
    showValue: true,
    helperText: "Applies to notification sounds only.",
  },
};

export const WithError: Story = {
  args: {
    showValue: true,
    error: "Pick a value above 20.",
    defaultValue: 10,
  },
};

export const Steps: Story = {
  name: "Stepped",
  args: {
    showValue: true,
    min: 0,
    max: 10,
    step: 2,
    defaultValue: 4,
    helperText: "Steps of 2.",
  },
};

export const Formatted: Story = {
  name: "Formatted value",
  args: {
    label: "Budget",
    showValue: true,
    min: 0,
    max: 500,
    step: 10,
    defaultValue: 150,
    formatValue: (value: number) => `$${value}`,
    helperText: "Screen readers announce the formatted value too.",
  },
};

export const Disabled: Story = {
  args: {
    showValue: true,
    disabled: true,
  },
};

export const Extremes: Story = {
  name: "At both ends",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <RangeSlider label="Minimum" showValue defaultValue={0} />
      <RangeSlider label="Maximum" showValue defaultValue={100} />
    </div>
  ),
};

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [volume, setVolume] = useState(30);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <RangeSlider label="Volume" showValue value={volume} onChange={setVolume} />
        <span style={{ fontSize: 14, color: "var(--color-text-subtle)" }}>
          Value: <code>{volume}</code>
        </span>
      </div>
    );
  },
};
