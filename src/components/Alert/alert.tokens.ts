export const alertVariants = ["success", "info", "warning", "error"] as const;

export type AlertVariant = (typeof alertVariants)[number];
