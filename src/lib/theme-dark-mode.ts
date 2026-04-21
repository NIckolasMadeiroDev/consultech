import type { FormTheme, FormThemeColors } from "@/types/form-theme";

function mergeColors(base: FormThemeColors, patch?: Partial<FormThemeColors>): FormThemeColors {
  if (!patch) return base;
  return { ...base, ...patch };
}

export function deriveDarkThemeColors(light: FormThemeColors): FormThemeColors {
  void light;
  return {
    primary: "#818cf8",
    secondary: "#a5b4fc",
    pageBackground: "#0f172a",
    surfaceBackground: "#1e293b",
    textPrimary: "#f8fafc",
    textSecondary: "#94a3b8",
    border: "#334155",
    focusRing: "#818cf8",
    link: "#93c5fd",
    success: "#34d399",
    error: "#f87171",
    progressTrack: "#334155",
    progressFill: "#818cf8",
  };
}

export function deriveDarkThemeFields(light: FormTheme): FormTheme["fields"] {
  return {
    ...light.fields,
    inputBackground: "#1e293b",
    inputBorder: "#475569",
    inputFocusBorder: "#818cf8",
  };
}

export function deriveDarkTheme(light: FormTheme): FormTheme {
  return {
    ...light,
    colors: deriveDarkThemeColors(light.colors),
    fields: deriveDarkThemeFields(light),
  };
}

export type ResolveFormThemeOptions = {
  readonly viewerPrefersDark: boolean;
  readonly forceDark?: boolean;
};

export function resolveFormThemeForDisplay(theme: FormTheme, opts: ResolveFormThemeOptions): FormTheme {
  const useDark =
    opts.forceDark === true
      ? true
      : theme.appearance === "dark" ||
        (theme.appearance === "auto" && opts.viewerPrefersDark);
  if (!useDark) {
    return theme;
  }
  const derived = deriveDarkTheme(theme);
  return {
    ...derived,
    colors: mergeColors(derived.colors, theme.darkColors),
  };
}
