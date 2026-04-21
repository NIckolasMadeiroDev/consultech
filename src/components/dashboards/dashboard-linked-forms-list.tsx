"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type FormDetail = {
  formId: string;
  title: string;
  count: number;
  lastSubmittedAt: string | null;
};

export function DashboardLinkedFormsList({
  dashboardTitle,
  dashboardFormIds,
  formDetails,
  detailsLoading,
  periodLabel,
}: Readonly<{
  dashboardTitle: string;
  dashboardFormIds: string[];
  formDetails: FormDetail[];
  detailsLoading: boolean;
  periodLabel: string;
}>) {
  return (
    <Card padding="lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-h4 text-[var(--text-primary)]">Formulários vinculados</h3>
      </div>
      {(() => {
        if (detailsLoading && formDetails.length === 0) {
          return (
            <ul className="space-y-2 pt-lg">
              {dashboardFormIds.map((formId) => (
                <li key={formId} className="h-14 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
              ))}
            </ul>
          );
        }
        if (formDetails.length > 0) {
          return (
            <ul className="space-y-3 pt-lg">
              {formDetails.map((f) => (
                <li key={f.formId}>
                  <Card className="flex flex-wrap items-center justify-between gap-3" padding="md">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/forms/${f.formId}/responses`}
                        className="font-medium text-primary-600 hover:underline dark:text-primary-400"
                      >
                        {f.title}
                      </Link>
                      <p className="mt-1 text-caption text-[var(--text-secondary)]">
                        {f.count} resposta(s)
                        {f.lastSubmittedAt
                          ? ` · Última em ${new Date(f.lastSubmittedAt).toLocaleDateString("pt-BR")}`
                          : ""}
                        {" · "}
                        {periodLabel}
                      </p>
                    </div>
                    <Link href={`/admin/forms/${f.formId}/responses`}>
                      <Button variant="ghost" size="sm" leftIcon={<ExternalLink className="h-4 w-4" />}>
                        Ver respostas
                      </Button>
                    </Link>
                  </Card>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p className="pt-lg text-body text-[var(--text-secondary)]">
            Nenhum formulário vinculado a &quot;{dashboardTitle}&quot;. Use Editar para adicionar.
          </p>
        );
      })()}
    </Card>
  );
}
