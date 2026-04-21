"use client";

import type { FormThemeEffects } from "@/types/form-theme";

type FormThemeEffectsSectionProps = {
  readonly effects: FormThemeEffects;
  readonly onChange: (next: FormThemeEffects) => void;
};

export function FormThemeEffectsSection({ effects, onChange }: FormThemeEffectsSectionProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="sm:col-span-2 flex flex-col gap-2 text-small text-[var(--text-secondary)]">
        Opacidade do overlay sobre o fundo (0–1)
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={effects.backgroundOverlayOpacity}
          onChange={(e) =>
            onChange({ ...effects, backgroundOverlayOpacity: Number(e.target.value) })
          }
          className="w-full"
        />
        <span className="text-body text-[var(--text-primary)]">
          {effects.backgroundOverlayOpacity.toFixed(2)}
        </span>
      </label>
      <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
        Desfoque do fundo (px)
        <input
          type="number"
          min={0}
          max={48}
          value={effects.backgroundBlurPx}
          onChange={(e) =>
            onChange({ ...effects, backgroundBlurPx: Number(e.target.value) || 0 })
          }
          className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
        />
      </label>
    </div>
  );
}
