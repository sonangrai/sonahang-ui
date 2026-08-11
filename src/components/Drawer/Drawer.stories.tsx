import { useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Drawer } from "./Drawer";
import type { DrawerProps } from "./Drawer";
import { drawerSides, drawerSizes } from "./drawer.tokens";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";

/*
 * Drawer is controlled by design, so every story needs something to own the
 * open state. `footer` may be a function so its buttons can close the drawer.
 */
type DemoProps = Omit<DrawerProps, "open" | "onClose" | "footer"> & {
  triggerLabel?: string;
  footer?: ReactNode | ((close: () => void) => ReactNode);
};

const DrawerDemo = ({ triggerLabel = "Open drawer", footer, ...props }: DemoProps) => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>{triggerLabel}</Button>
      <Drawer
        {...props}
        open={open}
        onClose={close}
        footer={typeof footer === "function" ? footer(close) : footer}
      />
    </>
  );
};

const meta = {
  title: "Components/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    side: { control: "inline-radio", options: drawerSides },
    size: { control: "inline-radio", options: drawerSizes },
    open: { control: false, table: { disable: true } },
    onClose: { control: false, table: { disable: true } },
    initialFocus: { control: false },
  },
  args: {
    open: false,
    onClose: () => {},
    title: "Filters",
    description: "Narrow the results without leaving the page.",
    children: "Anything can go in here — the body scrolls on its own.",
  },
  render: (args) => <DrawerDemo {...args} />,
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** All four edges. Each slides in from its own side and rounds its inner corners. */
export const Sides: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {drawerSides.map((side) => (
        <DrawerDemo
          key={side}
          {...args}
          side={side}
          triggerLabel={side}
          title={`From the ${side}`}
          description={undefined}
          footer={(close) => <Button onClick={close}>Close</Button>}
        >
          Slides in from the {side} and back out the same way.
        </DrawerDemo>
      ))}
    </div>
  ),
};

/**
 * `size` applies to the drawer's own axis — width for `left`/`right`, height
 * for `top`/`bottom` — and is always capped at the viewport, so `lg` on a
 * narrow phone is simply full-bleed rather than overflowing.
 */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {drawerSizes.map((size) => (
        <DrawerDemo
          key={size}
          {...args}
          size={size}
          triggerLabel={size}
          title={`A ${size} drawer`}
          description={undefined}
          footer={(close) => <Button onClick={close}>Close</Button>}
        />
      ))}
    </div>
  ),
};

/** The most common use: a filter panel with the actions pinned at the bottom. */
export const FilterPanel: Story = {
  name: "Filter panel",
  render: (args) => (
    <DrawerDemo
      {...args}
      triggerLabel="Filters"
      size="sm"
      footer={(close) => (
        <>
          <Button variant="secondary" onClick={close}>
            Reset
          </Button>
          <Button onClick={close}>Apply</Button>
        </>
      )}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {["Available now", "Free shipping", "On sale", "Highly rated"].map((label) => (
          <Checkbox key={label} label={label} />
        ))}
      </div>
    </DrawerDemo>
  ),
};

/** The body scrolls on its own; the header and footer stay put. */
export const ScrollingContent: Story = {
  name: "Scrolling content",
  render: (args) => (
    <DrawerDemo
      {...args}
      title="Activity"
      description="Everything that happened this week"
      footer={(close) => <Button onClick={close}>Done</Button>}
    >
      {Array.from({ length: 20 }, (_, index) => (
        <p key={index} style={{ marginTop: index === 0 ? 0 : 12 }}>
          {index + 1}. Someone changed something, and this line is here to push the
          body past the height of the drawer.
        </p>
      ))}
    </DrawerDemo>
  ),
};

/** A bottom sheet — the same component, anchored to the bottom edge. */
export const BottomSheet: Story = {
  name: "Bottom sheet",
  render: (args) => (
    <DrawerDemo
      {...args}
      triggerLabel="Share"
      side="bottom"
      size="sm"
      title="Share this project"
      description={undefined}
      footer={(close) => (
        <Button variant="secondary" onClick={close}>
          Cancel
        </Button>
      )}
    >
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["Copy link", "Email", "Slack", "Export CSV"].map((label) => (
          <Button key={label} variant="outline" size="sm">
            {label}
          </Button>
        ))}
      </div>
    </DrawerDemo>
  ),
};

/**
 * `initialFocus` points at any focusable element — here the search field, so a
 * keyboard user can start typing rather than tabbing past the ×.
 *
 * The library's own `Button` and `Input` don't accept a `ref` yet, so this
 * needs a native element for now.
 */
export const WithInitialFocus: Story = {
  name: "With initial focus",
  parameters: { controls: { disable: true } },
  render: () => {
    const searchRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Search</Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          side="left"
          size="sm"
          title="Search"
          description="Focus starts in the field."
        >
          <input
            ref={searchRef}
            aria-label="Search projects"
            placeholder="Search projects…"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "8px 12px",
              border: "1px solid var(--color-border-strong)",
              borderRadius: 8,
              backgroundColor: "var(--color-bg-canvas)",
              color: "var(--color-text)",
              font: "inherit",
            }}
          />
        </Drawer>
      </>
    );
  },
};

/**
 * Nothing casual dismisses this one — no ×, no Escape, no scrim click. Use it
 * only when losing the drawer would lose work.
 */
export const NotDismissible: Story = {
  name: "Not dismissible",
  render: (args) => (
    <DrawerDemo
      {...args}
      triggerLabel="Edit record"
      title="Unsaved changes"
      description="Finish or discard before leaving."
      showClose={false}
      closeOnEscape={false}
      closeOnBackdropClick={false}
      footer={(close) => (
        <>
          <Button variant="secondary" onClick={close}>
            Discard
          </Button>
          <Button onClick={close}>Save</Button>
        </>
      )}
    >
      The scrim and Escape are both inert here.
    </DrawerDemo>
  ),
};

/**
 * `portal` moves the drawer to `document.body`.
 *
 * It is *not* what makes a drawer escape `z-index` and `overflow: hidden` —
 * both triggers sit inside a clipped, low-stacked, transformed box and both
 * render correctly, because `showModal()` puts them in the top layer either
 * way. Portal when the DOM position itself is the problem: the second trigger
 * is inside a `<form>`, and only the portalled drawer's Apply button stops
 * submitting it.
 */
export const InsideAwkwardAncestors: Story = {
  name: "Inside awkward ancestors",
  parameters: { controls: { disable: true } },
  render: () => {
    const [submitted, setSubmitted] = useState(0);

    const box = {
      position: "relative" as const,
      zIndex: 0,
      overflow: "hidden",
      transform: "translateZ(0)",
      width: 260,
      padding: 16,
      border: "1px dashed var(--color-border-strong)",
      borderRadius: 8,
    };

    return (
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={box}>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--color-text-subtle)" }}>
            overflow: hidden · z-index: 0 · transform
          </p>
          <DrawerDemo
            triggerLabel="No portal"
            title="Rendered in place"
            description="Still on top of everything."
            footer={(close) => <Button onClick={close}>Close</Button>}
          >
            The top layer ignores every ancestor around this trigger.
          </DrawerDemo>
        </div>

        <form
          style={box}
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted((count) => count + 1);
          }}
        >
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--color-text-subtle)" }}>
            inside a &lt;form&gt; · submits: {submitted}
          </p>
          <DrawerDemo
            portal
            triggerLabel="Portalled"
            title="Rendered in the body"
            description="Its submit button no longer belongs to the form."
            footer={<button type="submit">Apply</button>}
          >
            Drop the <code>portal</code> prop and this button posts the form behind it.
          </DrawerDemo>
        </form>
      </div>
    );
  },
};
