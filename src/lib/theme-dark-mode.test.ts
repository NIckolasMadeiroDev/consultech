import { describe, it, expect } from "vitest";
import { DEFAULT_FORM_THEME } from "@/types/form-theme-defaults";
import { deriveDarkThemeColors, resolveFormThemeForDisplay } from "./theme-dark-mode";

describe("theme-dark-mode", () => {
  it("deriveDarkThemeColors escurece fundo da página", () => {
    const d = deriveDarkThemeColors(DEFAULT_FORM_THEME.colors);
    expect(d.pageBackground.toLowerCase()).not.toBe(DEFAULT_FORM_THEME.colors.pageBackground.toLowerCase());
  });

  it("resolveFormThemeForDisplay mantém claro quando appearance light", () => {
    const r = resolveFormThemeForDisplay(DEFAULT_FORM_THEME, { viewerPrefersDark: true });
    expect(r.colors.pageBackground).toBe(DEFAULT_FORM_THEME.colors.pageBackground);
  });

  it("resolveFormThemeForDisplay aplica escuro quando appearance dark", () => {
    const t = { ...DEFAULT_FORM_THEME, appearance: "dark" as const };
    const r = resolveFormThemeForDisplay(t, { viewerPrefersDark: false });
    expect(r.colors.pageBackground).toMatch(/^#/);
    expect(r.colors.pageBackground).not.toBe(DEFAULT_FORM_THEME.colors.pageBackground);
  });

  it("forceDark simula escuro no preview", () => {
    const r = resolveFormThemeForDisplay(DEFAULT_FORM_THEME, {
      viewerPrefersDark: false,
      forceDark: true,
    });
    expect(r.colors.textPrimary).not.toBe(DEFAULT_FORM_THEME.colors.textPrimary);
  });
});
