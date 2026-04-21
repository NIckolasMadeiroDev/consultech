"use client";

import type { FormTheme } from "@/types/form-theme";
import { DEFAULT_FORM_THEME } from "@/types/form-theme-defaults";

type ThemeExperienceSectionProps = {
  readonly theme: FormTheme;
  readonly onChange: (next: FormTheme) => void;
};

export function ThemeExperienceSection({ theme, onChange }: ThemeExperienceSectionProps) {
  const a = theme.animations;
  const p = theme.progressBar;
  const n = theme.navigation;
  const r = theme.responsive ?? DEFAULT_FORM_THEME.responsive;
  return (
    <div className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-small font-medium text-[var(--text-primary)]">Animação das perguntas</legend>
        <label className="flex cursor-pointer items-center gap-2 text-small text-[var(--text-secondary)]">
          <input
            type="checkbox"
            checked={a.enabled}
            onChange={(e) => onChange({ ...theme, animations: { ...a, enabled: e.target.checked } })}
          />
          Ativar animação ao mostrar cada bloco
        </label>
        <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
          Estilo
          <select
            value={a.style}
            onChange={(e) =>
              onChange({
                ...theme,
                animations: { ...a, style: e.target.value as typeof a.style },
              })
            }
            className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
          >
            <option value="fade">Suavidade (fade)</option>
            <option value="slide">Deslizar</option>
            <option value="scale">Escala</option>
            <option value="none">Nenhum</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
          Duração (ms)
          <input
            type="number"
            min={0}
            max={2000}
            step={20}
            value={a.durationMs}
            onChange={(e) =>
              onChange({
                ...theme,
                animations: { ...a, durationMs: Number(e.target.value) || 0 },
              })
            }
            className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
          />
        </label>
      </fieldset>
      <fieldset className="space-y-3">
        <legend className="text-small font-medium text-[var(--text-primary)]">Barra de progresso</legend>
        <label className="flex cursor-pointer items-center gap-2 text-small text-[var(--text-secondary)]">
          <input
            type="checkbox"
            checked={p.enabled}
            onChange={(e) => onChange({ ...theme, progressBar: { ...p, enabled: e.target.checked } })}
          />
          Mostrar indicador de progresso
        </label>
        <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
          Estilo visual
          <select
            value={p.style}
            onChange={(e) =>
              onChange({
                ...theme,
                progressBar: { ...p, style: e.target.value as typeof p.style },
              })
            }
            className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
          >
            <option value="bar">Barra linear</option>
            <option value="steps">Passos</option>
            <option value="circular">Circular</option>
          </select>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-small text-[var(--text-secondary)]">
          <input
            type="checkbox"
            checked={p.showPercentage}
            onChange={(e) =>
              onChange({ ...theme, progressBar: { ...p, showPercentage: e.target.checked } })
            }
          />
          Mostrar percentagem
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-small text-[var(--text-secondary)]">
          <input
            type="checkbox"
            checked={p.showCount}
            onChange={(e) => onChange({ ...theme, progressBar: { ...p, showCount: e.target.checked } })}
          />
          Mostrar contagem (obrigatórias preenchidas)
        </label>
      </fieldset>
      <fieldset className="space-y-3">
        <legend className="text-small font-medium text-[var(--text-primary)]">Navegação</legend>
        <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
          Modo
          <select
            value={n.mode}
            onChange={(e) =>
              onChange({
                ...theme,
                navigation: { ...n, mode: e.target.value as typeof n.mode },
              })
            }
            className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
          >
            <option value="continuous">Todas as perguntas na mesma página</option>
            <option value="wizard">Passo a passo (por secção)</option>
          </select>
        </label>
        <p className="text-small text-[var(--text-secondary)]">
          No modo passo a passo, cada bloco entre cabeçalhos de secção é um passo; respondentes identificados têm um
          passo inicial para os dados.
        </p>
      </fieldset>
      <fieldset className="space-y-3">
        <legend className="text-small font-medium text-[var(--text-primary)]">Pré-visualização responsiva</legend>
        <p className="text-small text-[var(--text-secondary)]">
          Larguras máximas simuladas para telemóvel e tablet na coluna de pré-visualização do editor.
        </p>
        <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
          Telemóvel (px)
          <input
            type="number"
            min={280}
            max={600}
            value={r.mobileBreakpoint}
            onChange={(e) =>
              onChange({
                ...theme,
                responsive: { ...r, mobileBreakpoint: Number(e.target.value) || r.mobileBreakpoint },
              })
            }
            className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
          />
        </label>
        <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
          Tablet (px)
          <input
            type="number"
            min={600}
            max={1400}
            value={r.tabletBreakpoint}
            onChange={(e) =>
              onChange({
                ...theme,
                responsive: { ...r, tabletBreakpoint: Number(e.target.value) || r.tabletBreakpoint },
              })
            }
            className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
          />
        </label>
      </fieldset>
    </div>
  );
}
