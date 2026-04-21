"use client";

import type { FormThemeLayout } from "@/types/form-theme";

type LayoutCanvasSectionProps = {
  readonly layout: FormThemeLayout;
  readonly onChange: (next: FormThemeLayout) => void;
};

export function LayoutCanvasSection({ layout, onChange }: LayoutCanvasSectionProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="sm:col-span-2 flex flex-col gap-2 text-small text-[var(--text-secondary)]">
        Largura do formulário ({layout.containerWidthPercent}% da janela)
        <input
          type="range"
          min={40}
          max={100}
          value={layout.containerWidthPercent}
          onChange={(e) =>
            onChange({ ...layout, containerWidthPercent: Number(e.target.value) })
          }
          className="w-full"
        />
        <div className="flex flex-wrap gap-2">
          {[50, 66, 80, 100].map((p) => (
            <button
              key={p}
              type="button"
              className="rounded-lg border border-neutral-300 px-3 py-1 text-small hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800"
              onClick={() => onChange({ ...layout, containerWidthPercent: p })}
            >
              {p}%
            </button>
          ))}
        </div>
      </label>
      <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
        Largura máxima (px)
        <input
          type="number"
          min={320}
          max={2400}
          value={layout.maxWidthPx ?? 720}
          onChange={(e) =>
            onChange({ ...layout, maxWidthPx: Number(e.target.value) || undefined })
          }
          className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
        />
      </label>
      <fieldset className="flex flex-col gap-2 text-small text-[var(--text-secondary)]">
        <legend className="mb-1 font-medium text-[var(--text-primary)]">Alinhamento</legend>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="align"
            checked={layout.align === "center"}
            onChange={() => onChange({ ...layout, align: "center" })}
          />
          Centrado
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="align"
            checked={layout.align === "start"}
            onChange={() => onChange({ ...layout, align: "start" })}
          />
          À esquerda
        </label>
      </fieldset>
      <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
        Padding horizontal da página
        <input
          type="text"
          value={layout.pagePaddingX}
          onChange={(e) => onChange({ ...layout, pagePaddingX: e.target.value })}
          className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
        />
      </label>
      <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
        Padding vertical da página
        <input
          type="text"
          value={layout.pagePaddingY}
          onChange={(e) => onChange({ ...layout, pagePaddingY: e.target.value })}
          className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
        />
      </label>
    </div>
  );
}
