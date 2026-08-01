import { addons } from "storybook/manager-api";
import { themes } from "storybook/theming";

addons.setConfig({
  theme: {
    ...themes.normal,
    // `brandTitle` is rendered as raw HTML *only* when `brandImage` is unset —
    // setting brandImage replaces the text entirely and demotes brandTitle to
    // alt text. Inlining the <img> here is what shows the logo *and* the name.
    brandTitle: `
      <img src="./brand/favicon.svg" alt="sonahang-ui" width="24" height="24" />
      <span style="margin-left: 1em"> Storybook | sonahang-ui</span>
    `,
    brandUrl: "/",
    brandTarget: "_self",
  },
});
