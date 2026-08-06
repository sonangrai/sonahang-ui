import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { FileDrop } from "./FileDrop";

const meta = {
  title: "Components/FileDrop",
  component: FileDrop,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
    hideFileList: { control: "boolean" },
    accept: { control: "text" },
    placeholder: { control: "text" },
  },
  args: {
    label: "Attachments",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 380 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FileDrop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Multiple: Story = {
  args: {
    multiple: true,
    helperText: "Attach as many files as you need.",
  },
};

export const Accepted: Story = {
  name: "Restricted file types",
  args: {
    accept: ".pdf,image/*",
    multiple: true,
    helperText: "Dropped files are filtered too, not just the picker.",
  },
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: "Drop your CV here",
    accept: ".pdf,.docx",
  },
};

export const WithError: Story = {
  args: {
    error: "Attach at least one file.",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const HiddenFileList: Story = {
  name: "Without the file list",
  args: {
    multiple: true,
    hideFileList: true,
    helperText: "Selection is handled by the parent instead.",
  },
};

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [files, setFiles] = useState<File[]>([]);
    const [rejected, setRejected] = useState<string[]>([]);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FileDrop
          label="Attachments"
          accept="image/*"
          multiple
          value={files}
          onChange={setFiles}
          onReject={(files) => setRejected(files.map((file) => file.name))}
          helperText="Images only — anything else is reported as rejected."
        />
        <span style={{ fontSize: 14, color: "var(--color-text-subtle)" }}>
          Selected: <code>{files.length}</code>
          {rejected.length > 0 && (
            <>
              {" · "}Rejected: <code>{rejected.join(", ")}</code>
            </>
          )}
        </span>
      </div>
    );
  },
};
