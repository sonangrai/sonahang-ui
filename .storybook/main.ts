import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp",
    "@storybook/addon-themes"
  ],
  "framework": "@storybook/react-vite",
  // Serve `public/` under /brand rather than at the root: Storybook ships
  // its own /favicon.svg, which would otherwise shadow ours.
  "staticDirs": [{ from: "../public", to: "/brand" }],
  // Storybook has no option for the manager's favicon, so set it here.
  // (The tab *title* is not configurable — the manager rewrites it to
  // "<story> ⋅ Storybook" at runtime, so a <title> tag here has no effect.)
  "managerHead": (head) => `
    ${head}
    <link rel="icon" type="image/svg+xml" href="./brand/favicon.svg" />
  `
};
export default config;
