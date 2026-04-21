import { describe, it, expect } from "vitest";
import { collectGoogleFontFamiliesFromTheme, googleFontFamilyFromStack } from "./google-fonts";

describe("google-fonts", () => {
  it("googleFontFamilyFromStack extrai Inter", () => {
    expect(googleFontFamilyFromStack("Inter, system-ui")).toBe("Inter");
  });

  it("collectGoogleFontFamiliesFromTheme deduplica", () => {
    expect(collectGoogleFontFamiliesFromTheme("Inter, sans-serif", "Inter, sans-serif")).toEqual(["Inter"]);
  });
});
