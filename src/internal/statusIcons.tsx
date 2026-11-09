import type { ReactNode } from "react";

/**
 * Status icons and the dismiss glyph shared by Alert and Toast, so the two
 * always tell variants apart the same way.
 *
 * Not part of the public API.
 */
export type StatusVariant = "success" | "info" | "warning" | "error";

export const statusIcons: Record<StatusVariant, ReactNode> = {
  success: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" />
      <path d="M6.75 10.25l2.25 2.25 4.25-4.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 9v4.5" strokeLinecap="round" />
      <circle cx="10" cy="6.4" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <path d="M10 2.8 18 16.5H2L10 2.8Z" strokeLinejoin="round" />
      <path d="M10 8v3.5" strokeLinecap="round" />
      <circle cx="10" cy="13.9" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" />
      <path d="M7.5 7.5l5 5M12.5 7.5l-5 5" strokeLinecap="round" />
    </svg>
  ),
};

export const closeIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" strokeLinecap="round" />
  </svg>
);
