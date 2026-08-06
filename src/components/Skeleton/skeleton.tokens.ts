export const skeletonVariants = ["text", "rectangular", "circular"] as const;

export type SkeletonVariant = (typeof skeletonVariants)[number];

export const skeletonAnimations = ["pulse", "wave", "none"] as const;

export type SkeletonAnimation = (typeof skeletonAnimations)[number];
