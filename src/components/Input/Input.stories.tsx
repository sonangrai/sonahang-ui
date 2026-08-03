import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "./Input";

const SearchIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75}>
    <circle cx="7" cy="7" r="4.5" />
    <path d="M10.5 10.5 14 14" strokeLinecap="round" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
    <path d="m2 4.5 6 4 6-4" strokeLinecap="round" />
  </svg>
);

const meta = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    iconPosition: { control: "inline-radio", options: ["left", "right"] },
  },
  args: {
    label: "Email",
    placeholder: "ada@example.com",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHelperText: Story = {
  args: {
    helperText: "We'll only use this to send you release notes.",
  },
};

export const WithError: Story = {
  args: {
    error: "Enter a valid email address.",
    defaultValue: "not-an-email",
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
    defaultValue: "ada@example.com",
  },
};

export const WithoutLabel: Story = {
  name: "Without a visible label",
  args: {
    label: undefined,
    "aria-label": "Email",
  },
};

export const IconLeft: Story = {
  name: "Icon on the left",
  args: {
    label: "Search",
    placeholder: "Search components",
    icon: <SearchIcon />,
  },
};

export const IconRight: Story = {
  name: "Icon on the right",
  args: {
    icon: <MailIcon />,
    iconPosition: "right",
  },
};

export const IconWithError: Story = {
  name: "Icon with an error",
  args: {
    icon: <MailIcon />,
    error: "Enter a valid email address.",
    defaultValue: "not-an-email",
  },
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 320 }}>
      <Input label="Default" placeholder="Placeholder" />
      <Input label="With helper" helperText="Some guidance here." placeholder="Placeholder" />
      <Input label="Invalid" error="Something went wrong." defaultValue="Bad value" />
      <Input label="Disabled" disabled defaultValue="Can't touch this" />
    </div>
  ),
};
