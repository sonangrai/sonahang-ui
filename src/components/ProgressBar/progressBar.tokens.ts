export const progressBarSizes = ["sm", "md", "lg"] as const;

export type ProgressBarSize = (typeof progressBarSizes)[number];
