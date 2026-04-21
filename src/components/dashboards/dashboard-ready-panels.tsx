"use client";

import { Clock, ListOrdered, Percent } from "lucide-react";
import { Card } from "@/components/ui/card";

type Analytics = {
  avgCompletionRate: number | null;
  abandonmentByQuestion: unknown[];
  avgTimeHint: string;
};

export function DashboardReadyPanels({
  analytics,
  analyticsLoading,
}: Readonly<{
  analytics: Analytics | null;
  analyticsLoading: boolean;
}>) {
  return (
    <div className="mb-lg grid gap-md lg:grid-cols-3">
      <Card className="flex items-start gap-4 transition-shadow duration-150 ease-out hover:shadow-md" padding="md">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
          <Percent className="h-6 w-6 text-emerald-700 dark:text-emerald-400" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-caption text-[var(--text-secondary)]">Taxa de conclusão média</p>
          <p className="mt-1 text-h4 text-[var(--text-primary)]">
            {analyticsLoading
              ? "—"
              : analytics?.avgCompletionRate != null
                ? `${(analytics.avgCompletionRate * 100).toFixed(1)}%`
                : "—"}
          </p>
          <p className="mt-2 text-caption text-[var(--text-secondary)]">
            Média do preenchimento das perguntas visíveis por resposta (condicionais consideradas).
          </p>
        </div>
      </Card>
      <Card className="flex items-start gap-4 transition-shadow duration-150 ease-out hover:shadow-md" padding="md">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
          <Clock className="h-6 w-6 text-amber-800 dark:text-amber-400" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-caption text-[var(--text-secondary)]">Tempo médio por resposta</p>
          <p className="mt-1 text-h4 text-[var(--text-primary)]">—</p>
          <p className="mt-2 text-caption text-[var(--text-secondary)]">
            {analytics?.avgTimeHint ??
              "Quando houver timestamps por etapa, o tempo médio aparecerá aqui."}
          </p>
        </div>
      </Card>
      <Card className="flex items-start gap-4 transition-shadow duration-150 ease-out hover:shadow-md" padding="md">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/30">
          <ListOrdered className="h-6 w-6 text-sky-800 dark:text-sky-400" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="text-caption text-[var(--text-secondary)]">Abandono por pergunta</p>
          <p className="mt-1 text-h4 text-[var(--text-primary)]">
            {analyticsLoading
              ? "—"
              : analytics && analytics.abandonmentByQuestion.length > 0
                ? `${analytics.abandonmentByQuestion.length} perguntas`
                : "—"}
          </p>
          <p className="mt-2 text-caption text-[var(--text-secondary)]">
            Estimativa de não resposta entre quem viu a pergunta (útil para opcionais e funil).
          </p>
        </div>
      </Card>
    </div>
  );
}
