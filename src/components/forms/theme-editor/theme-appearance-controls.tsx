"use client";

import type { FormBackgroundPatternId, FormTheme } from "@/types/form-theme";
import { BACKGROUND_PATTERNS, FORM_BACKGROUND_PATTERN_IDS } from "@/lib/background-patterns";

type ThemeAppearanceControlsProps = {
  readonly theme: FormTheme;
  readonly onChange: (next: FormTheme) => void;
};

export function ThemeAppearanceControls({ theme, onChange }: ThemeAppearanceControlsProps) {
  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-small font-medium text-[var(--text-primary)]">
          Aparência (claro / escuro)
        </legend>
        <div className="flex flex-wrap gap-3">
          {(
            [
              ["light", "Claro"],
              ["dark", "Escuro"],
              ["auto", "Automático (sistema)"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-small dark:border-neutral-600"
            >
              <input
                type="radio"
                name="form-appearance"
                checked={theme.appearance === value}
                onChange={() => onChange({ ...theme, appearance: value })}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
        Padrão de fundo da página
        <select
          value={theme.pageBackgroundPatternId}
          onChange={(e) =>
            onChange({
              ...theme,
              pageBackgroundPatternId: e.target.value as FormBackgroundPatternId,
            })
          }
          className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
        >
          {FORM_BACKGROUND_PATTERN_IDS.map((id) => (
            <option key={id} value={id}>
              {BACKGROUND_PATTERNS[id].name}
            </option>
          ))}
        </select>
      </label>
      <p className="text-caption text-[var(--text-secondary)]">
        O padrão aplica-se sobre a cor de fundo quando não há imagem de fundo a título de capa.
      </p>
    </div>
  );
}
