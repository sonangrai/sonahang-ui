/** Edge the drawer is anchored to and slides in from. */
export const drawerSides = ["left", "right", "top", "bottom"] as const;

export type DrawerSide = (typeof drawerSides)[number];

/**
 * Extent along the drawer's own axis — width for `left`/`right`, height for
 * `top`/`bottom`. Always capped at the viewport, so `sm` on a narrow phone is
 * simply full-bleed rather than overflowing.
 */
export const drawerSizes = ["sm", "md", "lg", "full"] as const;

export type DrawerSize = (typeof drawerSizes)[number];
