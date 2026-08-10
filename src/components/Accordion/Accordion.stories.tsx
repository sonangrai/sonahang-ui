import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Accordion } from "./Accordion";
import { AccordionItem } from "./AccordionItem";

const meta = {
  title: "Components/Accordion",
  component: Accordion,
  subcomponents: { AccordionItem },
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    type: { control: "inline-radio", options: ["single", "multiple"] },
    collapsible: { control: "boolean" },
    headingLevel: { control: "select", options: [2, 3, 4, 5, 6] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  {
    value: "shipping",
    title: "How long does shipping take?",
    body: "Standard delivery arrives in 3–5 working days. Express arrives next working day if ordered before 2pm.",
  },
  {
    value: "returns",
    title: "What's your returns policy?",
    body: "Anything unused can go back within 30 days. We cover return postage for faulty items.",
  },
  {
    value: "support",
    title: "How do I contact support?",
    body: "Reply to your order confirmation, or use the chat widget between 9am and 6pm.",
  },
];

export const Default: Story = {
  render: (args) => (
    <Accordion {...args}>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value} title={item.title}>
          {item.body}
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

export const WithOneOpen: Story = {
  name: "With one open",
  args: { defaultValue: ["shipping"] },
  render: Default.render,
};

/** `type="multiple"` lets sections stay open independently. */
export const Multiple: Story = {
  args: { type: "multiple", defaultValue: ["shipping", "returns"] },
  render: Default.render,
};

/** With `collapsible={false}` one section always stays open. */
export const AlwaysOne: Story = {
  name: "Always one open",
  args: { defaultValue: ["shipping"], collapsible: false },
  render: Default.render,
};

export const WithDisabledItem: Story = {
  name: "With a disabled section",
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="shipping" title="How long does shipping take?">
        {items[0].body}
      </AccordionItem>
      <AccordionItem value="returns" title="Returns (temporarily unavailable)" disabled>
        {items[1].body}
      </AccordionItem>
      <AccordionItem value="support" title="How do I contact support?">
        {items[2].body}
      </AccordionItem>
    </Accordion>
  ),
};

/** Titles take any node, so badges and icons can sit in the trigger. */
export const RichTitles: Story = {
  name: "Rich titles",
  render: (args) => (
    <Accordion {...args} defaultValue={["billing"]}>
      <AccordionItem
        value="billing"
        title={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            Billing
            <span
              style={{
                fontSize: 11,
                padding: "1px 6px",
                borderRadius: 999,
                backgroundColor: "var(--color-accent-subtle-bg)",
                color: "var(--color-accent-subtle-text)",
              }}
            >
              2 issues
            </span>
          </span>
        }
      >
        Two invoices need attention before the next billing cycle.
      </AccordionItem>
      <AccordionItem value="usage" title="Usage">
        You've used 62% of your monthly quota.
      </AccordionItem>
    </Accordion>
  ),
};

/** Panels take arbitrary content, including focusable elements. */
export const WithInteractiveContent: Story = {
  name: "With interactive content",
  args: { defaultValue: ["form"] },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem value="form" title="Notification preferences">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ display: "flex", gap: 8 }}>
            <input type="checkbox" defaultChecked /> Email
          </label>
          <label style={{ display: "flex", gap: 8 }}>
            <input type="checkbox" /> SMS
          </label>
        </div>
      </AccordionItem>
      <AccordionItem value="other" title="Something else">
        Collapse the section above and try tabbing — its checkboxes are skipped.
      </AccordionItem>
    </Accordion>
  ),
};

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [open, setOpen] = useState<string[]>(["shipping"]);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Accordion type="multiple" value={open} onChange={setOpen}>
          {items.map((item) => (
            <AccordionItem key={item.value} value={item.value} title={item.title}>
              {item.body}
            </AccordionItem>
          ))}
        </Accordion>
        <span style={{ fontSize: 14, color: "var(--color-text-subtle)" }}>
          Open: <code>{open.join(", ") || "none"}</code>
        </span>
      </div>
    );
  },
};
