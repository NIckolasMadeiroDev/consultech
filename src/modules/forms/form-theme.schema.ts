import { z } from "zod";

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Cor em formato hex inválido.");

const optionalHttpUrl = z
  .string()
  .max(2048)
  .refine((s) => {
    try {
      const u = new URL(s.trim());
      return u.protocol === "https:" || u.protocol === "http:";
    } catch {
      return false;
    }
  }, "URL inválida.");

const colorsPatch = z
  .object({
    primary: hexColor.optional(),
    secondary: hexColor.optional(),
    pageBackground: hexColor.optional(),
    surfaceBackground: hexColor.optional(),
    textPrimary: hexColor.optional(),
    textSecondary: hexColor.optional(),
    border: hexColor.optional(),
    focusRing: hexColor.optional(),
    link: hexColor.optional(),
    success: hexColor.optional(),
    error: hexColor.optional(),
    progressTrack: hexColor.optional(),
    progressFill: hexColor.optional(),
  })
  .strict();

const typographyPatch = z
  .object({
    headingFont: z.string().max(500).optional(),
    bodyFont: z.string().max(500).optional(),
    headingWeight: z.number().int().min(100).max(900).optional(),
    bodyWeight: z.number().int().min(100).max(900).optional(),
    baseSize: z.string().max(32).optional(),
    scale: z.enum(["sm", "md", "lg"]).optional(),
    lineHeight: z.string().max(32).optional(),
    letterSpacing: z.string().max(32).optional(),
  })
  .strict();

const layoutPatch = z
  .object({
    containerWidthPercent: z.number().min(10).max(100).optional(),
    maxWidthPx: z.number().int().min(320).max(2400).optional(),
    align: z.enum(["start", "center"]).optional(),
    pagePaddingX: z.string().max(32).optional(),
    pagePaddingY: z.string().max(32).optional(),
    cardPadding: z.string().max(32).optional(),
    questionGap: z.string().max(32).optional(),
    sectionGap: z.string().max(32).optional(),
  })
  .strict();

const componentsPatch = z
  .object({
    borderRadiusSm: z.string().max(32).optional(),
    borderRadiusMd: z.string().max(32).optional(),
    borderRadiusLg: z.string().max(32).optional(),
    buttonVariant: z.enum(["filled", "outline", "ghost"]).optional(),
    cardShadow: z.enum(["none", "sm", "md", "lg"]).optional(),
    inputBorderWidth: z.string().max(32).optional(),
  })
  .strict();

const fieldsPatch = z
  .object({
    inputBackground: hexColor.optional(),
    inputBorder: hexColor.optional(),
    inputFocusBorder: hexColor.optional(),
    density: z.enum(["compact", "comfortable"]).optional(),
  })
  .strict();

const effectsPatch = z
  .object({
    backgroundOverlayOpacity: z.number().min(0).max(1).optional(),
    backgroundBlurPx: z.number().int().min(0).max(48).optional(),
  })
  .strict();

const darkColorsPatch = colorsPatch;

const animationsPatch = z
  .object({
    enabled: z.boolean().optional(),
    style: z.enum(["fade", "slide", "scale", "none"]).optional(),
    durationMs: z.number().int().min(0).max(2000).optional(),
  })
  .strict();

const progressBarPatch = z
  .object({
    enabled: z.boolean().optional(),
    style: z.enum(["bar", "steps", "circular"]).optional(),
    showPercentage: z.boolean().optional(),
    showCount: z.boolean().optional(),
  })
  .strict();

const navigationPatch = z
  .object({
    mode: z.enum(["continuous", "wizard"]).optional(),
  })
  .strict();

const responsivePatch = z
  .object({
    mobileBreakpoint: z.number().int().min(280).max(600).optional(),
    tabletBreakpoint: z.number().int().min(600).max(1400).optional(),
  })
  .strict();

export const patchFormThemeSchema = z
  .object({
    appearance: z.enum(["light", "dark", "auto"]).optional(),
    pageBackgroundPatternId: z.enum(["none", "dots", "grid", "waves", "geometric"]).optional(),
    darkColors: darkColorsPatch.optional(),
    colors: colorsPatch.optional(),
    typography: typographyPatch.optional(),
    layout: layoutPatch.optional(),
    components: componentsPatch.optional(),
    fields: fieldsPatch.optional(),
    effects: effectsPatch.optional(),
    animations: animationsPatch.optional(),
    progressBar: progressBarPatch.optional(),
    navigation: navigationPatch.optional(),
    responsive: responsivePatch.optional(),
  })
  .strict();

export const optionalBrandingImageUrl = z
  .union([z.literal(""), optionalHttpUrl])
  .optional()
  .nullable()
  .transform((v) => (v === "" || v === null || v === undefined ? null : v));

export const optionalLongText = z
  .union([z.literal(""), z.string().max(10000)])
  .optional()
  .nullable()
  .transform((v) => (v === "" || v === null || v === undefined ? null : v));

export const optionalSuccessPageHtml = z
  .union([z.literal(""), z.string().max(200_000)])
  .optional()
  .nullable()
  .transform((v) => (v === "" || v === null || v === undefined ? null : v));

export const successRedirectDelaySchema = z
  .number()
  .int()
  .min(0)
  .max(600)
  .optional()
  .nullable();

export const submitButtonTextSchema = z
  .string()
  .min(1)
  .max(120)
  .optional();

export const patchFormThemePayloadSchema = z.object({
  theme: patchFormThemeSchema.optional(),
  headerImage: optionalBrandingImageUrl,
  logoImage: optionalBrandingImageUrl,
  backgroundImage: optionalBrandingImageUrl,
  welcomeMessage: optionalLongText,
  submitButtonText: submitButtonTextSchema,
  successMessage: optionalLongText,
  successPageHtml: optionalSuccessPageHtml,
  successRedirectUrl: optionalBrandingImageUrl,
  successRedirectDelay: successRedirectDelaySchema,
});

export type PatchFormThemePayload = z.infer<typeof patchFormThemePayloadSchema>;
