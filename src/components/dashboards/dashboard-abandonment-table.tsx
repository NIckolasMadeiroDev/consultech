"use client";

import { Card } from "@/components/ui/card";

type Row = {
  formId: string;
  formTitle: string;
  questionId: string;
  questionText: string;
  orderIndex: number;
  eligibleResponses: number;
  answeredCount: number;
  responseRatePercent: number;
  abandonmentEstimatePercent: number;
};

export function DashboardAbandonmentTable({ rows }: Readonly<{ rows: Row[] }>) {
  if (rows.length === 0) return null;
  return (
    <Card className="mb-lg" padding="lg">
      <h3 className="text-h4 text-[var(--text-primary)]">Abandono estimado por pergunta</h3>
      <p className="mt-1 text-caption text-[var(--text-secondary)]">
        Para cada pergunta: entre respostas em que ela era visível, percentual que não preencheu.
      </p>
      <div className="mt-lg overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-body">
          <thead>
            <tr className="border-b border-neutral-200 text-caption text-[var(--text-secondary)] dark:border-neutral-700">
              <th className="pb-2 pr-4 font-medium">Formulário</th>
              <th className="pb-2 pr-4 font-medium">Pergunta</th>
              <th className="pb-2 pr-4 font-medium">Responderam</th>
              <th className="pb-2 font-medium">Abandono est.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.formId}-${row.questionId}`}
                className="border-b border-neutral-100 dark:border-neutral-800"
              >
                <td className="py-2 pr-4 text-[var(--text-primary)]">{row.formTitle}</td>
                <td className="max-w-xs py-2 pr-4 text-[var(--text-primary)]">
                  <span className="line-clamp-2">{row.questionText}</span>
                </td>
                <td className="py-2 pr-4 text-[var(--text-secondary)]">
                  {row.responseRatePercent}% ({row.answeredCount}/{row.eligibleResponses})
                </td>
                <td className="py-2 text-[var(--text-primary)]">{row.abandonmentEstimatePercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
