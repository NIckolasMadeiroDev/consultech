import type { FormTheme } from "@/types/form-theme";
import { DEFAULT_FORM_THEME } from "@/types/form-theme-defaults";

export type ThemeTemplateEntry = {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly theme: FormTheme;
};

const professional: FormTheme = {
  ...DEFAULT_FORM_THEME,
  colors: {
    ...DEFAULT_FORM_THEME.colors,
    primary: "#2563EB",
    secondary: "#3B82F6",
    pageBackground: "#F9FAFB",
    surfaceBackground: "#FFFFFF",
    textPrimary: "#111827",
    textSecondary: "#4B5563",
    border: "#E5E7EB",
    focusRing: "#2563EB",
    link: "#1D4ED8",
    progressFill: "#2563EB",
  },
};

const creative: FormTheme = {
  ...DEFAULT_FORM_THEME,
  colors: {
    ...DEFAULT_FORM_THEME.colors,
    primary: "#DB2777",
    secondary: "#EC4899",
    pageBackground: "#FDF2F8",
    surfaceBackground: "#FFFFFF",
    textPrimary: "#831843",
    textSecondary: "#9D174D",
    border: "#FBCFE8",
    focusRing: "#DB2777",
    link: "#BE185D",
    progressFill: "#DB2777",
  },
  components: {
    ...DEFAULT_FORM_THEME.components,
    borderRadiusLg: "16px",
    cardShadow: "md",
  },
};

const minimalist: FormTheme = {
  ...DEFAULT_FORM_THEME,
  colors: {
    ...DEFAULT_FORM_THEME.colors,
    primary: "#18181B",
    secondary: "#3F3F46",
    pageBackground: "#FFFFFF",
    surfaceBackground: "#FAFAFA",
    textPrimary: "#18181B",
    textSecondary: "#71717A",
    border: "#E4E4E7",
    focusRing: "#18181B",
    link: "#2563EB",
    progressFill: "#18181B",
  },
  components: {
    ...DEFAULT_FORM_THEME.components,
    buttonVariant: "outline",
    cardShadow: "none",
  },
};

const dark: FormTheme = {
  ...DEFAULT_FORM_THEME,
  appearance: "dark",
  colors: {
    primary: "#6366F1",
    secondary: "#818CF8",
    pageBackground: "#0B1120",
    surfaceBackground: "#111827",
    textPrimary: "#F9FAFB",
    textSecondary: "#9CA3AF",
    border: "#374151",
    focusRing: "#818CF8",
    link: "#93C5FD",
    success: "#34D399",
    error: "#F87171",
    progressTrack: "#374151",
    progressFill: "#6366F1",
  },
  fields: {
    inputBackground: "#1F2937",
    inputBorder: "#4B5563",
    inputFocusBorder: "#818CF8",
    density: "comfortable",
  },
};

const corporate: FormTheme = {
  ...DEFAULT_FORM_THEME,
  colors: {
    ...DEFAULT_FORM_THEME.colors,
    primary: "#0F766E",
    secondary: "#14B8A6",
    pageBackground: "#F0FDFA",
    surfaceBackground: "#FFFFFF",
    textPrimary: "#134E4A",
    textSecondary: "#115E59",
    border: "#CCFBF1",
    focusRing: "#0D9488",
    link: "#0F766E",
    progressFill: "#0D9488",
  },
};

export const THEME_TEMPLATES: ThemeTemplateEntry[] = [
  { id: "professional", name: "Profissional", description: "Elegante e corporativo", theme: professional },
  { id: "creative", name: "Criativo", description: "Cores vibrantes e modernas", theme: creative },
  { id: "minimalist", name: "Minimalista", description: "Simples e limpo", theme: minimalist },
  { id: "dark", name: "Modo escuro", description: "Para ambientes com pouca luz", theme: dark },
  { id: "corporate", name: "Corporativo", description: "Sério e confiável", theme: corporate },
];

export function getThemeTemplateById(id: string): ThemeTemplateEntry | undefined {
  return THEME_TEMPLATES.find((t) => t.id === id);
}
