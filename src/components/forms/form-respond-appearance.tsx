"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import type { FormTheme } from "@/types/form-theme";
import { formThemeToCssProperties, formThemeTypographyClassName } from "@/lib/theme-utils";
import { useResolvedFormTheme } from "@/hooks/use-resolved-form-theme";
import { collectGoogleFontFamiliesFromTheme, loadGoogleFontsInDocument } from "@/lib/google-fonts";
import { BACKGROUND_PATTERNS } from "@/lib/background-patterns";
import "@/styles/form-theme.css";
import "@/styles/form-animations.css";

type FormRespondAppearanceProps = {
  readonly theme: FormTheme;
  readonly headerImage?: string;
  readonly logoImage?: string;
  readonly backgroundImage?: string;
  readonly previewForceDark?: boolean;
  readonly children: ReactNode;
};

export function FormRespondAppearance({
  theme,
  headerImage,
  logoImage,
  backgroundImage,
  previewForceDark,
  children,
}: FormRespondAppearanceProps) {
  const resolved = useResolvedFormTheme(theme, previewForceDark);
  useEffect(() => {
    loadGoogleFontsInDocument(
      collectGoogleFontFamiliesFromTheme(
        resolved.typography.headingFont,
        resolved.typography.bodyFont
      )
    );
  }, [resolved.typography.headingFont, resolved.typography.bodyFont]);
  const vars = formThemeToCssProperties(resolved);
  const scaleClass = formThemeTypographyClassName(resolved);
  const overlayOpacity = resolved.effects.backgroundOverlayOpacity;
  const pagePad = {
    paddingLeft: resolved.layout.pagePaddingX,
    paddingRight: resolved.layout.pagePaddingX,
    paddingTop: resolved.layout.pagePaddingY,
    paddingBottom: resolved.layout.pagePaddingY,
  };
  const pat =
    !backgroundImage && resolved.pageBackgroundPatternId !== "none"
      ? BACKGROUND_PATTERNS[resolved.pageBackgroundPatternId]
      : null;
  return (
    <div className={`form-theme-root relative min-h-screen ${scaleClass}`} style={vars}>
      {pat?.cssBackgroundImage ? (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            backgroundImage: pat.cssBackgroundImage,
            backgroundRepeat: "repeat",
            opacity: pat.blendOpacity,
          }}
        />
      ) : null}
      {backgroundImage ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[1]"
            style={{
              backgroundColor: resolved.colors.pageBackground,
              opacity: overlayOpacity,
            }}
          />
        </>
      ) : null}
      <div className="relative z-10" style={pagePad}>
        {headerImage ? (
          <div className="mb-6 overflow-hidden rounded-[var(--form-radius-lg)]">
            <img src={headerImage} alt="" className="max-h-56 w-full object-cover" />
          </div>
        ) : null}
        <div className="form-theme-canvas">
          {logoImage ? (
            <img src={logoImage} alt="" className="mb-6 h-14 w-auto max-w-full object-contain" />
          ) : null}
          {children}
        </div>
      </div>
    </div>
  );
}
