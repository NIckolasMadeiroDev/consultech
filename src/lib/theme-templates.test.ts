import { describe, it, expect } from "vitest";
import { THEME_TEMPLATES } from "./theme-templates";

describe("theme-templates", () => {
  it("expõe pelo menos cinco modelos", () => {
    expect(THEME_TEMPLATES.length).toBeGreaterThanOrEqual(5);
  });
});
