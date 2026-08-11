export const dialogSizes = ["sm", "md", "lg", "fullscreen"] as const;

export type DialogSize = (typeof dialogSizes)[number];

/**
 * `alertdialog` tells assistive tech the content is urgent and needs a
 * response — reserve it for confirmations and destructive warnings.
 */
export const dialogRoles = ["dialog", "alertdialog"] as const;

export type DialogRole = (typeof dialogRoles)[number];
