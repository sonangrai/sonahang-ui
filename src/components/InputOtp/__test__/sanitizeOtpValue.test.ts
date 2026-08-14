import { describe, expect, it } from "vitest";

import { sanitizeOtpValue } from "../sanitizeOtpValue";

describe("sanitizeOtpValue", () => {
  describe("numeric", () => {
    it("keeps digits", () => {
      expect(sanitizeOtpValue("123456", { length: 6 })).toBe("123456");
    });

    it("drops letters", () => {
      expect(sanitizeOtpValue("1a2b3c", { length: 6 })).toBe("123");
    });

    it("drops the punctuation a copied code carries", () => {
      expect(sanitizeOtpValue("123-456", { length: 6 })).toBe("123456");
    });

    it("drops surrounding whitespace", () => {
      expect(sanitizeOtpValue("  123456\n", { length: 6 })).toBe("123456");
    });
  });

  describe("alphanumeric", () => {
    it("keeps letters and digits", () => {
      expect(sanitizeOtpValue("A1b2", { length: 6, type: "alphanumeric" })).toBe("A1b2");
    });

    it("preserves case", () => {
      // Whether a code is case-sensitive is the server's business; upper-casing
      // here would quietly change what gets submitted.
      expect(sanitizeOtpValue("abcDEF", { length: 6, type: "alphanumeric" })).toBe("abcDEF");
    });

    it("still drops symbols", () => {
      expect(sanitizeOtpValue("A-1_B", { length: 6, type: "alphanumeric" })).toBe("A1B");
    });
  });

  describe("length", () => {
    it("truncates past the length", () => {
      expect(sanitizeOtpValue("1234567890", { length: 4 })).toBe("1234");
    });

    it("counts only the characters it keeps", () => {
      // The cap applies after filtering, or "12-34-56" would be cut short.
      expect(sanitizeOtpValue("12-34-56", { length: 6 })).toBe("123456");
    });

    it("allows a short value", () => {
      expect(sanitizeOtpValue("12", { length: 6 })).toBe("12");
    });

    it("returns nothing for a length of zero", () => {
      expect(sanitizeOtpValue("123", { length: 0 })).toBe("");
    });

    it("returns nothing for a negative length", () => {
      expect(sanitizeOtpValue("123", { length: -1 })).toBe("");
    });
  });

  it("returns an empty string for an empty input", () => {
    expect(sanitizeOtpValue("", { length: 6 })).toBe("");
  });

  it("returns an empty string when nothing is allowed through", () => {
    expect(sanitizeOtpValue("abc", { length: 6 })).toBe("");
  });

  it("does not split a multi-byte character into halves", () => {
    // Iterating by code point, so no surrogate half can slip past the filter.
    expect(sanitizeOtpValue("1🎉2", { length: 6 })).toBe("12");
  });
});
