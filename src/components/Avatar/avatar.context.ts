import { createContext } from "react";

import type { AvatarSize } from "./avatar.tokens";

/**
 * Lets `AvatarGroup` set the size for every avatar it contains without
 * cloning children. An explicit `size` on an individual `Avatar` still wins.
 * Kept in its own module so the component files only export components
 * (see the react-refresh rule in eslint.config.js).
 */
export const AvatarSizeContext = createContext<AvatarSize | undefined>(undefined);
