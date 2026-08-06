import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProgressBar } from "./ProgressBar";
import { progressBarSizes } from "./progressBar.tokens";

const meta = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    size: { control: "select", options: progressBarSizes },
    showValue: { control: "boolean" },
    value: { control: { type: "range", min: 0, max: 100 } },
  },
  args: {
    label: "Uploading",
    value: 60,
    showValue: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 340 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutValue: Story = {
  name: "Without the percentage",
  args: {
    showValue: false,
  },
};

export const WithoutLabel: Story = {
  name: "Without a visible label",
  args: {
    label: undefined,
    "aria-label": "Uploading",
  },
};

export const Indeterminate: Story = {
  args: {
    value: undefined,
    label: "Preparing your export",
  },
};

export const Formatted: Story = {
  name: "Formatted value",
  args: {
    label: "Files uploaded",
    value: 3,
    max: 8,
    formatValue: (value: number, max: number) => `${value} of ${max} files`,
  },
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {progressBarSizes.map((size) => (
        <ProgressBar key={size} label={size} size={size} value={60} showValue />
      ))}
    </div>
  ),
};

export const Extremes: Story = {
  name: "Empty and complete",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <ProgressBar label="Not started" value={0} showValue />
      <ProgressBar label="Complete" value={100} showValue />
    </div>
  ),
};

export const Animated: Story = {
  name: "Live progress",
  parameters: { controls: { disable: true } },
  render: () => {
    const [value, setValue] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setValue((current) => (current >= 100 ? 0 : current + 5));
      }, 400);
      return () => clearInterval(timer);
    }, []);

    return <ProgressBar label="Uploading" value={value} showValue />;
  },
};
