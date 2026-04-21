"use client";

import type { FormThemeTypography } from "@/types/form-theme";
import { FontSelector } from "./font-selector";

type TypographySectionProps = {
  readonly typography: FormThemeTypography;
  readonly onChange: (next: FormThemeTypography) => void;
};

export function TypographySection({ typography, onChange }: TypographySectionProps) {
  return (
    <div className="space-y-4">
      <FontSelector
        headingFont={typography.headingFont}
        bodyFont={typography.bodyFont}
        onPickHeading={(stack) => onChange({ ...typography, headingFont: stack })}
        onPickBody={(stack) => onChange({ ...typography, bodyFont: stack })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
        Fonte dos títulos
        <input
          type="text"
          value={typography.headingFont}
          onChange={(e) => onChange({ ...typography, headingFont: e.target.value })}
          className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
        />
      </label>
      <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
        Fonte do corpo
        <input
          type="text"
          value={typography.bodyFont}
          onChange={(e) => onChange({ ...typography, bodyFont: e.target.value })}
          className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
        />
      </label>
      <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
        Peso título (100–900)
        <input
          type="number"
          min={100}
          max={900}
          step={100}
          value={typography.headingWeight}
          onChange={(e) =>
            onChange({ ...typography, headingWeight: Number(e.target.value) || 600 })
          }
          className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
        />
      </label>
      <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
        Peso corpo
        <input
          type="number"
          min={100}
          max={900}
          step={100}
          value={typography.bodyWeight}
          onChange={(e) =>
            onChange({ ...typography, bodyWeight: Number(e.target.value) || 400 })
          }
          className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
        />
      </label>
      <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
        Tamanho base
        <input
          type="text"
          value={typography.baseSize}
          onChange={(e) => onChange({ ...typography, baseSize: e.target.value })}
          className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
          placeholder="16px"
        />
      </label>
      <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
        Escala
        <select
          value={typography.scale}
          onChange={(e) =>
            onChange({ ...typography, scale: e.target.value as FormThemeTypography["scale"] })
          }
          className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
        >
          <option value="sm">Pequena</option>
          <option value="md">Média</option>
          <option value="lg">Grande</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)] sm:col-span-2">
        Altura de linha
        <input
          type="text"
          value={typography.lineHeight}
          onChange={(e) => onChange({ ...typography, lineHeight: e.target.value })}
          className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
          placeholder="1.5"
        />
      </label>
    </div>
    </div>
  );
}
