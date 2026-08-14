import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/*
 * The field is an invisible input laid over the boxes, and whether a click
 * reaches it is decided entirely by CSS. jsdom does no layout and no
 * hit-testing — `user.click(input)` there targets the element directly, which
 * a real pointer never gets to do — so these check the rules instead.
 */
const css = readFileSync(path.join(import.meta.dirname, "../InputOtp.css"), "utf8");

/**
 * Everything declared for a selector across the stylesheet, later wins.
 *
 * Merged rather than taken from the first match, because these selectors
 * appear more than once — most of them share the `box-sizing` rule at the top
 * of the file, and matching only that block would report a rule as empty.
 */
const propertiesIn = (selector: string): Record<string, string> => {
  const pattern = new RegExp(`^${selector.replace(/[.[\]]/g, "\\$&")} \\{([^}]*)\\}`, "gm");
  const blocks = [...css.matchAll(pattern)];
  if (blocks.length === 0) throw new Error(`No top-level rule found for ${selector}`);

  return Object.fromEntries(
    blocks.flatMap((block) =>
      [...block[1].matchAll(/^\s*([a-z-]+)\s*:\s*([^;]+);/gm)].map(
        (declaration) => [declaration[1], declaration[2].trim()] as const,
      ),
    ),
  );
};

describe("InputOtp.css", () => {
  it("lets clicks through the boxes to the input beneath", () => {
    /*
     * Each slot is `position: relative` for its caret, which makes it a
     * positioned element painting in tree order — after the input, so on top
     * of it. Without this the boxes swallow every click and only the gaps
     * between them focus the field.
     */
    expect(propertiesIn(".sh-input-otp__boxes")["pointer-events"]).toBe("none");
  });

  it("keeps the slots positioned, which is what causes that", () => {
    // If this ever stops being true the rule above is still harmless, but the
    // reasoning behind it no longer holds and should be revisited.
    expect(propertiesIn(".sh-input-otp__slot").position).toBe("relative");
  });

  it("stretches the input over the whole row", () => {
    const control = propertiesIn(".sh-input-otp__control");

    expect(control.position).toBe("absolute");
    expect(control.inset).toBe("0");
  });

  it("keeps the input focusable rather than hiding it", () => {
    // `display: none` or `visibility: hidden` would take it out of the tab
    // order and the accessibility tree; only its paint is suppressed.
    const control = propertiesIn(".sh-input-otp__control");

    expect(control.opacity).toBe("0");
    expect(control.display).toBeUndefined();
    expect(control.visibility).toBeUndefined();
  });
});
