import { createContext, useContext } from "react";

/** `single` closes the open item when another opens; `multiple` doesn't. */
export type AccordionType = "single" | "multiple";

/** Heading rank the triggers are wrapped in, to fit the page outline. */
export type AccordionHeadingLevel = 2 | 3 | 4 | 5 | 6;

export type AccordionContextValue = {
  /** Values of the currently open items. */
  value: string[];
  /** Opens or closes one item, applying the single/multiple rule. */
  toggle: (value: string) => void;
  baseId: string;
  headingLevel: AccordionHeadingLevel;
};

export const AccordionContext = createContext<AccordionContextValue | undefined>(undefined);

/** Reads the surrounding `Accordion`, failing loudly rather than silently. */
export function useAccordionContext(component: string): AccordionContextValue {
  const context = useContext(AccordionContext);

  if (!context) {
    throw new Error(`<${component}> must be rendered inside <Accordion>.`);
  }

  return context;
}

/** Ids are derived rather than registered, so trigger and panel always agree. */
export const triggerId = (baseId: string, value: string) => `${baseId}-trigger-${value}`;
export const panelId = (baseId: string, value: string) => `${baseId}-panel-${value}`;
