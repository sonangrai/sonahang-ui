import { fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

/*
 * jsdom has no media pipeline: play() and pause() aren't implemented and
 * duration is always NaN. These stubs stand in for the browser — they flip
 * `paused` and fire the same events a real element would, which is all the
 * components listen to.
 */
let pausedState = new WeakMap<HTMLMediaElement, boolean>();

/** Call once at the top of a test file. */
export function installMediaStubs() {
  beforeEach(() => {
    pausedState = new WeakMap();

    vi.spyOn(HTMLMediaElement.prototype, "paused", "get").mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      return pausedState.get(this) ?? true;
    });
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      pausedState.set(this, false);
      fireEvent.play(this);
      return Promise.resolve();
    });
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      pausedState.set(this, true);
      fireEvent.pause(this);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
}

export const audioOf = (container: HTMLElement) =>
  container.querySelector("audio") as HTMLAudioElement;

/** What the browser does once it has read the file's header. */
export const loadMetadata = (audio: HTMLAudioElement, duration: number) => {
  Object.defineProperty(audio, "duration", { configurable: true, value: duration });
  fireEvent.loadedMetadata(audio);
};

export const timeUpdate = (audio: HTMLAudioElement, time: number) => {
  audio.currentTime = time;
  fireEvent.timeUpdate(audio);
};

/** A track playing to its end, as the browser reports it. */
export const finish = (audio: HTMLAudioElement) => {
  pausedState.set(audio, true);
  fireEvent.pause(audio);
  fireEvent.ended(audio);
};
