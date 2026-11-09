export const toastVariants = [
  "default",
  "success",
  "info",
  "warning",
  "error",
  "loading",
] as const;

export type ToastVariant = (typeof toastVariants)[number];

export const toastPositions = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
] as const;

export type ToastPosition = (typeof toastPositions)[number];
