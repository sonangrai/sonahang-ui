import type { Meta, StoryObj } from "@storybook/react-vite";

import { Textarea } from "./Textarea";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    rows: { control: { type: "number", min: 1 } },
    resize: {
      control: "select",
      options: ["none", "vertical", "horizontal", "both"],
    },
  },
  args: {
    label: "Description",
    placeholder: "What does this component do?",
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHelperText: Story = {
  args: {
    helperText: "Markdown is supported.",
  },
};

export const WithError: Story = {
  args: {
    error: "Description is required.",
    defaultValue: "",
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
    defaultValue: "This field can't be edited.",
  },
};

export const Rows: Story = {
  name: "Taller (rows)",
  args: {
    rows: 8,
  },
};

export const NoResize: Story = {
  name: "Resize disabled",
  args: {
    resize: "none",
    helperText: "This one can't be dragged larger.",
  },
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 360 }}>
      <Textarea label="Default" placeholder="Placeholder" />
      <Textarea label="With helper" helperText="Some guidance here." placeholder="Placeholder" />
      <Textarea label="Invalid" error="Something went wrong." defaultValue="Bad value" />
      <Textarea label="Disabled" disabled defaultValue="Can't touch this" />
    </div>
  ),
};
