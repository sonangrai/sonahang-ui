import { useEffect, useState } from "react";

import type { ColorTheme } from "../tokens/colors";

const STORAGE_KEY = "sonahang-ui:theme";

/**
 * `system` leaves `data-theme` off the root, which is what
 * colors.semantic.css keys its `prefers-color-scheme` block on.
 */
export type ThemeChoice = ColorTheme | "system";

const isThemeChoice = (value: string | null): value is ThemeChoice =>
  value === "light" || value === "dark" || value === "system";

const readStoredTheme = (): ThemeChoice => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isThemeChoice(stored) ? stored : "system";
  } catch {
    // Private mode, or storage disabled — the default is fine.
    return "system";
  }
};

/**
 * Theme toggle for the landing page. The library itself needs no provider:
 * every component reads semantic CSS vars, so flipping the attribute on
 * `<html>` re-themes the whole page.
 */
export function useTheme() {
  const [theme, setTheme] = useState<ThemeChoice>(readStoredTheme);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "system") {
      delete root.dataset.theme;
    } else {
      root.dataset.theme = theme;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Not being able to remember the choice shouldn't break setting it.
    }
  }, [theme]);

  return [theme, setTheme] as const;
}
