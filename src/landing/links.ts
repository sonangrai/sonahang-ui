/**
 * Every off-page destination the landing page points at, in one place —
 * the Storybook build is nested under the site (see vercel.json), so its
 * URL is a path rather than an absolute link.
 */

export const PACKAGE_NAME = "sonahang-ui";

/** Storybook, built by `build:site` into `site-dist/storybook`. */
export const STORYBOOK_URL = "/storybook/";

export const NPM_URL = `https://www.npmjs.com/package/${PACKAGE_NAME}`;

export const GITHUB_URL = "https://github.com/sonangrai/sonahang-ui";
