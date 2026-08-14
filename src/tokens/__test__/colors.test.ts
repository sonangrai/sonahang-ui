import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { palette, semanticColors } from "../colors";

/*
 * colors.ts is a hand-written mirror of the two stylesheets, so nothing stops
 * the three files from drifting. These tests re-read the CSS, resolve the
 * `var()` aliases back to hex, and compare the whole set both ways — a token
 * added to the CSS and forgotten in TS fails just as loudly as a wrong value.
 */

// Not `import.meta.url` — under jsdom that's an http:// URL, not a file path.
const read = (file: string) =>
  readFileSync(path.join(import.meta.dirname, "..", file), "utf8");

const primitivesCss = read("colors.css");
const semanticCss = read("colors.semantic.css");

/** The declarations of one rule, keyed without the `--color-` prefix. */
const declarationsOf = (css: string, selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rule = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`).exec(css);
  if (!rule) throw new Error(`No \`${selector}\` rule found`);

  return new Map(
    [...rule[1].matchAll(/--color-([\w-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [
      name,
      value.trim(),
    ]),
  );
};

const primitives = declarationsOf(primitivesCss, ":root");

const resolve = (value: string) => {
  const alias = /^var\(--color-([\w-]+)\)$/.exec(value);
  if (!alias) return value;

  const target = primitives.get(alias[1]);
  if (!target) throw new Error(`\`${value}\` points at a primitive that doesn't exist`);
  return target;
};

const resolveAll = (declarations: Map<string, string>) =>
  Object.fromEntries([...declarations].map(([name, value]) => [name, resolve(value)]));

/* Dark only overrides what changes; everything else falls through from :root. */
const light = resolveAll(declarationsOf(semanticCss, ":root"));
const dark = { ...light, ...resolveAll(declarationsOf(semanticCss, ":root[data-theme='dark']")) };

describe("primitive scales", () => {
  it("match colors.css", () => {
    const fromCss = Object.fromEntries(
      Object.entries(palette).map(([scale, steps]) => [
        scale,
        Object.fromEntries(
          Object.keys(steps).map((step) => [step, primitives.get(`${scale}-${step}`)]),
        ),
      ]),
    );

    expect(fromCss).toEqual(palette);
  });

  it("cover every primitive the CSS defines", () => {
    const declared = [...primitives.keys()].sort();
    const mirrored = Object.entries(palette)
      .flatMap(([scale, steps]) => Object.keys(steps).map((step) => `${scale}-${step}`))
      .sort();

    expect(mirrored).toEqual(declared);
  });
});

describe("semantic tokens", () => {
  it("match the light theme", () => {
    expect(semanticColors.light).toEqual(light);
  });

  it("match the dark theme", () => {
    expect(semanticColors.dark).toEqual(dark);
  });
});
