import { describe, expect, it } from "vitest";

import { dedentCode } from "../dedentCode";

describe("dedentCode", () => {
  it("strips the shared indent", () => {
    expect(dedentCode("    const a = 1;\n    const b = 2;")).toBe("const a = 1;\nconst b = 2;");
  });

  it("keeps relative indentation", () => {
    const source = `
      function greet() {
        return "hi";
      }
    `;

    expect(dedentCode(source)).toBe('function greet() {\n  return "hi";\n}');
  });

  it("drops the blank first and last lines a template literal adds", () => {
    expect(dedentCode("\nconst a = 1;\n")).toBe("const a = 1;");
  });

  it("drops several blank lines at each end", () => {
    expect(dedentCode("\n\n  a\n\n  \n")).toBe("a");
  });

  it("leaves already-flush code alone", () => {
    expect(dedentCode("const a = 1;\nconst b = 2;")).toBe("const a = 1;\nconst b = 2;");
  });

  it("ignores blank lines when measuring the shared indent", () => {
    // An interior empty line has no indentation at all; counting it would drag
    // the shared indent to zero and dedent nothing.
    const source = "    const a = 1;\n\n    const b = 2;";

    expect(dedentCode(source)).toBe("const a = 1;\n\nconst b = 2;");
  });

  it("measures against the least indented line", () => {
    const source = "      deep\n  shallow";

    expect(dedentCode(source)).toBe("    deep\nshallow");
  });

  it("normalises CRLF endings", () => {
    expect(dedentCode("  a\r\n  b")).toBe("a\nb");
  });

  it("returns an empty string for nothing but blank lines", () => {
    expect(dedentCode("\n   \n\n")).toBe("");
  });

  it("returns an empty string for an empty input", () => {
    expect(dedentCode("")).toBe("");
  });

  it("handles a single line", () => {
    expect(dedentCode("  just one")).toBe("just one");
  });

  it("preserves trailing content on the last line", () => {
    expect(dedentCode("  a\n  b  ")).toBe("a\nb  ");
  });
});
