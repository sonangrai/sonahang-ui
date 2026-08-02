import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tag } from "../Tag";
import { tagVariants } from "../tag.tokens";

describe("Tag", () => {
  it("renders its children", () => {
    render(<Tag>Beta</Tag>);

    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("applies the primary variant by default", () => {
    render(<Tag>Default</Tag>);

    expect(screen.getByText("Default")).toHaveClass("sh-tag", "sh-tag--primary");
  });

  it.each(tagVariants)("applies the %s variant class", (variant) => {
    render(<Tag variant={variant}>{variant}</Tag>);

    expect(screen.getByText(variant)).toHaveClass(`sh-tag--${variant}`);
  });

  it("merges a custom className with its own", () => {
    render(<Tag className="custom">Styled</Tag>);

    expect(screen.getByText("Styled")).toHaveClass("sh-tag", "custom");
  });

  it("forwards arbitrary span attributes", () => {
    render(<Tag data-testid="status-tag" title="Build status">Passing</Tag>);

    expect(screen.getByTestId("status-tag")).toHaveAttribute("title", "Build status");
  });
});
