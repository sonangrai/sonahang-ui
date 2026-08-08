import { createContext, useContext } from "react";

export type TabsOrientation = "horizontal" | "vertical";

/**
 * `automatic` selects a tab as soon as it's focused — the ARIA-preferred
 * behaviour when panels are cheap to render. `manual` moves focus with the
 * arrow keys and only selects on Enter/Space, which is what you want when
 * switching panels is expensive.
 */
export type TabsActivation = "automatic" | "manual";

export type TabsContextValue = {
  /** Value of the currently selected tab. */
  value: string | undefined;
  /** Selects a tab by value. */
  select: (value: string) => void;
  /** Prefix for the generated tab/panel ids that tie the two together. */
  baseId: string;
  orientation: TabsOrientation;
  activation: TabsActivation;
};

export const TabsContext = createContext<TabsContextValue | undefined>(undefined);

/** Reads the surrounding `Tabs` context, failing loudly rather than silently. */
export function useTabsContext(component: string): TabsContextValue {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error(`<${component}> must be rendered inside <Tabs>.`);
  }

  return context;
}

/** Ids are derived rather than registered, so tab and panel always agree. */
export const tabId = (baseId: string, value: string) => `${baseId}-tab-${value}`;
export const panelId = (baseId: string, value: string) => `${baseId}-panel-${value}`;
