"use client";

import { FileText, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

export function DashboardSummaryStrip({
  formCount,
  totalResponses,
  detailsLoading,
  periodLabel,
}: Readonly<{
  formCount: number;
  totalResponses: number;
  detailsLoading: boolean;
  periodLabel: string;
}>) {
  return (
    <div className="mb-lg grid gap-md sm:grid-cols-2">
      <Card className="flex items-center gap-4 transition-shadow duration-150 ease-out hover:shadow-md" padding="md">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
          <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden />
        </div>
        <div>
          <p className="text-caption text-[var(--text-secondary)]">Formulários</p>
          <p className="text-h4 text-[var(--text-primary)]">{formCount}</p>
        </div>
      </Card>
      <Card className="flex items-center gap-4 transition-shadow duration-150 ease-out hover:shadow-md" padding="md">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
          <MessageSquare className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden />
        </div>
        <div>
          <p className="text-caption text-[var(--text-secondary)]">Respostas no total ({periodLabel})</p>
          <p className="text-h4 text-[var(--text-primary)]">{detailsLoading ? "—" : totalResponses}</p>
        </div>
      </Card>
    </div>
  );
}
