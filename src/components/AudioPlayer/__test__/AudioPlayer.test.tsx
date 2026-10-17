import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AudioPlayer } from "../AudioPlayer";
import { audioOf, loadMetadata, timeUpdate, installMediaStubs } from "./mediaStubs";

installMediaStubs();

describe("AudioPlayer", () => {
  describe("semantics", () => {
    it("is a group named after the track", () => {
      render(<AudioPlayer src="/track.mp3" title="Morning Raga" />);

      expect(screen.getByRole("group", { name: "Morning Raga" })).toBeInTheDocument();
    });

    it("falls back to a generic name without a string title", () => {
      render(<AudioPlayer src="/track.mp3" />);

      expect(screen.getByRole("group", { name: "Audio player" })).toBeInTheDocument();
    });

    it("renders a native audio element without its own controls", () => {
      const { container } = render(<AudioPlayer src="/track.mp3" />);

      const audio = audioOf(container);
      expect(audio).toHaveAttribute("src", "/track.mp3");
      expect(audio).not.toHaveAttribute("controls");
    });

    it("shows the title and subtitle", () => {
      render(<AudioPlayer src="/track.mp3" title="Morning Raga" subtitle="Episode 4" />);

      expect(screen.getByText("Morning Raga")).toBeInTheDocument();
      expect(screen.getByText("Episode 4")).toBeInTheDocument();
    });

    it("exposes seek and volume sliders", () => {
      render(<AudioPlayer src="/track.mp3" />);

      expect(screen.getByRole("slider", { name: "Seek" })).toBeInTheDocument();
      expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
    });
  });

  describe("play and pause", () => {
    it("starts with a play button", () => {
      render(<AudioPlayer src="/track.mp3" />);

      expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    });

    it("plays on click and becomes a pause button", async () => {
      const user = userEvent.setup();
      const { container } = render(<AudioPlayer src="/track.mp3" />);

      await user.click(screen.getByRole("button", { name: "Play" }));

      expect(HTMLMediaElement.prototype.play).toHaveBeenCalledOnce();
      expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
      expect(container.querySelector(".sh-audio")).toHaveClass("sh-audio--playing");
    });

    it("pauses on a second click", async () => {
      const user = userEvent.setup();
      render(<AudioPlayer src="/track.mp3" />);

      await user.click(screen.getByRole("button", { name: "Play" }));
      await user.click(screen.getByRole("button", { name: "Pause" }));

      expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledOnce();
      expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    });

    it("follows the element when something else plays it", () => {
      // The element is the source of truth, not the button.
      const { container } = render(<AudioPlayer src="/track.mp3" />);

      fireEvent.play(audioOf(container));

      expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    });

    it("returns to play when the track ends", () => {
      const { container } = render(<AudioPlayer src="/track.mp3" />);
      const audio = audioOf(container);

      fireEvent.play(audio);
      fireEvent.ended(audio);

      expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    });

    it("swallows a rejected play()", async () => {
      // Autoplay policy rejects play(); that mustn't surface as an unhandled
      // rejection or flip the button to "Pause".
      vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(
        new DOMException("Blocked", "NotAllowedError"),
      );
      const user = userEvent.setup();
      render(<AudioPlayer src="/track.mp3" />);

      await user.click(screen.getByRole("button", { name: "Play" }));

      expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    });

    it("still calls the consumer's media handlers", async () => {
      const onPlay = vi.fn();
      const onPause = vi.fn();
      const user = userEvent.setup();
      render(<AudioPlayer src="/track.mp3" onPlay={onPlay} onPause={onPause} />);

      await user.click(screen.getByRole("button", { name: "Play" }));
      await user.click(screen.getByRole("button", { name: "Pause" }));

      expect(onPlay).toHaveBeenCalledOnce();
      expect(onPause).toHaveBeenCalledOnce();
    });
  });

  describe("time and seeking", () => {
    it("shows placeholders and disables seeking before metadata loads", () => {
      render(<AudioPlayer src="/track.mp3" />);

      expect(screen.getByText("--:--")).toBeInTheDocument();
      expect(screen.getByRole("slider", { name: "Seek" })).toBeDisabled();
    });

    it("shows the duration once known", () => {
      const { container } = render(<AudioPlayer src="/track.mp3" />);

      loadMetadata(audioOf(container), 225);

      expect(screen.getByText("3:45")).toBeInTheDocument();
      const seekBar = screen.getByRole("slider", { name: "Seek" });
      expect(seekBar).toBeEnabled();
      expect(seekBar).toHaveAttribute("max", "225");
    });

    it("tracks the playback position", () => {
      const { container } = render(<AudioPlayer src="/track.mp3" />);
      const audio = audioOf(container);
      loadMetadata(audio, 225);

      timeUpdate(audio, 42);

      expect(screen.getByText("0:42")).toBeInTheDocument();
      expect(screen.getByRole("slider", { name: "Seek" })).toHaveValue("42");
    });

    it("announces position against duration", () => {
      const { container } = render(<AudioPlayer src="/track.mp3" />);
      const audio = audioOf(container);
      loadMetadata(audio, 225);

      timeUpdate(audio, 42);

      expect(screen.getByRole("slider", { name: "Seek" })).toHaveAttribute(
        "aria-valuetext",
        "0:42 of 3:45",
      );
    });

    it("seeks the element when the bar moves", () => {
      const { container } = render(<AudioPlayer src="/track.mp3" />);
      const audio = audioOf(container);
      loadMetadata(audio, 225);

      fireEvent.change(screen.getByRole("slider", { name: "Seek" }), {
        target: { value: "100" },
      });

      expect(audio.currentTime).toBe(100);
      // Without waiting for timeupdate.
      expect(screen.getByText("1:40")).toBeInTheDocument();
    });

    it("can't seek a live stream", () => {
      const { container } = render(<AudioPlayer src="/live" />);

      loadMetadata(audioOf(container), Number.POSITIVE_INFINITY);

      expect(screen.getByRole("slider", { name: "Seek" })).toBeDisabled();
    });
  });

  describe("volume", () => {
    it("starts at full volume", () => {
      render(<AudioPlayer src="/track.mp3" />);

      expect(screen.getByRole("slider", { name: "Volume" })).toHaveValue("100");
    });

    it("honours defaultVolume", () => {
      const { container } = render(<AudioPlayer src="/track.mp3" defaultVolume={0.4} />);

      expect(audioOf(container).volume).toBe(0.4);
      expect(screen.getByRole("slider", { name: "Volume" })).toHaveValue("40");
    });

    it("sets the element's volume from the slider", () => {
      const { container } = render(<AudioPlayer src="/track.mp3" />);

      fireEvent.change(screen.getByRole("slider", { name: "Volume" }), {
        target: { value: "25" },
      });

      expect(audioOf(container).volume).toBe(0.25);
      expect(screen.getByRole("slider", { name: "Volume" })).toHaveAttribute(
        "aria-valuetext",
        "25%",
      );
    });

    it("mutes and unmutes", async () => {
      const user = userEvent.setup();
      const { container } = render(<AudioPlayer src="/track.mp3" />);

      await user.click(screen.getByRole("button", { name: "Mute" }));

      expect(audioOf(container).muted).toBe(true);
      expect(screen.getByRole("button", { name: "Unmute" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(screen.getByRole("slider", { name: "Volume" })).toHaveValue("0");

      await user.click(screen.getByRole("button", { name: "Unmute" }));

      expect(audioOf(container).muted).toBe(false);
      expect(screen.getByRole("slider", { name: "Volume" })).toHaveValue("100");
    });

    it("unmutes when the volume is raised", async () => {
      const user = userEvent.setup();
      const { container } = render(<AudioPlayer src="/track.mp3" />);
      await user.click(screen.getByRole("button", { name: "Mute" }));

      fireEvent.change(screen.getByRole("slider", { name: "Volume" }), {
        target: { value: "50" },
      });

      expect(audioOf(container).muted).toBe(false);
      expect(screen.getByRole("button", { name: "Mute" })).toBeInTheDocument();
    });

    it("follows volume changes made elsewhere", () => {
      const { container } = render(<AudioPlayer src="/track.mp3" />);
      const audio = audioOf(container);

      audio.volume = 0.6;
      fireEvent.volumeChange(audio);

      expect(screen.getByRole("slider", { name: "Volume" })).toHaveValue("60");
    });

    it("can be hidden", () => {
      render(<AudioPlayer src="/track.mp3" hideVolume />);

      expect(screen.queryByRole("slider", { name: "Volume" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Mute" })).not.toBeInTheDocument();
    });
  });

  describe("errors", () => {
    it("replaces the controls with a message when the source fails", () => {
      const { container } = render(<AudioPlayer src="/missing.mp3" />);

      fireEvent.error(audioOf(container));

      expect(screen.getByRole("alert")).toHaveTextContent("This audio couldn't be loaded.");
      expect(screen.queryByRole("slider", { name: "Seek" })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Play" })).toBeDisabled();
      expect(container.querySelector(".sh-audio")).toHaveClass("sh-audio--error");
    });

    it("recovers once a source loads", () => {
      const { container } = render(<AudioPlayer src="/missing.mp3" />);
      const audio = audioOf(container);

      fireEvent.error(audio);
      loadMetadata(audio, 60);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByRole("slider", { name: "Seek" })).toBeEnabled();
    });
  });

  describe("track controls", () => {
    it("has no skip buttons by default", () => {
      render(<AudioPlayer src="/track.mp3" />);

      expect(screen.queryByRole("button", { name: "Previous track" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Next track" })).not.toBeInTheDocument();
    });

    it("renders Previous and Next when given handlers", async () => {
      const onPrevious = vi.fn();
      const onNext = vi.fn();
      const user = userEvent.setup();
      render(<AudioPlayer src="/track.mp3" onPrevious={onPrevious} onNext={onNext} />);

      await user.click(screen.getByRole("button", { name: "Previous track" }));
      await user.click(screen.getByRole("button", { name: "Next track" }));

      expect(onPrevious).toHaveBeenCalledOnce();
      expect(onNext).toHaveBeenCalledOnce();
    });

    it("renders extra actions in the control row", () => {
      render(<AudioPlayer src="/track.mp3" actions={<button type="button">Shuffle</button>} />);

      expect(screen.getByRole("button", { name: "Shuffle" })).toBeInTheDocument();
    });

    it("resets position, length, and errors when the source changes", () => {
      const { container, rerender } = render(<AudioPlayer src="/one.mp3" />);
      const audio = audioOf(container);
      loadMetadata(audio, 225);
      fireEvent.play(audio);
      timeUpdate(audio, 42);

      rerender(<AudioPlayer src="/two.mp3" />);

      expect(screen.getByRole("slider", { name: "Seek" })).toBeDisabled();
      expect(screen.getByText("0:00")).toBeInTheDocument();
      expect(screen.getByText("--:--")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    });
  });

  describe("customisation", () => {
    it("localises the labels", () => {
      render(
        <AudioPlayer
          src="/track.mp3"
          labels={{ play: "बजाउनुहोस्", seek: "खोज्नुहोस्", volume: "आवाज", mute: "मौन" }}
        />,
      );

      expect(screen.getByRole("button", { name: "बजाउनुहोस्" })).toBeInTheDocument();
      expect(screen.getByRole("slider", { name: "खोज्नुहोस्" })).toBeInTheDocument();
      expect(screen.getByRole("slider", { name: "आवाज" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "मौन" })).toBeInTheDocument();
    });

    it("forwards a ref to the audio element", () => {
      const ref = createRef<HTMLAudioElement>();
      const { container } = render(<AudioPlayer src="/track.mp3" ref={ref} />);

      expect(ref.current).toBe(audioOf(container));
    });

    it("puts className on the wrapper", () => {
      const { container } = render(<AudioPlayer src="/track.mp3" className="custom" />);

      expect(container.querySelector(".sh-audio")).toHaveClass("custom");
    });

    it("forwards native audio attributes", () => {
      const { container } = render(<AudioPlayer src="/track.mp3" loop preload="none" />);

      const audio = audioOf(container);
      expect(audio).toHaveAttribute("loop");
      expect(audio).toHaveAttribute("preload", "none");
    });
  });
});
