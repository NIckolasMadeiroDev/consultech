import type { CSSProperties } from "react";
import type { FormTheme } from "@/types/form-theme";

export function formThemeToCssProperties(theme: FormTheme): CSSProperties {
  const { colors, typography, layout, components, fields, effects } = theme;
  const maxPx = layout.maxWidthPx ?? 1200;
  const widthExpr = `min(${layout.containerWidthPercent}vw, ${maxPx}px)`;
  return {
    "--form-color-primary": colors.primary,
    "--form-color-secondary": colors.secondary,
    "--form-color-page-bg": colors.pageBackground,
    "--form-color-surface": colors.surfaceBackground,
    "--form-text-primary": colors.textPrimary,
    "--form-text-secondary": colors.textSecondary,
    "--form-border-color": colors.border,
    "--form-focus-ring": colors.focusRing,
    "--form-link": colors.link,
    "--form-success": colors.success,
    "--form-error": colors.error,
    "--form-progress-track": colors.progressTrack,
    "--form-progress-fill": colors.progressFill,
    "--form-font-heading": typography.headingFont,
    "--form-font-body": typography.bodyFont,
    "--form-heading-weight": String(typography.headingWeight),
    "--form-body-weight": String(typography.bodyWeight),
    "--form-base-size": typography.baseSize,
    "--form-line-height": typography.lineHeight,
    "--form-letter-spacing": typography.letterSpacing ?? "normal",
    "--form-radius-sm": components.borderRadiusSm,
    "--form-radius-md": components.borderRadiusMd,
    "--form-radius-lg": components.borderRadiusLg,
    "--form-input-bg": fields.inputBackground,
    "--form-input-border": fields.inputBorder,
    "--form-input-focus-border": fields.inputFocusBorder,
    "--form-input-border-width": components.inputBorderWidth,
    "--form-page-pad-x": layout.pagePaddingX,
    "--form-page-pad-y": layout.pagePaddingY,
    "--form-card-pad": layout.cardPadding,
    "--form-question-gap": layout.questionGap,
    "--form-section-gap": layout.sectionGap,
    "--form-canvas-width": widthExpr,
    "--form-canvas-align": layout.align === "center" ? "auto" : "0",
    "--form-canvas-margin-start": layout.align === "center" ? "auto" : "0",
    "--form-canvas-margin-end": layout.align === "center" ? "auto" : "0",
    "--form-bg-overlay-opacity": String(effects.backgroundOverlayOpacity),
    "--form-bg-blur-px": `${effects.backgroundBlurPx}px`,
    "--form-button-variant": components.buttonVariant,
    "--form-card-shadow-tier": components.cardShadow,
    "--form-field-density": fields.density,
    "--form-typography-scale": typography.scale,
    "--form-anim-duration": `${theme.animations?.durationMs ?? 320}ms`,
  } as CSSProperties;
}

export function getFormSubmitButtonClassName(theme: FormTheme): string {
  const v = theme.components.buttonVariant;
  const base =
    "inline-flex w-full items-center justify-center gap-2 font-medium outline-none transition-colors duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 h-12 min-h-12 px-5 text-body-lg focus-visible:ring-2 focus-visible:ring-offset-2";
  const radius = "rounded-[var(--form-radius-md)]";
  if (v === "outline") {
    return `${base} ${radius} border-[length:var(--form-input-border-width)] border-[color:var(--form-color-primary)] bg-transparent text-[color:var(--form-color-primary)] hover:bg-[color-mix(in_srgb,var(--form-color-primary)_12%,transparent)] active:bg-[color-mix(in_srgb,var(--form-color-primary)_20%,transparent)] focus-visible:ring-[color:var(--form-focus-ring)]`;
  }
  if (v === "ghost") {
    return `${base} ${radius} bg-transparent text-[color:var(--form-color-primary)] hover:bg-[color-mix(in_srgb,var(--form-color-primary)_10%,transparent)] focus-visible:ring-[color:var(--form-focus-ring)]`;
  }
  return `${base} ${radius} bg-[color:var(--form-color-primary)] text-white hover:opacity-95 active:opacity-90 focus-visible:ring-[color:var(--form-focus-ring)]`;
}

export function formThemeTypographyClassName(theme: FormTheme): string {
  const scale = theme.typography.scale;
  if (scale === "sm") return "form-theme-scale-sm";
  if (scale === "lg") return "form-theme-scale-lg";
  return "form-theme-scale-md";
}
