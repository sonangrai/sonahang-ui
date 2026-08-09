import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Select } from "./Select";

const FRUIT = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

const GlobeIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4}>
    <circle cx="8" cy="8" r="6.25" />
    <path d="M2 8h12M8 1.75c1.6 1.7 2.5 3.9 2.5 6.25S9.6 12.55 8 14.25c-1.6-1.7-2.5-3.9-2.5-6.25S6.4 3.45 8 1.75Z" />
  </svg>
);

const meta = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    multiple: { control: "boolean" },
    placeholder: { control: "text" },
  },
  args: {
    label: "Fruit",
    options: FRUIT,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPlaceholder: Story = {
  args: {
    placeholder: "Choose a fruit",
    defaultValue: "",
  },
};

export const WithHelperText: Story = {
  args: {
    helperText: "You can change this later.",
  },
};

export const WithError: Story = {
  args: {
    placeholder: "Choose a fruit",
    defaultValue: "",
    error: "Please choose a fruit.",
  },
};

export const Required: Story = {
  args: {
    required: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "banana",
  },
};

export const WithIcon: Story = {
  name: "With a leading icon",
  args: {
    label: "Region",
    icon: <GlobeIcon />,
    options: [
      { value: "eu", label: "Europe" },
      { value: "na", label: "North America" },
      { value: "apac", label: "Asia Pacific" },
    ],
  },
};

export const WithDisabledOption: Story = {
  name: "With a disabled option",
  args: {
    options: [...FRUIT, { value: "durian", label: "Durian (out of stock)", disabled: true }],
  },
};

export const Grouped: Story = {
  args: {
    label: "Food",
    options: [
      { label: "Fruit", options: FRUIT },
      {
        label: "Vegetables",
        options: [
          { value: "leek", label: "Leek" },
          { value: "kale", label: "Kale" },
        ],
      },
    ],
  },
};

/** Pass `children` instead of `options` to build the list yourself. */
export const WithChildren: Story = {
  name: "Custom children",
  args: {
    options: undefined,
  },
  render: (args) => (
    <Select {...args}>
      <option value="apple">Apple</option>
      <optgroup label="Citrus">
        <option value="lemon">Lemon</option>
        <option value="lime">Lime</option>
      </optgroup>
    </Select>
  ),
};

/** `multiple` renders the platform's list box, so the chevron is dropped. */
export const Multiple: Story = {
  args: {
    multiple: true,
    size: 4,
    defaultValue: ["apple", "cherry"],
  },
};

/** Sits on the same baseline as Input and Textarea in a form row. */
export const AlongsideInput: Story = {
  name: "In a form row",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 280 }}>
      <Select label="Fruit" options={FRUIT} placeholder="Choose a fruit" defaultValue="" />
      <Select label="Region" icon={<GlobeIcon />} options={[{ value: "eu", label: "Europe" }]} />
    </div>
  ),
};

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [value, setValue] = useState("");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Select
          label="Fruit"
          placeholder="Choose a fruit"
          options={FRUIT}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <span style={{ fontSize: 14, color: "var(--color-text-subtle)" }}>
          Selected: <code>{value || "none"}</code>
        </span>
      </div>
    );
  },
};
