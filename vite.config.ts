/// <reference types="vitest/config" />
import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const dirname = import.meta.dirname;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Separate from build:lib's `dist` (the published npm package) and
    // from Storybook's own output — this is the landing-page app build,
    // deployed to Vercel with the Storybook build nested under it.
    outDir: "site-dist",
    sourcemap: false,
  },
  test: {
    // Component unit tests, colocated in `__test__` folders next to the
    // component. Plain jsdom — no browser, no Playwright.
    environment: "jsdom",
    include: ["src/**/__test__/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: [path.join(dirname, "src/test/setup.ts")],
  },
});
