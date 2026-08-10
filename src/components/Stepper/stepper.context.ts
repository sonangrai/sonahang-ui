import { createContext, useContext } from "react";

export type StepperOrientation = "horizontal" | "vertical";

/** Derived from position against `activeStep`, unless a step overrides it. */
export type StepStatus = "complete" | "current" | "upcoming" | "error";

export type StepContextValue = {
  /** Zero-based position, used for the default indicator number. */
  index: number;
  /** True for the final step, which has no connector after it. */
  isLast: boolean;
  status: StepStatus;
  orientation: StepperOrientation;
};

export const StepContext = createContext<StepContextValue | undefined>(undefined);

/** Reads the surrounding `Stepper`, failing loudly rather than silently. */
export function useStepContext(component: string): StepContextValue {
  const context = useContext(StepContext);

  if (!context) {
    throw new Error(`<${component}> must be rendered inside <Stepper>.`);
  }

  return context;
}
