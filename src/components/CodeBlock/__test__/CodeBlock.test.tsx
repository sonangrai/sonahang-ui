import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CodeBlock } from "../CodeBlock";

const CODE = 'const greeting = "hi";\nconsole.log(greeting);';

const codeElement = () => document.querySelector(".sh-code-block__code") as HTMLElement;
const copyButton = () => screen.getByRole("button", { name: "Copy code" });

describe("CodeBlock", () => {
  describe("code", () => {
    it("renders the code", () => {
      render(<CodeBlock>{CODE}</CodeBlock>);

      expect(codeElement()).toHaveTextContent("const greeting =");
    });

    it("keeps the code in a pre so whitespace survives", () => {
      render(<CodeBlock>{CODE}</CodeBlock>);

      expect(codeElement().textContent).toBe(CODE);
    });

    it("strips the indentation a template literal picks up", () => {
      const { container } = render(
        <CodeBlock>{`
          const a = 1;
            const b = 2;
        `}</CodeBlock>,
      );

      expect(container.querySelector(".sh-code-block__code")?.textContent).toBe(
        "const a = 1;\n  const b = 2;",
      );
    });

    it("makes the code area focusable so it can be scrolled by keyboard", async () => {
      const user = userEvent.setup();
      render(<CodeBlock copyable={false}>{CODE}</CodeBlock>);

      await user.tab();

      expect(document.querySelector(".sh-code-block__pre")).toHaveFocus();
    });
  });

  describe("header", () => {
    it("shows the filename", () => {
      render(<CodeBlock filename="Button.tsx">{CODE}</CodeBlock>);

      expect(screen.getByText("Button.tsx")).toBeInTheDocument();
    });

    it("falls back to the language when there is no filename", () => {
      render(<CodeBlock language="tsx">{CODE}</CodeBlock>);

      expect(screen.getByText("tsx")).toBeInTheDocument();
    });

    it("prefers the filename over the language", () => {
      render(
        <CodeBlock filename="Button.tsx" language="tsx">
          {CODE}
        </CodeBlock>,
      );

      expect(screen.getByText("Button.tsx")).toBeInTheDocument();
      expect(screen.queryByText("tsx")).not.toBeInTheDocument();
    });

    it("names the code area from the filename", () => {
      render(<CodeBlock filename="Button.tsx">{CODE}</CodeBlock>);

      expect(screen.getByRole("group", { name: "Button.tsx" })).toBeInTheDocument();
    });

    it("leaves the code area unnamed when there is nothing to name it", () => {
      // A group with no name is worse than no group.
      render(<CodeBlock copyable={false}>{CODE}</CodeBlock>);

      expect(screen.queryByRole("group")).not.toBeInTheDocument();
    });

    it("keeps a header for the copy button with no filename", () => {
      const { container } = render(<CodeBlock>{CODE}</CodeBlock>);

      expect(container.querySelector(".sh-code-block__header")).toBeInTheDocument();
      expect(copyButton()).toBeInTheDocument();
    });

    it("drops the header entirely with nothing to put in it", () => {
      const { container } = render(<CodeBlock copyable={false}>{CODE}</CodeBlock>);

      expect(container.querySelector(".sh-code-block__header")).not.toBeInTheDocument();
    });
  });

  describe("copying", () => {
    it("writes the code to the clipboard", async () => {
      const user = userEvent.setup();
      render(<CodeBlock filename="Button.tsx">{CODE}</CodeBlock>);

      await user.click(copyButton());

      await expect(navigator.clipboard.readText()).resolves.toBe(CODE);
    });

    it("copies the dedented code, not the raw string", async () => {
      const user = userEvent.setup();
      render(<CodeBlock>{`
        const a = 1;
      `}</CodeBlock>);

      await user.click(copyButton());

      await expect(navigator.clipboard.readText()).resolves.toBe("const a = 1;");
    });

    it("announces the copy", async () => {
      const user = userEvent.setup();
      render(<CodeBlock>{CODE}</CodeBlock>);

      await user.click(copyButton());

      expect(screen.getByRole("status")).toHaveTextContent("Copied");
    });

    it("says nothing before a copy", () => {
      render(<CodeBlock>{CODE}</CodeBlock>);

      expect(screen.getByRole("status")).toHaveTextContent("");
    });

    it("reports a failure rather than looking like it worked", async () => {
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"));
      render(<CodeBlock>{CODE}</CodeBlock>);

      await user.click(copyButton());

      expect(screen.getByRole("status")).toHaveTextContent("Copy failed");
      vi.restoreAllMocks();
    });

    it("goes back to idle after the feedback window", async () => {
      const user = userEvent.setup();
      render(<CodeBlock>{CODE}</CodeBlock>);

      await user.click(copyButton());
      expect(screen.getByRole("status")).toHaveTextContent("Copied");

      await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(""), {
        timeout: 3000,
      });
    });

    it("can be turned off", () => {
      render(<CodeBlock filename="Button.tsx" copyable={false}>{CODE}</CodeBlock>);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("takes a custom label", () => {
      render(<CodeBlock copyLabel="Copy snippet">{CODE}</CodeBlock>);

      expect(screen.getByRole("button", { name: "Copy snippet" })).toBeInTheDocument();
    });

    it("is type=button so it never submits a surrounding form", () => {
      render(<CodeBlock>{CODE}</CodeBlock>);

      expect(copyButton()).toHaveAttribute("type", "button");
    });
  });

  describe("line numbers", () => {
    it("splits into one element per line", () => {
      const { container } = render(<CodeBlock showLineNumbers>{CODE}</CodeBlock>);

      expect(container.querySelectorAll(".sh-code-block__line")).toHaveLength(2);
    });

    it("flags the block so the counter applies", () => {
      const { container } = render(<CodeBlock showLineNumbers>{CODE}</CodeBlock>);

      expect(container.firstElementChild).toHaveClass("sh-code-block--numbered");
    });

    it("keeps the numbers out of the text", () => {
      // They come from a CSS counter, so copying by hand can't pick them up.
      const { container } = render(<CodeBlock showLineNumbers>{CODE}</CodeBlock>);

      expect(container.querySelector(".sh-code-block__code")?.textContent).toBe(CODE);
    });

    it("does not add a trailing blank line", () => {
      const { container } = render(<CodeBlock showLineNumbers>{CODE}</CodeBlock>);
      const lines = container.querySelectorAll(".sh-code-block__line");

      expect(lines[lines.length - 1].textContent).not.toContain("\n");
    });

    it("still copies the plain code", async () => {
      const user = userEvent.setup();
      render(<CodeBlock showLineNumbers>{CODE}</CodeBlock>);

      await user.click(copyButton());

      await expect(navigator.clipboard.readText()).resolves.toBe(CODE);
    });

    it("leaves a single text node when off", () => {
      // So a highlighter has something ordinary to work on.
      const { container } = render(<CodeBlock>{CODE}</CodeBlock>);

      expect(container.querySelectorAll(".sh-code-block__line")).toHaveLength(0);
      expect(container.querySelector(".sh-code-block__code")?.childNodes).toHaveLength(1);
    });
  });

  describe("styling hooks", () => {
    it("puts the language class where a highlighter looks for it", () => {
      render(<CodeBlock language="tsx">{CODE}</CodeBlock>);

      expect(codeElement()).toHaveClass("language-tsx");
    });

    it("leaves the language class off when there is no language", () => {
      render(<CodeBlock>{CODE}</CodeBlock>);

      expect(codeElement().className).not.toContain("language-");
    });

    it("applies the wrap modifier", () => {
      const { container } = render(<CodeBlock wrap>{CODE}</CodeBlock>);

      expect(container.firstElementChild).toHaveClass("sh-code-block--wrap");
    });

    it("does not wrap by default", () => {
      const { container } = render(<CodeBlock>{CODE}</CodeBlock>);

      expect(container.firstElementChild).not.toHaveClass("sh-code-block--wrap");
    });

    it("caps the height when asked", () => {
      render(<CodeBlock maxHeight={200}>{CODE}</CodeBlock>);

      expect(document.querySelector(".sh-code-block__pre")).toHaveStyle({ maxHeight: "200px" });
    });

    it("leaves the height to CSS by default", () => {
      render(<CodeBlock>{CODE}</CodeBlock>);

      expect(document.querySelector(".sh-code-block__pre")).not.toHaveAttribute("style");
    });

    it("merges a className", () => {
      const { container } = render(<CodeBlock className="custom">{CODE}</CodeBlock>);

      expect(container.firstElementChild).toHaveClass("custom");
    });
  });
});
