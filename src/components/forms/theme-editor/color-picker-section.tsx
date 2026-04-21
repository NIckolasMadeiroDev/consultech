"use client";

import { HexColorPicker } from "react-colorful";
import type { FormThemeColors } from "@/types/form-theme";

const KEYS: (keyof FormThemeColors)[] = [
  "primary",
  "secondary",
  "pageBackground",
  "surfaceBackground",
  "textPrimary",
  "textSecondary",
  "border",
  "focusRing",
  "link",
  "success",
  "error",
  "progressTrack",
  "progressFill",
];

const LABELS: Record<keyof FormThemeColors, string> = {
  primary: "Primária",
  secondary: "Secundária",
  pageBackground: "Fundo da página",
  surfaceBackground: "Superfície (cartão)",
  textPrimary: "Texto principal",
  textSecondary: "Texto secundário",
  border: "Borda",
  focusRing: "Foco",
  link: "Link",
  success: "Sucesso",
  error: "Erro",
  progressTrack: "Barra (fundo)",
  progressFill: "Barra (preenchimento)",
};

type ColorPickerSectionProps = {
  readonly colors: FormThemeColors;
  readonly onChange: (next: FormThemeColors) => void;
};

export function ColorPickerSection({ colors, onChange }: ColorPickerSectionProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {KEYS.map((key) => (
        <div key={key} className="space-y-2">
          <label className="text-small font-medium text-[var(--text-primary)]" htmlFor={`color-${key}`}>
            {LABELS[key]}
          </label>
          <div className="flex flex-wrap items-start gap-3">
            <HexColorPicker
              color={colors[key]}
              onChange={(hex) => onChange({ ...colors, [key]: hex })}
            />
            <input
              id={`color-${key}`}
              type="text"
              value={colors[key]}
              onChange={(e) => onChange({ ...colors, [key]: e.target.value })}
              className="h-10 min-w-[7rem] rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
              maxLength={7}
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
