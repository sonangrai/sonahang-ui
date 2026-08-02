import { describe, expect, it } from "vitest";

import { getInitials } from "../getInitials";

describe("getInitials", () => {
  it("takes the first letter of two words", () => {
    expect(getInitials("Ada Lovelace")).toBe("AL");
  });

  it("takes a single letter from a single word", () => {
    expect(getInitials("Ada")).toBe("A");
  });

  it("uses the first and last word when there are more than two", () => {
    expect(getInitials("Ada B. Lovelace")).toBe("AL");
  });

  it("collapses extra whitespace", () => {
    expect(getInitials("  Ada   Lovelace  ")).toBe("AL");
  });

  it("uppercases lowercase names", () => {
    expect(getInitials("ada lovelace")).toBe("AL");
  });

  it("returns an empty string for blank input", () => {
    expect(getInitials("")).toBe("");
    expect(getInitials("   ")).toBe("");
  });
});
