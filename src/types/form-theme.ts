export interface FormThemeColors {
  primary: string;
  secondary: string;
  pageBackground: string;
  surfaceBackground: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  focusRing: string;
  link: string;
  success: string;
  error: string;
  progressTrack: string;
  progressFill: string;
}

export interface FormThemeTypography {
  headingFont: string;
  bodyFont: string;
  headingWeight: number;
  bodyWeight: number;
  baseSize: string;
  scale: "sm" | "md" | "lg";
  lineHeight: string;
  letterSpacing?: string;
}

export interface FormThemeLayout {
  containerWidthPercent: number;
  maxWidthPx?: number;
  align: "start" | "center";
  pagePaddingX: string;
  pagePaddingY: string;
  cardPadding: string;
  questionGap: string;
  sectionGap: string;
}

export interface FormThemeComponents {
  borderRadiusSm: string;
  borderRadiusMd: string;
  borderRadiusLg: string;
  buttonVariant: "filled" | "outline" | "ghost";
  cardShadow: "none" | "sm" | "md" | "lg";
  inputBorderWidth: string;
}

export interface FormThemeFields {
  inputBackground: string;
  inputBorder: string;
  inputFocusBorder: string;
  density: "compact" | "comfortable";
}

export interface FormThemeEffects {
  backgroundOverlayOpacity: number;
  backgroundBlurPx: number;
}

export type FormThemeAnimationStyle = "fade" | "slide" | "scale" | "none";

export interface FormThemeAnimations {
  enabled: boolean;
  style: FormThemeAnimationStyle;
  durationMs: number;
}

export type FormThemeProgressBarStyle = "bar" | "steps" | "circular";

export interface FormThemeProgressBar {
  enabled: boolean;
  style: FormThemeProgressBarStyle;
  showPercentage: boolean;
  showCount: boolean;
}

export type FormThemeNavigationMode = "continuous" | "wizard";

export interface FormThemeNavigation {
  mode: FormThemeNavigationMode;
}

export interface FormThemeResponsive {
  mobileBreakpoint: number;
  tabletBreakpoint: number;
}

export type FormThemeAppearance = "light" | "dark" | "auto";

export type FormBackgroundPatternId = "none" | "dots" | "grid" | "waves" | "geometric";

export interface FormThemeLegacy {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  borderColor?: string;
  fontFamily?: string;
  fontSize?: string;
  borderRadius?: string;
  spacing?: string;
  shadowEnabled?: boolean;
  shadowIntensity?: "none" | "light" | "medium" | "strong";
}

export interface FormTheme {
  appearance: FormThemeAppearance;
  pageBackgroundPatternId: FormBackgroundPatternId;
  colors: FormThemeColors;
  typography: FormThemeTypography;
  layout: FormThemeLayout;
  components: FormThemeComponents;
  fields: FormThemeFields;
  effects: FormThemeEffects;
  animations: FormThemeAnimations;
  progressBar: FormThemeProgressBar;
  navigation: FormThemeNavigation;
  responsive: FormThemeResponsive;
  darkColors?: Partial<FormThemeColors>;
  legacy?: FormThemeLegacy;
}
