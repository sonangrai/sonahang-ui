import { createContext, useContext } from "react";
import type { ReactNode } from "react";

export type BreadcrumbContextValue = {
  /** True for the trailing crumb, which is the current page. */
  isLast: boolean;
  /** Rendered between crumbs. Decorative — always `aria-hidden`. */
  separator: ReactNode;
};

export const BreadcrumbContext = createContext<BreadcrumbContextValue | undefined>(undefined);

/** Reads the surrounding `Breadcrumb`, failing loudly rather than silently. */
export function useBreadcrumbContext(component: string): BreadcrumbContextValue {
  const context = useContext(BreadcrumbContext);

  if (!context) {
    throw new Error(`<${component}> must be rendered inside <Breadcrumb>.`);
  }

  return context;
}
