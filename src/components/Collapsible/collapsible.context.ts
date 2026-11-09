import { createContext, useContext } from "react";
import type { ReactNode } from "react";

export type CollapsibleContextValue = {
  /** Values of every open item, across all levels. */
  value: string[];
  /** Opens or closes one item. */
  toggle: (value: string) => void;
  baseId: string;
  /** Indicator shown on open items, when overridden. */
  expandedIcon?: ReactNode;
  /** Indicator shown on closed items, when overridden. */
  collapsedIcon?: ReactNode;
};

export const CollapsibleContext = createContext<CollapsibleContextValue | undefined>(undefined);

/**
 * Nesting depth of the items currently rendering. Each open panel provides
 * `depth + 1` to whatever it contains, so items don't need a `level` prop.
 */
export const CollapsibleDepthContext = createContext(0);

/** Reads the surrounding `Collapsible`, failing loudly rather than silently. */
export function useCollapsibleContext(component: string): CollapsibleContextValue {
  const context = useContext(CollapsibleContext);

  if (!context) {
    throw new Error(`<${component}> must be rendered inside <Collapsible>.`);
  }

  return context;
}

/** Ids are derived rather than registered, so trigger and panel always agree. */
export const triggerId = (baseId: string, value: string) => `${baseId}-trigger-${value}`;
export const panelId = (baseId: string, value: string) => `${baseId}-panel-${value}`;
