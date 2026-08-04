import { createContext } from "react";

export type CheckboxGroupContextValue = {
  /** Shared `name`, so the options submit together as one field. */
  name: string;
  /** Currently selected values. Checkboxes are multi-select, unlike radios. */
  value: string[];
  /** Called with the option's value when it's toggled on or off. */
  onToggle: (value: string, checked: boolean) => void;
  /** Set when the whole group is disabled. */
  disabled?: boolean;
};

/**
 * Lets `CheckboxGroup` coordinate its `Checkbox` children without cloning
 * them. A `Checkbox` used outside a group falls back to its own props.
 * Kept in its own module so the component files only export components
 * (see the react-refresh rule in eslint.config.js).
 */
export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | undefined>(
  undefined,
);
