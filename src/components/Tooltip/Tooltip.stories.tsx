import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Tooltip } from "./Tooltip";
import { Button } from "../Button";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    placement: {
      control: "inline-radio",
      options: ["auto", "top", "bottom", "left", "right"],
    },
    delay: { control: { type: "number", min: 0, step: 50 } },
    disabled: { control: "boolean" },
    content: { control: "text" },
    children: { control: false },
  },
  args: {
    content: "Saves without leaving the page",
    children: <Button>Save</Button>,
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button>Save</Button>
    </Tooltip>
  ),
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Four sides, each with the arrow following the tip. */
export const Placements: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "flex", gap: 16, padding: 48 }}>
      {(["top", "bottom", "left", "right"] as const).map((placement) => (
        <Tooltip key={placement} {...args} placement={placement} content={`On the ${placement}`}>
          <Button variant="secondary">{placement}</Button>
        </Tooltip>
      ))}
    </div>
  ),
};

/*
 * Buttons pinned to the edges of the viewport, so `auto` has a real decision
 * to make. Anything centred in a cell has room above it and simply gets `top`,
 * which is what an earlier version of this story accidentally demonstrated.
 */
const EDGES = [
  ["start", "start"],
  ["start", "center"],
  ["start", "end"],
  ["center", "start"],
  ["center", "center"],
  ["center", "end"],
  ["end", "start"],
  ["end", "center"],
  ["end", "end"],
] as const;

const edgeLabel = (block: string, inline: string) =>
  [block === "start" ? "top" : block === "end" ? "bottom" : "", inline === "start" ? "left" : inline === "end" ? "right" : ""]
    .filter(Boolean)
    .join(" ") || "middle";

/**
 * `placement="auto"` measures the trigger against the viewport each time the
 * tip opens, then re-measures on scroll and resize.
 *
 * The top row flips below its triggers — there's nothing above them. Everything
 * else keeps `top`, which is correct: a side is only chosen once neither
 * vertical direction fits, and that takes a genuinely short viewport. Drag the
 * preview pane short to see the middle row swing out sideways.
 */
export const AutoPlacement: Story = {
  name: "Auto placement",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: (args) => (
    <div
      style={{
        display: "grid",
        gridTemplate: "repeat(3, 1fr) / repeat(3, 1fr)",
        height: "100vh",
      }}
    >
      {EDGES.map(([block, inline]) => (
        <Tooltip
          key={`${block}-${inline}`}
          {...args}
          placement="auto"
          content={`Pinned ${edgeLabel(block, inline)}`}
          style={{ alignSelf: block, justifySelf: inline }}
        >
          <Button variant="secondary" size="sm">
            {edgeLabel(block, inline)}
          </Button>
        </Tooltip>
      ))}
    </div>
  ),
};

/**
 * The measurement isn't taken once and forgotten. With the tip held open,
 * scroll the page: the trigger climbs towards the top edge and the tip drops
 * below it the moment there's no longer room above.
 */
export const AutoFollowsScrolling: Story = {
  name: "Auto follows scrolling",
  parameters: { controls: { disable: true }, layout: "fullscreen" },
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <div style={{ height: "220vh", padding: "85vh 24px 0" }}>
        <div style={{ position: "fixed", top: 12, right: 12 }}>
          <Button size="sm" onClick={() => setOpen((value) => !value)}>
            {open ? "Hide tip" : "Show tip"}
          </Button>
        </div>

        {/* Held open from outside, so the pointer is free to scroll. */}
        <Tooltip placement="auto" content="Nowhere left to go — flipping below" open={open}>
          <Button variant="secondary">Scroll the page</Button>
        </Tooltip>
      </div>
    );
  },
};

/** The main job: naming a control that only shows an icon. */
export const OnAnIconButton: Story = {
  name: "On an icon button",
  args: { content: "Copy to clipboard" },
  render: (args) => (
    <Tooltip {...args}>
      <button
        type="button"
        aria-label="Copy"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          border: "1px solid var(--color-border-strong)",
          borderRadius: 8,
          backgroundColor: "var(--color-bg-canvas)",
          color: "var(--color-text)",
          cursor: "pointer",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
          <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
          <path d="M10.5 3.5A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V9a1.5 1.5 0 0 0 1.5 1.5" />
        </svg>
      </button>
    </Tooltip>
  ),
};

/** Long text wraps at 240px rather than running off the side of the page. */
export const LongContent: Story = {
  name: "Long content",
  args: {
    content: "Exports every row that matches the current filters, including columns hidden in this view.",
  },
};

/** `delay={0}` shows the tip the moment the pointer arrives. */
export const NoDelay: Story = {
  name: "No delay",
  args: { delay: 0, content: "Instant" },
};

/** Anything focusable works — the tip shows on keyboard focus too. */
export const OnALink: Story = {
  name: "On a link",
  args: { content: "Opens in the same tab", placement: "bottom" },
  render: (args) => (
    <p style={{ fontFamily: "var(--font-family-sans)", color: "var(--color-text)" }}>
      Read the{" "}
      <Tooltip {...args}>
        <a href="#tooltip" style={{ color: "var(--color-accent)" }}>
          billing guide
        </a>
      </Tooltip>{" "}
      before upgrading.
    </p>
  ),
};

/** With `disabled`, the trigger renders untouched and no tip is attached. */
export const Disabled: Story = {
  args: { disabled: true },
};

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 32 }}>
        <Tooltip content="Held open from outside" open={open} onOpenChange={setOpen}>
          <Button variant="secondary">Target</Button>
        </Tooltip>
        <Button onClick={() => setOpen((value) => !value)}>{open ? "Hide" : "Show"}</Button>
      </div>
    );
  },
};
