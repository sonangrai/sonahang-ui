export const tagVariants = ["primary", "secondary", "outline"] as const;

export type TagVariant = (typeof tagVariants)[number];
