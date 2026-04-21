import type { FormTheme } from "@/types/form-theme";

export type AccessibilityReport = {
  passed: boolean;
  issues: string[];
  warnings: string[];
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    if ([r, g, b].some((x) => Number.isNaN(x))) return null;
    return { r, g, b };
  }
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    if ([r, g, b].some((x) => Number.isNaN(x))) return null;
    return { r, g, b };
  }
  return null;
}

function relativeLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const toLin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const r = toLin(rgb.r);
  const g = toLin(rgb.g);
  const b = toLin(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(fgHex: string, bgHex: string): number | null {
  const l1 = relativeLuminance(fgHex);
  const l2 = relativeLuminance(bgHex);
  if (l1 === null || l2 === null) return null;
  const L1 = Math.max(l1, l2);
  const L2 = Math.min(l1, l2);
  return (L1 + 0.05) / (L2 + 0.05);
}

function parseBaseSizePx(baseSize: string): number {
  const m = baseSize.trim().match(/^([\d.]+)\s*px$/i);
  if (m) return Number.parseFloat(m[0]);
  const rem = baseSize.trim().match(/^([\d.]+)\s*rem$/i);
  if (rem) return Number.parseFloat(rem[1]) * 16;
  return 16;
}

export function validateAccessibility(theme: FormTheme): AccessibilityReport {
  const issues: string[] = [];
  const warnings: string[] = [];
  const { colors, typography, fields } = theme;

  const body = contrastRatio(colors.textPrimary, colors.surfaceBackground);
  if (body !== null && body < 4.5) {
    issues.push(
      `Contraste texto principal / fundo do cartão (${body.toFixed(2)}:1) abaixo de WCAG AA (4.5:1).`
    );
  } else if (body !== null && body < 7) {
    warnings.push(
      `Contraste texto principal / fundo (${body.toFixed(2)}:1) não atinge WCAG AAA (7:1).`
    );
  }

  const secondary = contrastRatio(colors.textSecondary, colors.surfaceBackground);
  if (secondary !== null && secondary < 3) {
    warnings.push(
      `Contraste texto secundário / fundo (${secondary.toFixed(2)}:1) pode ser baixo para texto pequeno.`
    );
  }

  const linkOnSurface = contrastRatio(colors.link, colors.surfaceBackground);
  if (linkOnSurface !== null && linkOnSurface < 4.5) {
    issues.push(`Contraste de links (${linkOnSurface.toFixed(2)}:1) abaixo de 4.5:1.`);
  }

  const btnFg = "#ffffff";
  const btn = contrastRatio(btnFg, colors.primary);
  if (btn !== null && btn < 3) {
    issues.push(`Contraste do botão primário (texto branco / cor primária) (${btn.toFixed(2)}:1) abaixo de 3:1.`);
  } else if (btn !== null && btn < 4.5) {
    warnings.push(
      `Contraste do botão primário (${btn.toFixed(2)}:1) entre 3:1 e 4.5:1 (aceitável para componentes grandes).`
    );
  }

  const basePx = parseBaseSizePx(typography.baseSize);
  if (basePx < 14) {
    warnings.push("Tamanho base do texto abaixo de 14px pode dificultar a leitura em mobile.");
  }

  if (theme.fields.density === "compact" && basePx < 16) {
    warnings.push("Densidade compacta com texto pequeno: alvos de toque podem ficar abaixo do recomendado (44px).");
  }

  const inputBorder = contrastRatio(fields.inputBorder, fields.inputBackground);
  if (inputBorder !== null && inputBorder < 1.25) {
    warnings.push("Borda dos campos pouco visível sobre o fundo do input.");
  }

  return {
    passed: issues.length === 0,
    issues,
    warnings,
  };
}
