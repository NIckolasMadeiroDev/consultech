"use client";

import type { FormResponseAggregate } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { DashboardOneFormResponseBlock } from "./dashboard-one-form-response-block";

type FormBlock = {
  formId: string;
  title: string;
  responseCount: number;
  aggregates: FormResponseAggregate[];
};

export function DashboardResponseContentSection({
  forms,
  userId,
  startDate,
  endDate,
  loading,
}: Readonly<{
  forms: FormBlock[];
  userId?: string;
  startDate?: string;
  endDate?: string;
  loading: boolean;
}>) {
  if (loading) {
    return (
      <Card padding="lg" className="mb-lg">
        <div className="h-6 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="mt-4 space-y-3">
          <div className="h-40 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
        </div>
      </Card>
    );
  }

  if (forms.length === 0) {
    return null;
  }

  return (
    <section className="mb-lg" aria-labelledby="dashboard-response-content-heading">
      <h2 id="dashboard-response-content-heading" className="mb-md text-h4 text-[var(--text-primary)]">
        Conteúdo das respostas
      </h2>
      <p className="mb-lg text-caption text-[var(--text-secondary)]">
        Distribuições por pergunta usam o mesmo período selecionado abaixo. Gráficos configuráveis no
        dashboard reutilizam a mesma lógica de agregação nas APIs de dados (com filtro de datas opcional).
      </p>
      <div className="space-y-lg">
        {forms.map((f) => (
          <DashboardOneFormResponseBlock
            key={f.formId}
            formId={f.formId}
            title={f.title}
            responseCount={f.responseCount}
            aggregates={f.aggregates}
            userId={userId}
            startDate={startDate}
            endDate={endDate}
          />
        ))}
      </div>
    </section>
  );
}
