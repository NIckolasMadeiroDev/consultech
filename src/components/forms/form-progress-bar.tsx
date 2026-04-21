"use client";

import type { ReactNode } from "react";
import type { FormTheme } from "@/types/form-theme";

export type FormProgressMetrics = {
  readonly filled: number;
  readonly totalReq: number;
  readonly pct: number;
  readonly sectionTitle: string;
  readonly sectionIndex: number;
  readonly sectionTotal: number;
};

type FormProgressBarProps = {
  readonly themeVisual: FormTheme | undefined;
  readonly metrics: FormProgressMetrics;
  readonly draftNote: ReactNode;
  readonly preview: boolean;
};

export function FormProgressBar({ themeVisual, metrics, draftNote, preview }: FormProgressBarProps) {
  const cfg = themeVisual?.progressBar;
  if (cfg && cfg.enabled === false) {
    return null;
  }
  const style = cfg?.style ?? "bar";
  const showPct = cfg?.showPercentage !== false;
  const showCount = cfg?.showCount !== false;
  const { filled, totalReq, pct, sectionTitle, sectionIndex, sectionTotal } = metrics;
  const countLabel =
    totalReq === 0
      ? "Nenhuma pergunta obrigatória nesta etapa"
      : showCount
        ? `Obrigatórias: ${filled} de ${totalReq}`
        : null;
  const pctLabel = showPct && totalReq > 0 ? `${pct}%` : null;

  return (
    <div className="mb-lg space-y-2" aria-live="polite">
      <div className="flex flex-col gap-1 text-small text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {countLabel}
          {pctLabel ? <span className="text-[var(--text-secondary)]">({pctLabel})</span> : null}
        </span>
        <span className="truncate sm:max-w-[55%]" title={sectionTitle}>
          Seção {sectionIndex}/{sectionTotal}: {sectionTitle}
        </span>
      </div>
      {style === "bar" ? (
        <div
          className={
            themeVisual
              ? "form-theme-progress-track h-2 w-full overflow-hidden rounded-full"
              : "h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700"
          }
          role="progressbar"
          aria-valuenow={totalReq === 0 ? 1 : filled}
          aria-valuemin={0}
          aria-valuemax={totalReq === 0 ? 1 : totalReq}
          aria-label="Progresso das perguntas obrigatórias respondidas"
        >
          <div
            className={
              themeVisual
                ? "form-theme-progress-fill h-full rounded-full transition-[width] duration-300 ease-out"
                : "h-full rounded-full bg-primary-600 transition-[width] duration-300 ease-out"
            }
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}
      {style === "steps" ? (
        <div className="flex flex-wrap gap-1" role="presentation">
          {Array.from({ length: Math.max(1, totalReq) }).map((_, i) => (
            <span
              key={`step-${i}`}
              className={
                i < filled
                  ? themeVisual
                    ? "h-2 w-8 rounded-full bg-[color:var(--form-progress-fill)]"
                    : "h-2 w-8 rounded-full bg-primary-600"
                  : themeVisual
                    ? "h-2 w-8 rounded-full bg-[color:var(--form-progress-track)]"
                    : "h-2 w-8 rounded-full bg-neutral-300 dark:bg-neutral-600"
              }
            />
          ))}
        </div>
      ) : null}
      {style === "circular" ? (
        <div className="flex items-center gap-3">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            className="shrink-0 -rotate-90"
            aria-hidden
          >
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              className={themeVisual ? "stroke-[color:var(--form-progress-track)]" : "stroke-neutral-200 dark:stroke-neutral-600"}
              strokeWidth="6"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              className={themeVisual ? "stroke-[color:var(--form-progress-fill)]" : "stroke-primary-600"}
              strokeWidth="6"
              strokeDasharray={`${(pct / 100) * 125.6} 125.6`}
              strokeLinecap="round"
            />
          </svg>
          {pctLabel ? <span className="text-body font-medium text-[var(--text-primary)]">{pctLabel}</span> : null}
        </div>
      ) : null}
      {!preview ? draftNote : null}
    </div>
  );
}
