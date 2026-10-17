import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AudioPlaylist } from "./AudioPlaylist";
import type { AudioTrack } from "./AudioPlaylist";
import { toneUrl } from "./demoTones";
import { playModes } from "./playlistOrder";
import type { PlayMode } from "./playlistOrder";

/** Short tones so moving between tracks is quick to try. */
const demoTracks = (): AudioTrack[] => [
  { src: toneUrl(8, 330), title: "Dawn", subtitle: "330 Hz", duration: 8 },
  { src: toneUrl(10, 392), title: "Morning", subtitle: "392 Hz", duration: 10 },
  { src: toneUrl(6, 440), title: "Noon", subtitle: "440 Hz", duration: 6 },
  { src: toneUrl(12, 494), title: "Dusk", subtitle: "494 Hz", duration: 12 },
  { src: toneUrl(9, 523), title: "Night", subtitle: "523 Hz", duration: 9 },
];

const meta = {
  title: "Components/AudioPlaylist",
  component: AudioPlaylist,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    defaultPlayMode: { control: "select", options: playModes },
    hideTrackList: { control: "boolean" },
    hideVolume: { control: "boolean" },
    tracks: { control: false },
  },
  args: {
    tracks: [],
    label: "Demo tones",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <AudioPlaylist {...args} tracks={args.tracks.length ? args.tracks : demoTracks()} />
  ),
} satisfies Meta<typeof AudioPlaylist>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Shuffle: Story = {
  args: {
    defaultPlayMode: "shuffle",
  },
};

export const RepeatOne: Story = {
  name: "Repeat one",
  args: {
    defaultPlayMode: "repeat-one",
    defaultTrackIndex: 2,
  },
};

export const WithoutTrackList: Story = {
  name: "Without track list",
  args: {
    hideTrackList: true,
  },
};

export const Localised: Story = {
  args: {
    label: "प्लेलिस्ट",
    labels: {
      play: "बजाउनुहोस्",
      pause: "रोक्नुहोस्",
      previous: "अघिल्लो",
      next: "अर्को",
      playMode: "बजाउने तरिका",
      modes: {
        sequential: "क्रमैसँग",
        "repeat-all": "सबै दोहोर्‍याउनुहोस्",
        "repeat-one": "एउटा दोहोर्‍याउनुहोस्",
        shuffle: "मिसाउनुहोस्",
      },
      tracks: "गीतहरू",
    },
  },
};

export const Controlled: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Track and mode both lift into state, e.g. to persist them or drive them from a separate now-playing bar.",
      },
    },
  },
  render: function Render() {
    const [tracks] = useState(demoTracks);
    const [index, setIndex] = useState(0);
    const [mode, setMode] = useState<PlayMode>("repeat-all");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <AudioPlaylist
          tracks={tracks}
          trackIndex={index}
          onTrackChange={setIndex}
          playMode={mode}
          onPlayModeChange={setMode}
        />
        <span style={{ fontSize: 14, color: "var(--color-text-subtle)" }}>
          Track: <code>{index}</code> · Mode: <code>{mode}</code>
        </span>
      </div>
    );
  },
};
