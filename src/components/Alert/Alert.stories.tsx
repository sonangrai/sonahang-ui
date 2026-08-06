import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Alert } from "./Alert";
import { alertVariants } from "./alert.tokens";

const meta = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    variant: { control: "select", options: alertVariants },
  },
  args: {
    title: "Changes saved",
    children: "Your profile has been updated.",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 460 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    variant: "info",
    title: "Scheduled maintenance",
    children: "The service will be unavailable on Sunday between 02:00 and 04:00.",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    title: "Storage almost full",
    children: "You've used 92% of your quota. Delete files or upgrade to continue.",
  },
};

export const ErrorVariant: Story = {
  name: "Error",
  args: {
    variant: "error",
    title: "Upload failed",
    children: "The file exceeded the 10 MB limit. Try a smaller file.",
  },
};

export const TitleOnly: Story = {
  args: {
    variant: "success",
    title: "Changes saved",
    children: undefined,
  },
};

export const BodyOnly: Story = {
  name: "Without a title",
  args: {
    variant: "info",
    title: undefined,
    children: "Your trial ends in 5 days.",
  },
};

export const WithoutIcon: Story = {
  args: {
    variant: "info",
    icon: false,
    title: "No icon",
    children: "The icon slot can be turned off entirely.",
  },
};

export const Dismissible: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [open, setOpen] = useState(true);

    return open ? (
      <Alert variant="success" title="Changes saved" onDismiss={() => setOpen(false)}>
        Your profile has been updated.
      </Alert>
    ) : (
      <button type="button" onClick={() => setOpen(true)}>
        Show the alert again
      </button>
    );
  },
};

export const AllVariants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Alert variant="success" title="Changes saved">
        Your profile has been updated.
      </Alert>
      <Alert variant="info" title="Scheduled maintenance">
        The service will be unavailable on Sunday.
      </Alert>
      <Alert variant="warning" title="Storage almost full">
        You've used 92% of your quota.
      </Alert>
      <Alert variant="error" title="Upload failed">
        The file exceeded the 10 MB limit.
      </Alert>
    </div>
  ),
};

export const WithRichContent: Story = {
  name: "With links and markup",
  parameters: { controls: { disable: true } },
  render: () => (
    <Alert variant="warning" title="Action required">
      Your payment method expires soon.{" "}
      <a href="#billing" style={{ color: "inherit" }}>
        Update billing
      </a>{" "}
      to avoid interruption.
    </Alert>
  ),
};
