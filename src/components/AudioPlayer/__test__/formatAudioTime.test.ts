import { describe, expect, it } from "vitest";

import { formatAudioTime } from "../formatAudioTime";

describe("formatAudioTime", () => {
  it("formats zero", () => {
    expect(formatAudioTime(0)).toBe("0:00");
  });

  it("pads seconds to two digits", () => {
    expect(formatAudioTime(7)).toBe("0:07");
  });

  it("formats minutes and seconds", () => {
    expect(formatAudioTime(225)).toBe("3:45");
  });

  it("does not pad minutes under an hour", () => {
    expect(formatAudioTime(59 * 60 + 59)).toBe("59:59");
  });

  it("adds hours and pads minutes past an hour", () => {
    expect(formatAudioTime(3600 + 5 * 60 + 9)).toBe("1:05:09");
  });

  it("rounds down partial seconds", () => {
    // 0:59.9 is still 0:59 until it's actually a minute.
    expect(formatAudioTime(59.9)).toBe("0:59");
  });

  it("shows a placeholder for an unloaded duration", () => {
    expect(formatAudioTime(Number.NaN)).toBe("--:--");
  });

  it("shows a placeholder for a live stream", () => {
    expect(formatAudioTime(Number.POSITIVE_INFINITY)).toBe("--:--");
  });

  it("shows a placeholder for a negative value", () => {
    expect(formatAudioTime(-1)).toBe("--:--");
  });
});
