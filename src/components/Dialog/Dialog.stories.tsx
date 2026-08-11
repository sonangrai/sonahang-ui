import { useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Dialog } from "./Dialog";
import type { DialogProps } from "./Dialog";
import { dialogRoles, dialogSizes } from "./dialog.tokens";
import { Button } from "../Button";
import { Input } from "../Input";

/*
 * Dialog is controlled by design, so every story needs something to own the
 * open state. `footer` may be a function so its buttons can close the dialog.
 */
type DemoProps = Omit<DialogProps, "open" | "onClose" | "footer"> & {
  triggerLabel?: string;
  footer?: ReactNode | ((close: () => void) => ReactNode);
};

const DialogDemo = ({ triggerLabel = "Open dialog", footer, ...props }: DemoProps) => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>{triggerLabel}</Button>
      <Dialog
        {...props}
        open={open}
        onClose={close}
        footer={typeof footer === "function" ? footer(close) : footer}
      />
    </>
  );
};

const meta = {
  title: "Components/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "inline-radio", options: dialogSizes },
    role: { control: "inline-radio", options: dialogRoles },
    open: { control: false, table: { disable: true } },
    onClose: { control: false, table: { disable: true } },
    initialFocus: { control: false },
  },
  args: {
    open: false,
    onClose: () => {},
    title: "Delete project",
    description: "This permanently removes the project and everything inside it.",
    children: "Members will lose access immediately. Exports already downloaded are unaffected.",
  },
  render: (args) => <DialogDemo {...args} />,
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The usual shape: a question, and two buttons in the footer. */
export const WithActions: Story = {
  name: "With actions",
  render: (args) => (
    <DialogDemo
      {...args}
      footer={(close) => (
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button onClick={close}>Delete project</Button>
        </>
      )}
    />
  ),
};

/**
 * `role="alertdialog"` marks the content as urgent. Hiding the × makes Cancel
 * the first focusable element, so the safe answer is the one a keyboard lands
 * on — the browser focuses the first focusable child on its own.
 */
export const AlertDialog: Story = {
  name: "Alert dialog",
  render: (args) => (
    <DialogDemo
      {...args}
      triggerLabel="Delete account"
      role="alertdialog"
      size="sm"
      title="Delete your account?"
      description="This can't be undone."
      showClose={false}
      footer={(close) => (
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button onClick={close}>Yes, delete it</Button>
        </>
      )}
    >
      Your projects, exports and billing history will be erased.
    </DialogDemo>
  ),
};

/**
 * To direct focus somewhere else, pass `initialFocus` a ref to any focusable
 * element. Here it skips the × and the name field to land on the confirmation
 * box, which is what the user actually has to deal with.
 *
 * Note that the library's own `Button` and `Input` don't accept a `ref` yet, so
 * this needs a native element for now.
 */
export const WithInitialFocus: Story = {
  name: "With initial focus",
  parameters: { controls: { disable: true } },
  render: () => {
    const confirmRef = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Archive project</Button>
        <Dialog
          open={open}
          onClose={close}
          size="sm"
          title="Archive Orbital?"
          description="Type the project name to confirm."
          initialFocus={confirmRef}
          footer={
            <>
              <Button variant="secondary" onClick={close}>
                Cancel
              </Button>
              <Button onClick={close}>Archive</Button>
            </>
          }
        >
          <input
            ref={confirmRef}
            aria-label="Project name"
            placeholder="Orbital"
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
        </Dialog>
      </>
    );
  },
};

/** Four widths. `fullscreen` fills the viewport and squares off its corners. */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {dialogSizes.map((size) => (
        <DialogDemo
          key={size}
          {...args}
          size={size}
          triggerLabel={size}
          title={`A ${size} dialog`}
          description={undefined}
        />
      ))}
    </div>
  ),
};

/** The body scrolls on its own; the header and footer stay put. */
export const ScrollingContent: Story = {
  name: "Scrolling content",
  render: (args) => (
    <DialogDemo
      {...args}
      title="Terms of service"
      description="Last updated 4 March"
      footer={(close) => <Button onClick={close}>I agree</Button>}
    >
      {Array.from({ length: 14 }, (_, index) => (
        <p key={index} style={{ marginTop: index === 0 ? 0 : 12 }}>
          {index + 1}. Nothing in this section is legally meaningful, but it is long
          enough to push the body past the height of the dialog and prove that the
          header and footer stay where they are.
        </p>
      ))}
    </DialogDemo>
  ),
};

/** `autoFocus` on a field works, because the browser honours it natively. */
export const WithAForm: Story = {
  name: "With a form",
  render: (args) => (
    <DialogDemo
      {...args}
      triggerLabel="Rename project"
      title="Rename project"
      description={undefined}
      footer={(close) => (
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button onClick={close}>Save</Button>
        </>
      )}
    >
      <Input label="Project name" defaultValue="Orbital" autoFocus />
    </DialogDemo>
  ),
};

/**
 * Nothing casual dismisses this one — no ×, no Escape, no backdrop click. Use
 * it only when losing the dialog would lose work; it's a dead end otherwise.
 */
export const NotDismissible: Story = {
  name: "Not dismissible",
  render: (args) => (
    <DialogDemo
      {...args}
      triggerLabel="Start migration"
      title="Migration in progress"
      description="Closing now would leave the database half-moved."
      showClose={false}
      closeOnEscape={false}
      closeOnBackdropClick={false}
      footer={(close) => <Button onClick={close}>Cancel migration</Button>}
    >
      Moving 4,182 records. This usually takes a couple of minutes.
    </DialogDemo>
  ),
};

/** No description and no footer — just a title and content. */
export const TitleOnly: Story = {
  name: "Title only",
  render: (args) => (
    <DialogDemo {...args} title="Keyboard shortcuts" description={undefined}>
      <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", margin: 0 }}>
        {[
          ["⌘K", "Open the command palette"],
          ["⌘/", "Toggle this dialog"],
          ["Esc", "Close whatever is open"],
        ].map(([keys, meaning]) => (
          <div key={keys} style={{ display: "contents" }}>
            <dt>
              <kbd>{keys}</kbd>
            </dt>
            <dd style={{ margin: 0, color: "var(--color-text-subtle)" }}>{meaning}</dd>
          </div>
        ))}
      </dl>
    </DialogDemo>
  ),
};

/**
 * The top layer stacks, so a dialog opened from a dialog sits above it and
 * Escape closes the nearer one first. Page scrolling stays locked until both
 * are gone.
 */
export const Stacked: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [first, setFirst] = useState(false);
    const [second, setSecond] = useState(false);

    return (
      <>
        <Button onClick={() => setFirst(true)}>Open the first</Button>

        <Dialog
          open={first}
          onClose={() => setFirst(false)}
          title="Project settings"
          description="The second dialog opens on top of this one."
          footer={
            <>
              <Button variant="secondary" onClick={() => setFirst(false)}>
                Close
              </Button>
              <Button onClick={() => setSecond(true)}>Delete project…</Button>
            </>
          }
        >
          Anything behind a modal is inert — try tabbing into the page.
        </Dialog>

        <Dialog
          open={second}
          onClose={() => setSecond(false)}
          role="alertdialog"
          size="sm"
          title="Delete project?"
          description="This can't be undone."
          footer={
            <>
              <Button variant="secondary" onClick={() => setSecond(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setSecond(false);
                  setFirst(false);
                }}
              >
                Delete
              </Button>
            </>
          }
        />
      </>
    );
  },
};
