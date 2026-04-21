import { describe, it, expect } from "vitest";
import { DEFAULT_FORM_THEME } from "@/types/form-theme-defaults";
import { contrastRatio, validateAccessibility } from "./accessibility-validator";

describe("contrastRatio", () => {
  it("retorna ~21 para preto e branco", () => {
    const r = contrastRatio("#000000", "#ffffff");
    expect(r).not.toBeNull();
    expect(r!).toBeGreaterThan(20);
  });
});

describe("validateAccessibility", () => {
  it("tema padrão não tem issues críticas", () => {
    const r = validateAccessibility(DEFAULT_FORM_THEME);
    expect(r.passed).toBe(true);
    expect(r.issues.length).toBe(0);
  });

  it("texto ilegível gera issue", () => {
    const bad = {
      ...DEFAULT_FORM_THEME,
      colors: {
        ...DEFAULT_FORM_THEME.colors,
        textPrimary: "#cccccc",
        surfaceBackground: "#dddddd",
      },
    };
    const r = validateAccessibility(bad);
    expect(r.issues.length).toBeGreaterThan(0);
    expect(r.passed).toBe(false);
  });
});
