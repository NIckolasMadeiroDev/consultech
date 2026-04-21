import { describe, it, expect } from "vitest";
import { DEFAULT_FORM_THEME } from "@/types/form-theme-defaults";
import { mergeFormTheme, parseFormThemeFromJson } from "./merge-form-theme";

describe("mergeFormTheme", () => {
  it("mergeia patch parcial nas cores", () => {
    const next = mergeFormTheme(DEFAULT_FORM_THEME, {
      colors: { primary: "#000000" },
    });
    expect(next.colors.primary).toBe("#000000");
    expect(next.colors.secondary).toBe(DEFAULT_FORM_THEME.colors.secondary);
  });

  it("parseFormThemeFromJson trata valores inválidos como defaults", () => {
    const t = parseFormThemeFromJson(null);
    expect(t.layout.containerWidthPercent).toBe(DEFAULT_FORM_THEME.layout.containerWidthPercent);
    expect(t.appearance).toBe(DEFAULT_FORM_THEME.appearance);
    expect(t.navigation.mode).toBe(DEFAULT_FORM_THEME.navigation.mode);
    expect(t.responsive.mobileBreakpoint).toBe(DEFAULT_FORM_THEME.responsive.mobileBreakpoint);
  });
});
