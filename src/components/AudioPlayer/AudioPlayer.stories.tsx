import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../Button";
import { AudioPlayer } from "./AudioPlayer";
import { toneUrl } from "./demoTones";

const meta = {
  title: "Components/AudioPlayer",
  component: AudioPlayer,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    hideVolume: { control: "boolean" },
    loop: { control: "boolean" },
    defaultVolume: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    src: { control: false },
  },
  args: {
    src: "",
    title: "Morning Raga",
    subtitle: "Sonahang Rai · Demo tone",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
  // Every story gets a generated tone unless it sets its own src.
  render: (args) => <AudioPlayer {...args} src={args.src || toneUrl(30)} />,
} satisfies Meta<typeof AudioPlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutMetadata: Story = {
  name: "No title",
  args: {
    title: undefined,
    subtitle: undefined,
  },
};

export const LongTitle: Story = {
  name: "Long title truncates",
  args: {
    title: "An unreasonably long episode title that keeps going well past the edge of the player",
    subtitle: "The controls keep their width; the text gives way.",
  },
};

export const WithoutVolume: Story = {
  name: "Without volume",
  args: {
    hideVolume: true,
  },
};

export const QuietStart: Story = {
  name: "Starting volume",
  args: {
    defaultVolume: 0.3,
  },
};

export const Narrow: Story = {
  name: "Narrow container",
  parameters: {
    docs: {
      description: {
        story:
          "Under 360px the volume slider drops out and the mute button stays. It's a container query, so this happens in a sidebar as well as on a phone.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};

export const LoadError: Story = {
  name: "Failed to load",
  args: {
    src: "/does-not-exist.mp3",
  },
};

export const Localised: Story = {
  args: {
    title: "बिहानको राग",
    subtitle: "डेमो टोन",
    labels: {
      play: "बजाउनुहोस्",
      pause: "रोक्नुहोस्",
      seek: "खोज्नुहोस्",
      mute: "मौन",
      unmute: "आवाज खोल्नुहोस्",
      volume: "आवाज",
      error: "अडियो लोड हुन सकेन।",
    },
  },
};

export const ExternalControl: Story = {
  name: "Driven through ref",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "The ref is the underlying `<audio>` element. The player reads its state back from media events, so it stays in sync whatever drives playback.",
      },
    },
  },
  render: function Render() {
    const audioRef = useRef<HTMLAudioElement>(null);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <AudioPlayer src={toneUrl(30)} title="Morning Raga" ref={audioRef} />
        <div style={{ display: "flex", gap: 8 }}>
          {/* HTMLMediaElement.play(), not a story play function. */}
          {/* eslint-disable-next-line storybook/context-in-play-function */}
          <Button variant="secondary" onClick={() => audioRef.current?.play()}>
            Play
          </Button>
          <Button variant="secondary" onClick={() => audioRef.current?.pause()}>
            Pause
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (audioRef.current) audioRef.current.currentTime = 0;
            }}
          >
            Restart
          </Button>
        </div>
      </div>
    );
  },
};
