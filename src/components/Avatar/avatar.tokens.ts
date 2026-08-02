export const avatarSizes = ["sm", "md", "lg"] as const;

export type AvatarSize = (typeof avatarSizes)[number];
