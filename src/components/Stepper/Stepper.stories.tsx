import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Step } from "./Step";
import { Stepper } from "./Stepper";

const meta = {
  title: "Components/Stepper",
  component: Stepper,
  subcomponents: { Step },
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    activeStep: { control: { type: "number", min: 0, max: 3 } },
  },
  args: {
    activeStep: 1,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: (args) => (
    <Stepper {...args}>
      <Step title="Account" description="Your details" />
      <Step title="Address" description="Where to ship" />
      <Step title="Payment" description="Card or invoice" />
    </Stepper>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <Stepper {...args}>
        <Step title="Account" description="Your details" />
        <Step title="Address" description="Where to ship" />
        <Step title="Payment" description="Card or invoice" />
      </Stepper>
    </div>
  ),
};

export const TitlesOnly: Story = {
  name: "Titles only",
  render: (args) => (
    <Stepper {...args}>
      <Step title="Cart" />
      <Step title="Delivery" />
      <Step title="Payment" />
      <Step title="Review" />
    </Stepper>
  ),
};

export const WithError: Story = {
  name: "With a failed step",
  args: { activeStep: 2 },
  render: (args) => (
    <Stepper {...args}>
      <Step title="Account" description="Your details" />
      <Step title="Payment" description="Card declined" status="error" />
      <Step title="Review" description="Confirm and place order" />
    </Stepper>
  ),
};

export const AllComplete: Story = {
  name: "All complete",
  args: { activeStep: 3 },
  render: (args) => (
    <Stepper {...args}>
      <Step title="Account" description="Your details" />
      <Step title="Address" description="Where to ship" />
      <Step title="Payment" description="Card or invoice" />
    </Stepper>
  ),
};

/** Steps with an `onClick` become buttons, for going back to an earlier one. */
export const Navigable: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [active, setActive] = useState(2);
    const steps = ["Account", "Address", "Payment", "Review"];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Stepper activeStep={active}>
          {steps.map((title, index) => (
            <Step
              key={title}
              title={title}
              // Only completed steps are reachable; you can't skip ahead.
              onClick={index < active ? () => setActive(index) : undefined}
            />
          ))}
        </Stepper>
        <span style={{ fontSize: 14, color: "var(--color-text-subtle)" }}>
          Active: <code>{steps[active] ?? "done"}</code>
        </span>
      </div>
    );
  },
};

export const WithCustomIcons: Story = {
  name: "Custom indicators",
  args: { activeStep: 1 },
  render: (args) => (
    <Stepper {...args}>
      <Step title="Draft" icon="✎" />
      <Step title="Review" icon="👀" />
      <Step title="Published" icon="★" />
    </Stepper>
  ),
};

/** A vertical stepper with long descriptions — the connector spans the gap. */
export const VerticalDetailed: Story = {
  name: "Vertical with long text",
  args: { orientation: "vertical", activeStep: 1 },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <Stepper {...args}>
        <Step
          title="Create your account"
          description="We'll send a confirmation email to verify it's really you."
        />
        <Step
          title="Add a delivery address"
          description="Used for shipping estimates and to calculate tax at checkout."
        />
        <Step title="Choose how to pay" description="Card, invoice, or bank transfer." />
      </Stepper>
    </div>
  ),
};
