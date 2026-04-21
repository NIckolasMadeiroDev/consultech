"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { DashboardSummaryStrip } from "./dashboard-summary-strip";
import { DashboardReadyPanels } from "./dashboard-ready-panels";
import { DashboardAbandonmentTable } from "./dashboard-abandonment-table";
import { DashboardLinkedFormsList } from "./dashboard-linked-forms-list";

type Analytics = {
  avgCompletionRate: number | null;
  abandonmentByQuestion: Array<{
    formId: string;
    formTitle: string;
    questionId: string;
    questionText: string;
    orderIndex: number;
    eligibleResponses: number;
    answeredCount: number;
    responseRatePercent: number;
    abandonmentEstimatePercent: number;
  }>;
  avgTimeHint: string;
};

type FormDetail = {
  formId: string;
  title: string;
  count: number;
  lastSubmittedAt: string | null;
};

export function DashboardFlowMetricsSection({
  defaultCollapsed,
  analytics,
  analyticsLoading,
  dashboardTitle,
  dashboardFormIds,
  formDetails,
  detailsLoading,
  totalResponses,
  periodLabel,
}: Readonly<{
  defaultCollapsed: boolean;
  analytics: Analytics | null;
  analyticsLoading: boolean;
  dashboardTitle: string;
  dashboardFormIds: string[];
  formDetails: FormDetail[];
  detailsLoading: boolean;
  totalResponses: number;
  periodLabel: string;
}>) {
  const [open, setOpen] = useState(!defaultCollapsed);

  return (
    <section className="mb-lg" aria-labelledby="dashboard-flow-heading">
      <div className="mb-md flex flex-wrap items-center justify-between gap-2">
        <h2 id="dashboard-flow-heading" className="text-h4 text-[var(--text-primary)]">
          Fluxo de preenchimento
        </h2>
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          leftIcon={<ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />}
        >
          {open ? "Recolher" : "Expandir"}
        </Button>
      </div>
      <p className="mb-lg text-caption text-[var(--text-secondary)]">
        Conclusão, tempo (quando disponível) e abandono estimado. Quando todas as perguntas respondíveis são
        obrigatórias, esta secção inicia recolhida para dar destaque ao conteúdo das respostas.
      </p>
      {open && (
        <>
          <DashboardSummaryStrip
            formCount={dashboardFormIds.length}
            totalResponses={totalResponses}
            detailsLoading={detailsLoading}
            periodLabel={periodLabel}
          />
          <DashboardReadyPanels analytics={analytics} analyticsLoading={analyticsLoading} />
          {analytics && (
            <DashboardAbandonmentTable rows={analytics.abandonmentByQuestion} />
          )}
          <DashboardLinkedFormsList
            dashboardTitle={dashboardTitle}
            dashboardFormIds={dashboardFormIds}
            formDetails={formDetails}
            detailsLoading={detailsLoading}
            periodLabel={periodLabel}
          />
        </>
      )}
    </section>
  );
}
