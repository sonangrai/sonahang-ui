import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { SegmentedControl } from "./SegmentedControl";

const VIEWS = [
  { value: "list", label: "List" },
  { value: "grid", label: "Grid" },
  { value: "board", label: "Board" },
];

const meta = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    fullWidth: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    label: "View",
    options: VIEWS,
    defaultValue: "grid",
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutLabel: Story = {
  name: "Without a visible label",
  args: {
    label: undefined,
    "aria-label": "View",
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
  },
};

export const TwoOptions: Story = {
  args: {
    label: "Billing period",
    options: [
      { value: "monthly", label: "Monthly" },
      { value: "yearly", label: "Yearly" },
    ],
    defaultValue: "monthly",
  },
};

export const WithDisabledSegment: Story = {
  args: {
    options: [
      { value: "list", label: "List" },
      { value: "grid", label: "Grid" },
      { value: "board", label: "Board", disabled: true },
    ],
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
    const [view, setView] = useState("list");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <SegmentedControl label="View" options={VIEWS} value={view} onChange={setView} />
        <span style={{ fontSize: 14, color: "var(--color-text-subtle)" }}>
          Selected: <code>{view}</code>
        </span>
      </div>
    );
  },
};
