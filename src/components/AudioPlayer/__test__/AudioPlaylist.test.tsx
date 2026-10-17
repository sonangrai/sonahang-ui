import { createRef } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AudioPlaylist } from "../AudioPlaylist";
import type { AudioTrack } from "../AudioPlaylist";
import { audioOf, finish, installMediaStubs, timeUpdate } from "./mediaStubs";

installMediaStubs();

const tracks: AudioTrack[] = [
  { src: "/one.mp3", title: "One", subtitle: "First", duration: 61 },
  { src: "/two.mp3", title: "Two" },
  { src: "/three.mp3", title: "Three" },
];

/** jsdom resolves src to an absolute URL; compare on the path. */
const srcOf = (container: HTMLElement) => new URL(audioOf(container).src).pathname;

const currentRow = () =>
  within(screen.getByRole("list", { name: "Tracks" }))
    .getAllByRole("button")
    .find((row) => row.getAttribute("aria-current") === "true");

describe("AudioPlaylist", () => {
  describe("rendering", () => {
    it("is a group with the playlist's name", () => {
      render(<AudioPlaylist tracks={tracks} label="Road trip" />);

      expect(screen.getByRole("group", { name: "Road trip" })).toBeInTheDocument();
    });

    it("starts on the first track", () => {
      const { container } = render(<AudioPlaylist tracks={tracks} />);

      expect(srcOf(container)).toBe("/one.mp3");
      expect(screen.getByRole("group", { name: "One" })).toBeInTheDocument();
    });

    it("honours defaultTrackIndex", () => {
      const { container } = render(<AudioPlaylist tracks={tracks} defaultTrackIndex={2} />);

      expect(srcOf(container)).toBe("/three.mp3");
    });

    it("clamps an out-of-range index", () => {
      const { container } = render(<AudioPlaylist tracks={tracks} trackIndex={9} />);

      expect(srcOf(container)).toBe("/three.mp3");
    });

    it("lists every track and marks the current one", () => {
      render(<AudioPlaylist tracks={tracks} />);

      const list = screen.getByRole("list", { name: "Tracks" });
      expect(within(list).getAllByRole("listitem")).toHaveLength(3);
      expect(currentRow()).toHaveTextContent("One");
    });

    it("shows a track's duration when given", () => {
      render(<AudioPlaylist tracks={tracks} />);

      expect(screen.getByText("1:01")).toBeInTheDocument();
    });

    it("can hide the track list", () => {
      render(<AudioPlaylist tracks={tracks} hideTrackList />);

      expect(screen.queryByRole("list")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Next track" })).toBeInTheDocument();
    });

    it("renders nothing for an empty playlist", () => {
      const { container } = render(<AudioPlaylist tracks={[]} />);

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("moving between tracks", () => {
    it("goes to the next track", async () => {
      const user = userEvent.setup();
      const { container } = render(<AudioPlaylist tracks={tracks} />);

      await user.click(screen.getByRole("button", { name: "Next track" }));

      expect(srcOf(container)).toBe("/two.mp3");
      expect(currentRow()).toHaveTextContent("Two");
    });

    it("goes to the previous track", async () => {
      const user = userEvent.setup();
      const { container } = render(<AudioPlaylist tracks={tracks} defaultTrackIndex={1} />);

      await user.click(screen.getByRole("button", { name: "Previous track" }));

      expect(srcOf(container)).toBe("/one.mp3");
    });

    it("restarts the track instead when it's a few seconds in", async () => {
      const user = userEvent.setup();
      const { container } = render(<AudioPlaylist tracks={tracks} defaultTrackIndex={1} />);
      timeUpdate(audioOf(container), 10);

      await user.click(screen.getByRole("button", { name: "Previous track" }));

      expect(srcOf(container)).toBe("/two.mp3");
      expect(audioOf(container).currentTime).toBe(0);
    });

    it("doesn't start playback when skipping while paused", async () => {
      const user = userEvent.setup();
      render(<AudioPlaylist tracks={tracks} />);

      await user.click(screen.getByRole("button", { name: "Next track" }));

      expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    });

    it("keeps playing when skipping while playing", async () => {
      const user = userEvent.setup();
      render(<AudioPlaylist tracks={tracks} />);

      await user.click(screen.getByRole("button", { name: "Play" }));
      await user.click(screen.getByRole("button", { name: "Next track" }));

      expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(2);
      expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    });

    it("plays a track picked from the list", async () => {
      const user = userEvent.setup();
      const { container } = render(<AudioPlaylist tracks={tracks} />);

      await user.click(screen.getByRole("button", { name: /Three/ }));

      expect(srcOf(container)).toBe("/three.mp3");
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalledOnce();
    });

    it("toggles playback from the current track's row", async () => {
      const user = userEvent.setup();
      render(<AudioPlaylist tracks={tracks} />);

      await user.click(screen.getByRole("button", { name: /One/ }));
      expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /One/ }));
      expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    });

    it("reports track changes", async () => {
      const onTrackChange = vi.fn();
      const user = userEvent.setup();
      render(<AudioPlaylist tracks={tracks} onTrackChange={onTrackChange} />);

      await user.click(screen.getByRole("button", { name: "Next track" }));

      expect(onTrackChange).toHaveBeenCalledExactlyOnceWith(1);
    });

    it("leaves a controlled index to the caller", async () => {
      const onTrackChange = vi.fn();
      const user = userEvent.setup();
      const { container } = render(
        <AudioPlaylist tracks={tracks} trackIndex={0} onTrackChange={onTrackChange} />,
      );

      await user.click(screen.getByRole("button", { name: "Next track" }));

      expect(onTrackChange).toHaveBeenCalledExactlyOnceWith(1);
      expect(srcOf(container)).toBe("/one.mp3");
    });
  });

  describe("play modes", () => {
    const modeButton = () => screen.getByRole("button", { name: /^Play mode:/ });

    it("defaults to playing in order", () => {
      render(<AudioPlaylist tracks={tracks} />);

      expect(modeButton()).toHaveAccessibleName("Play mode: In order");
    });

    it("cycles through every mode", async () => {
      const user = userEvent.setup();
      render(<AudioPlaylist tracks={tracks} />);

      const seen = [];
      for (let i = 0; i < 4; i++) {
        await user.click(modeButton());
        seen.push(modeButton().getAttribute("aria-label"));
      }

      expect(seen).toEqual([
        "Play mode: Repeat all",
        "Play mode: Repeat one",
        "Play mode: Shuffle",
        "Play mode: In order",
      ]);
    });

    it("reports mode changes", async () => {
      const onPlayModeChange = vi.fn();
      const user = userEvent.setup();
      render(<AudioPlaylist tracks={tracks} onPlayModeChange={onPlayModeChange} />);

      await user.click(modeButton());

      expect(onPlayModeChange).toHaveBeenCalledExactlyOnceWith("repeat-all");
    });

    it("leaves a controlled mode to the caller", async () => {
      const user = userEvent.setup();
      render(<AudioPlaylist tracks={tracks} playMode="shuffle" onPlayModeChange={vi.fn()} />);

      await user.click(modeButton());

      expect(modeButton()).toHaveAccessibleName("Play mode: Shuffle");
    });

    it("advances and keeps playing when a track ends", () => {
      const { container } = render(<AudioPlaylist tracks={tracks} />);

      finish(audioOf(container));

      expect(srcOf(container)).toBe("/two.mp3");
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalledOnce();
    });

    it("stops after the last track in order", () => {
      const { container } = render(<AudioPlaylist tracks={tracks} defaultTrackIndex={2} />);

      finish(audioOf(container));

      expect(srcOf(container)).toBe("/three.mp3");
      expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    });

    it("wraps to the first track with repeat all", () => {
      const { container } = render(
        <AudioPlaylist tracks={tracks} defaultTrackIndex={2} defaultPlayMode="repeat-all" />,
      );

      finish(audioOf(container));

      expect(srcOf(container)).toBe("/one.mp3");
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalledOnce();
    });

    it("loops the element natively with repeat one", () => {
      const { container } = render(<AudioPlaylist tracks={tracks} defaultPlayMode="repeat-one" />);

      expect(audioOf(container).loop).toBe(true);
    });

    it("doesn't loop the element in other modes", () => {
      const { container } = render(<AudioPlaylist tracks={tracks} defaultPlayMode="repeat-all" />);

      expect(audioOf(container).loop).toBe(false);
    });

    it("restarts a lone track with repeat all", () => {
      const { container } = render(
        <AudioPlaylist tracks={[tracks[0]]} defaultPlayMode="repeat-all" />,
      );
      const audio = audioOf(container);
      audio.currentTime = 60;

      finish(audio);

      expect(audio.currentTime).toBe(0);
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalledOnce();
    });

    it("plays every track once per shuffle round", () => {
      const many = Array.from({ length: 6 }, (_, i) => ({ src: `/${i}.mp3`, title: `T${i}` }));
      const { container } = render(<AudioPlaylist tracks={many} defaultPlayMode="shuffle" />);

      const played = new Set([srcOf(container)]);
      for (let i = 0; i < 5; i++) {
        finish(audioOf(container));
        played.add(srcOf(container));
      }

      expect(played.size).toBe(6);
    });
  });

  describe("customisation", () => {
    it("localises mode and list labels alongside the player's", () => {
      render(
        <AudioPlaylist
          tracks={tracks}
          labels={{
            next: "अर्को",
            playMode: "मोड",
            modes: { sequential: "क्रमैसँग" },
            tracks: "गीतहरू",
          }}
        />,
      );

      expect(screen.getByRole("button", { name: "अर्को" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "मोड: क्रमैसँग" })).toBeInTheDocument();
      expect(screen.getByRole("list", { name: "गीतहरू" })).toBeInTheDocument();
    });

    it("forwards a ref to the audio element", () => {
      const ref = createRef<HTMLAudioElement>();
      const { container } = render(<AudioPlaylist tracks={tracks} ref={ref} />);

      expect(ref.current).toBe(audioOf(container));
    });

    it("keeps the volume across tracks", async () => {
      const user = userEvent.setup();
      const { container } = render(<AudioPlaylist tracks={tracks} />);
      fireEvent.change(screen.getByRole("slider", { name: "Volume" }), {
        target: { value: "30" },
      });

      await user.click(screen.getByRole("button", { name: "Next track" }));

      expect(audioOf(container).volume).toBe(0.3);
      expect(screen.getByRole("slider", { name: "Volume" })).toHaveValue("30");
    });
  });
});
