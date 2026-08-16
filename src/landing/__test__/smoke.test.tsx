import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "../../App";

describe("landing page", () => {
  it("renders without crashing and links to Storybook and npm", () => {
    render(<App />);

    expect(screen.getAllByRole("link", { name: /storybook/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: /npm/i }).length).toBeGreaterThan(0);
  });
});
