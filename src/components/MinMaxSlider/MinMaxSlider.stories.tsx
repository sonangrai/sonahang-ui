import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MinMaxSlider } from "./MinMaxSlider";
import type { MinMaxValue } from "./MinMaxSlider";

const meta = {
  title: "Components/MinMaxSlider",
  component: MinMaxSlider,
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
    minGap: { control: "number" },
  },
  args: {
    label: "Price",
    defaultValue: [20, 70],
    showValue: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MinMaxSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Formatted: Story = {
  name: "Formatted value",
  args: {
    min: 0,
    max: 500,
    step: 10,
    defaultValue: [100, 350],
    formatValue: (value: number) => `$${value}`,
    helperText: "Screen readers announce the formatted value too.",
  },
};

export const WithMinGap: Story = {
  name: "Minimum gap",
  args: {
    minGap: 20,
    defaultValue: [30, 70],
    helperText: "The thumbs stay at least 20 apart.",
  },
};

export const FullRange: Story = {
  name: "Spanning the whole range",
  args: {
    defaultValue: [0, 100],
  },
};

export const Narrow: Story = {
  name: "Thumbs close together",
  args: {
    defaultValue: [48, 52],
    helperText: "Both thumbs stay grabbable when they overlap.",
  },
};

export const AtTopEnd: Story = {
  name: "Both thumbs at the top",
  args: {
    defaultValue: [100, 100],
    helperText: "The lower thumb takes priority above halfway, so it can be dragged back.",
  },
};

export const WithError: Story = {
  args: {
    error: "Choose a narrower range.",
    defaultValue: [0, 100],
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [range, setRange] = useState<MinMaxValue>([100, 350]);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <MinMaxSlider
          label="Price"
          showValue
          min={0}
          max={500}
          step={10}
          formatValue={(value) => `$${value}`}
          value={range}
          onChange={setRange}
        />
        <span style={{ fontSize: 14, color: "var(--color-text-subtle)" }}>
          Range: <code>[{range[0]}, {range[1]}]</code>
        </span>
      </div>
    );
  },
};
