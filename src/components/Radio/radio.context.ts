import { createContext } from "react";

export type RadioGroupContextValue = {
  /** Shared `name`, which is what makes the browser treat them as one group. */
  name: string;
  /** Currently selected value in the group. */
  value?: string;
  /** Called with the newly selected value. */
  onSelect: (value: string) => void;
  /** Set when the whole group is disabled. */
  disabled?: boolean;
};

/**
 * Lets `RadioGroup` coordinate its `Radio` children without cloning them.
 * A `Radio` used outside a group falls back to its own props.
 * Kept in its own module so the component files only export components
 * (see the react-refresh rule in eslint.config.js).
 */
export const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(undefined);
