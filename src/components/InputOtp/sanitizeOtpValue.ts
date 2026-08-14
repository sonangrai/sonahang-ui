export const otpTypes = ["numeric", "alphanumeric"] as const;

export type OtpType = (typeof otpTypes)[number];

const ALLOWED: Record<OtpType, RegExp> = {
  numeric: /[0-9]/,
  alphanumeric: /[a-zA-Z0-9]/,
};

export type SanitizeOtpValueOptions = {
  /** Number of characters the code holds. */
  length: number;
  /** Which characters survive. Defaults to `numeric`. */
  type?: OtpType;
};

/**
 * Keeps only the characters an OTP field accepts, capped at its length.
 *
 * Runs over everything that reaches the field — typing, pasting, and the
 * controlled `value` — so a pasted "123-456", a code copied with trailing
 * whitespace, and a stray letter all land as the same clean string.
 *
 * Case is preserved for `alphanumeric`: upper-casing here would quietly
 * change what the user submits, and whether a code is case-sensitive is the
 * server's business, not this component's.
 */
export function sanitizeOtpValue(
  raw: string,
  { length, type = "numeric" }: SanitizeOtpValueOptions,
): string {
  // No guard for a length of zero or less: the cap below already stops before
  // the first character, so an explicit check would never change the result.
  const allowed = ALLOWED[type];
  let result = "";

  // Iterating the string yields whole code points, so an emoji pasted in
  // can't be split into halves that individually pass the test.
  for (const character of raw) {
    if (result.length >= length) break;
    if (allowed.test(character)) result += character;
  }

  return result;
}
