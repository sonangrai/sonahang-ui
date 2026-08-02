export const chipVariants = ["primary", "secondary", "outline"] as const;

export type ChipVariant = (typeof chipVariants)[number];

export const chipActions = ["add", "remove"] as const;

export type ChipAction = (typeof chipActions)[number];
