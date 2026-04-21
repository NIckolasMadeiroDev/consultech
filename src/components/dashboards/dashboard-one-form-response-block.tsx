"use client";

import type { FormResponseAggregate } from "@/lib/api";
import { RESPONSE_EXPORT_DEFAULT_LIMIT } from "@/lib/response-export-limits";
import { Card } from "@/components/ui/card";
import { QuestionAggregateChart } from "./question-aggregate-chart";
import { DashboardFormResponsesPreview } from "./dashboard-form-responses-preview";

export function DashboardOneFormResponseBlock({
  formId,
  title,
  responseCount,
  aggregates,
  userId,
  startDate,
  endDate,
}: Readonly<{
  formId: string;
  title: string;
  responseCount: number;
  aggregates: FormResponseAggregate[];
  userId?: string;
  startDate?: string;
  endDate?: string;
}>) {
  return (
    <Card padding="lg">
      <h3 className="text-h4 text-[var(--text-primary)]">{title}</h3>
      <p className="mt-1 text-caption text-[var(--text-secondary)]">
        {responseCount} resposta(s) no período ·{" "}
        <a
          className="text-primary-600 underline dark:text-primary-400"
          href={`/admin/forms/${formId}/responses`}
        >
          Abrir respostas do formulário
        </a>
      </p>
      {responseCount === 0 ? (
        <p className="mt-lg text-body text-[var(--text-secondary)]">
          Ainda não há respostas neste período — os gráficos aparecerão quando houver dados.
        </p>
      ) : aggregates.length === 0 ? (
        <p className="mt-lg text-body text-[var(--text-secondary)]">
          Não há perguntas com respostas agregáveis. Adicione perguntas de escolha, escala ou texto.
        </p>
      ) : (
        <div className="mt-lg space-y-lg">
          {aggregates.map((agg) => (
            <div key={agg.questionId}>
              <p className="mb-2 text-small font-medium text-[var(--text-primary)]">{agg.text}</p>
              <p className="mb-2 text-caption text-[var(--text-secondary)]">
                Tipo: {agg.type} · Preenchidas: {agg.total - agg.empty} de {agg.total}
              </p>
              <QuestionAggregateChart aggregate={agg} />
            </div>
          ))}
          <DashboardFormResponsesPreview
            formId={formId}
            formTitle={title}
            userId={userId}
            startDate={startDate}
            endDate={endDate}
            columns={aggregates.map((a) => ({ questionId: a.questionId, label: a.text }))}
            exportLimit={RESPONSE_EXPORT_DEFAULT_LIMIT}
          />
        </div>
      )}
    </Card>
  );
}
