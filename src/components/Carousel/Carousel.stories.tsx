import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Carousel } from "./Carousel";
import { CarouselDots } from "./CarouselDots";
import { CarouselNext } from "./CarouselNext";
import { CarouselPlayPause } from "./CarouselPlayPause";
import { CarouselPrevious } from "./CarouselPrevious";
import { CarouselSlide } from "./CarouselSlide";
import { CarouselSlides } from "./CarouselSlides";

const meta = {
  title: "Components/Carousel",
  component: Carousel,
  subcomponents: {
    CarouselSlides,
    CarouselSlide,
    CarouselPrevious,
    CarouselNext,
    CarouselDots,
    CarouselPlayPause,
  },
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    loop: { control: "boolean" },
    autoPlay: { control: "boolean" },
    interval: { control: { type: "number", min: 1000, step: 500 } },
  },
  args: {
    "aria-label": "Product highlights",
    loop: true,
    autoPlay: false,
    interval: 4000,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

const panels = [
  { title: "Ship faster", body: "Every component arrives accessible, themed, and tested.", tint: 1 },
  { title: "Theme it once", body: "One accent token recolours the whole set, light and dark.", tint: 2 },
  { title: "Keyboard first", body: "Arrow keys, focus rings, and announcements come as standard.", tint: 3 },
];

const Panel = ({ title, body, tint }: (typeof panels)[number]) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: 8,
      minHeight: 200,
      padding: 32,
      backgroundColor: `var(--color-accent-tint-${tint})`,
      color: "var(--color-accent-on-tint)",
    }}
  >
    <strong style={{ fontSize: "var(--font-size-lg)" }}>{title}</strong>
    <span>{body}</span>
  </div>
);

const slides = (
  <CarouselSlides>
    {panels.map((panel) => (
      <CarouselSlide key={panel.title}>
        <Panel {...panel} />
      </CarouselSlide>
    ))}
  </CarouselSlides>
);

export const Default: Story = {
  render: (args) => (
    <Carousel {...args}>
      {slides}
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots />
    </Carousel>
  ),
};

/** Without looping the arrows run out, and disable themselves at each end. */
export const NoLoop: Story = {
  args: { loop: false },
  render: Default.render,
};

/** Arrows only — the dots are optional, and cost a row of height. */
export const ArrowsOnly: Story = {
  render: (args) => (
    <Carousel {...args}>
      {slides}
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  ),
};

/** Dots only, for a carousel that's swiped or driven by the keyboard. */
export const DotsOnly: Story = {
  render: (args) => (
    <Carousel {...args}>
      {slides}
      <CarouselDots />
    </Carousel>
  ),
};

/**
 * Auto-rotation pauses under the pointer, while focus is inside, and in a
 * background tab — and doesn't start at all for a reader who asked for
 * reduced motion. Navigating by hand stops it for good; the play button is
 * how it comes back, and is worth rendering whenever `autoPlay` is on.
 */
export const AutoPlay: Story = {
  args: { autoPlay: true, interval: 2500 },
  render: (args) => (
    <Carousel {...args}>
      {slides}
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots />
      <CarouselPlayPause />
    </Carousel>
  ),
};

/** Drive it from outside to keep it in step with something else on the page. */
export const Controlled: Story = {
  render: (args) => {
    const [index, setIndex] = useState(1);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Carousel {...args} index={index} onChange={setIndex}>
          {slides}
          <CarouselPrevious />
          <CarouselNext />
          <CarouselDots />
        </Carousel>
        <p style={{ margin: 0, fontSize: "var(--font-size-sm)", color: "var(--color-text-subtle)" }}>
          Showing slide {index + 1} of {panels.length}
        </p>
      </div>
    );
  },
};

/** Slides hold whatever you like — this one is a plain image per slide. */
export const Images: Story = {
  render: (args) => (
    <Carousel {...args} aria-label="Gallery">
      <CarouselSlides>
        {["4f46e5", "0ea5e9", "10b981"].map((hex, index) => (
          <CarouselSlide key={hex} aria-label={`Swatch ${index + 1}`}>
            <div style={{ height: 240, backgroundColor: `#${hex}` }} />
          </CarouselSlide>
        ))}
      </CarouselSlides>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots />
    </Carousel>
  ),
};
