import type { FormBackgroundPatternId } from "@/types/form-theme";

export const FORM_BACKGROUND_PATTERN_IDS: FormBackgroundPatternId[] = [
  "none",
  "dots",
  "grid",
  "waves",
  "geometric",
];

export type BackgroundPatternDef = {
  readonly name: string;
  readonly cssBackgroundImage: string | null;
  readonly blendOpacity: number;
};

export const BACKGROUND_PATTERNS: Record<FormBackgroundPatternId, BackgroundPatternDef> = {
  none: { name: "Nenhum", cssBackgroundImage: null, blendOpacity: 0 },
  dots: {
    name: "Pontos",
    cssBackgroundImage: "url(/patterns/dots.svg)",
    blendOpacity: 0.35,
  },
  grid: {
    name: "Grade",
    cssBackgroundImage: "url(/patterns/grid.svg)",
    blendOpacity: 0.25,
  },
  waves: {
    name: "Ondas",
    cssBackgroundImage: "url(/patterns/waves.svg)",
    blendOpacity: 0.2,
  },
  geometric: {
    name: "Geométrico",
    cssBackgroundImage: "url(/patterns/geometric.svg)",
    blendOpacity: 0.22,
  },
};

export function isFormBackgroundPatternId(v: string): v is FormBackgroundPatternId {
  return (FORM_BACKGROUND_PATTERN_IDS as readonly string[]).includes(v);
}
