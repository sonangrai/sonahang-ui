import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Pagination } from "./Pagination";

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    count: { control: { type: "number", min: 0 } },
    siblingCount: { control: { type: "number", min: 0, max: 4 } },
    boundaryCount: { control: { type: "number", min: 1, max: 4 } },
    showFirstLast: { control: "boolean" },
    hidePrevNext: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    count: 10,
    defaultPage: 1,
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ManyPages: Story = {
  name: "Many pages",
  args: {
    count: 50,
    defaultPage: 25,
  },
};

export const WithFirstLast: Story = {
  name: "With first/last jumps",
  args: {
    count: 50,
    defaultPage: 25,
    showFirstLast: true,
  },
};

export const PagesOnly: Story = {
  name: "Pages only",
  args: {
    count: 8,
    defaultPage: 4,
    hidePrevNext: true,
  },
};

export const WiderWindow: Story = {
  name: "Wider sibling window",
  args: {
    count: 50,
    defaultPage: 25,
    siblingCount: 2,
  },
};

export const MoreBoundaries: Story = {
  name: "More boundary pages",
  args: {
    count: 50,
    defaultPage: 25,
    boundaryCount: 2,
  },
};

export const SinglePage: Story = {
  name: "Single page",
  args: {
    count: 1,
  },
};

export const Disabled: Story = {
  args: {
    count: 10,
    defaultPage: 5,
    disabled: true,
  },
};

export const CustomLabels: Story = {
  name: "Translated labels",
  args: {
    count: 10,
    defaultPage: 5,
    showFirstLast: true,
    labels: {
      first: "Erste Seite",
      previous: "Zurück",
      next: "Weiter",
      last: "Letzte Seite",
      page: (page: number) => `Seite ${page}`,
    },
  },
};

/** The width stays constant as you page through, so the row never jumps. */
export const StableWidth: Story = {
  name: "Stable width",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {[1, 2, 5, 10, 19, 20].map((page) => (
        <Pagination key={page} count={20} page={page} onChange={() => {}} />
      ))}
    </div>
  ),
};

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const total = 96;
    const count = Math.ceil(total / pageSize);
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <span
          style={{
            fontFamily: "var(--font-family-sans)",
            fontSize: 14,
            color: "var(--color-text-subtle)",
          }}
        >
          Showing {from}–{to} of {total}
        </span>
        <Pagination count={count} page={page} onChange={setPage} showFirstLast />
      </div>
    );
  },
};
