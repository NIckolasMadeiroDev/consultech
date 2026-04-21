"use client";

import { Card } from "@/components/ui/card";
import { acceptsAnswerValue } from "@/lib/form-question-kinds";
import type { ResponseRow } from "./form-responses-submission-tab";

function cellValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function FormResponsesTableTab(props: {
  readonly list: ResponseRow[];
  readonly sortedQuestions: Array<{ id: string; text: string; type: string; orderIndex: number }>;
}) {
  const { list, sortedQuestions } = props;
  const cols = sortedQuestions.filter((q) => acceptsAnswerValue(q.type));

  return (
    <Card padding="none" className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-small">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-700">
            <th className="p-3 font-medium">Data</th>
            <th className="p-3 font-medium">Nome</th>
            {cols.map((q) => (
              <th key={q.id} className="p-3 font-medium">
                {q.text.slice(0, 40)}
                {q.text.length > 40 ? "…" : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.map((r) => (
            <tr key={r.id} className="border-b border-neutral-100 dark:border-neutral-800">
              <td className="p-3 text-[var(--text-secondary)]">
                {new Date(r.submittedAt).toLocaleString("pt-PT")}
              </td>
              <td className="p-3">{r.respondent?.name ?? "—"}</td>
              {cols.map((q) => (
                <td key={q.id} className="p-3 text-[var(--text-primary)]">
                  {cellValue(r.answers.find((a) => a.questionId === q.id)?.value)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
