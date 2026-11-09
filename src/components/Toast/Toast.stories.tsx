import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../Button";
import { Dialog } from "../Dialog";
import { Toast } from "./Toast";
import { Toaster } from "./Toaster";
import { toast } from "./toast.store";
import { toastPositions } from "./toast.tokens";

const meta = {
  title: "Components/Toast",
  component: Toaster,
  subcomponents: { Toast },
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    position: { control: "select", options: toastPositions },
    duration: { control: { type: "number", step: 500 } },
    max: { control: { type: "number", min: 1 } },
    closeButton: { control: "boolean" },
  },
  args: {
    position: "bottom-right",
    duration: 5000,
    max: 3,
    closeButton: true,
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

const row = { display: "flex", flexWrap: "wrap", gap: 8 } as const;

/** Call `toast()` from anywhere; one `<Toaster />` renders them. */
export const Default: Story = {
  render: (args) => (
    <>
      <div style={row}>
        <Button onClick={() => toast("Draft saved")}>Default</Button>
        <Button
          variant="secondary"
          onClick={() => toast.success("Changes published", { description: "Live on sonahang.dev" })}
        >
          Success
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast.info("New version available", { description: "Refresh to update." })}
        >
          Info
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast.warning("Storage almost full", { description: "92% of 5 GB used." })}
        >
          Warning
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast.error("Couldn't save", { description: "Check your connection." })}
        >
          Error
        </Button>
        <Button variant="ghost" onClick={() => toast.dismiss()}>
          Dismiss all
        </Button>
      </div>
      <Toaster {...args} />
    </>
  ),
};

/** An action closes the toast after running, unless it calls `preventDefault()`. */
export const WithAction: Story = {
  name: "With an action",
  render: (args) => (
    <>
      <Button
        onClick={() =>
          toast("Message archived", {
            action: { label: "Undo", onClick: () => toast.success("Restored") },
          })
        }
      >
        Archive
      </Button>
      <Toaster {...args} />
    </>
  ),
};

/** Reusing an id updates the toast in place and restarts its timer. */
export const UpdateInPlace: Story = {
  name: "Update in place",
  render: (args) => (
    <>
      <Button
        onClick={() => {
          const id = toast("Uploading report.pdf…", { duration: Infinity, dismissible: false });
          setTimeout(() => toast.success("Uploaded report.pdf", { id, dismissible: true }), 1500);
        }}
      >
        Upload
      </Button>
      <Toaster {...args} />
    </>
  ),
};

const fakeRequest = (fail: boolean) =>
  new Promise<{ name: string }>((resolve, reject) =>
    setTimeout(
      () => (fail ? reject(new Error("Network unreachable")) : resolve({ name: "report.pdf" })),
      2000,
    ),
  );

/**
 * `toast.promise` shows a loading toast and turns it into success or error,
 * in place, when the promise settles. Messages can use the result.
 */
// Trailing underscore: `Promise` would shadow the global in this module.
export const Promise_: Story = {
  render: (args) => (
    <>
      <div style={row}>
        {[false, true].map((fail) => (
          <Button
            key={String(fail)}
            variant={fail ? "secondary" : "primary"}
            onClick={() =>
              toast
                .promise(fakeRequest(fail), {
                  loading: "Uploading…",
                  success: (file) => ({ title: "Uploaded", description: file.name }),
                  error: (reason) => ({
                    title: "Upload failed",
                    description: (reason as Error).message,
                  }),
                })
                .catch(() => {})
            }
          >
            {fail ? "Upload (fails)" : "Upload"}
          </Button>
        ))}
      </div>
      <Toaster {...args} />
    </>
  ),
};

export const Persistent: Story = {
  args: { duration: Infinity },
  render: (args) => (
    <>
      <Button onClick={() => toast("Stays until dismissed")}>Show</Button>
      <Toaster {...args} />
    </>
  ),
};

/** Try each position with the control above. */
export const Positions: Story = {
  args: { position: "top-center" },
  render: Default.render,
};

/**
 * Toasts stay above, and clickable over, an open modal — the stack moves into
 * the dialog and re-enters the top layer. Try the toast's Undo and close
 * buttons, and Escape on a focused toast: it closes the toast, not the dialog.
 */
export const OverADialog: Story = {
  name: "Over a dialog",
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title="Edit profile"
          footer={
            <Button
              onClick={() =>
                toast.success("Profile saved", {
                  action: { label: "Undo", onClick: () => toast("Change reverted") },
                })
              }
            >
              Save
            </Button>
          }
        >
          Save to raise a toast while this dialog is open.
        </Dialog>
        <Toaster {...args} />
      </>
    );
  },
};

/** The card on its own, for custom layouts. */
export const StaticCards: Story = {
  name: "Static cards",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 360 }}>
      <Toast title="Draft saved" onDismiss={() => {}} />
      <Toast variant="success" title="Changes published" description="Live on sonahang.dev" onDismiss={() => {}} />
      <Toast variant="info" title="New version available" action={{ label: "Refresh", onClick: () => {} }} />
      <Toast variant="warning" title="Storage almost full" description="92% of 5 GB used." />
      <Toast variant="error" title="Couldn't save" description="Check your connection." onDismiss={() => {}} />
      <Toast variant="loading" title="Uploading…" description="report.pdf" />
    </div>
  ),
};
