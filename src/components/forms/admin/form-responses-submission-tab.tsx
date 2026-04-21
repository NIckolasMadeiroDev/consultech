"use client";

import { Card } from "@/components/ui/card";
import { acceptsAnswerValue } from "@/lib/form-question-kinds";
import { groupQuestionsIntoSections } from "@/lib/group-form-questions-into-sections";

export type ResponseRow = {
  id: string;
  submittedAt: string;
  respondent: { name?: string; email?: string; department?: string } | null;
  answers: Array<{ questionId: string; value: unknown }>;
};

function answerLabel(qid: string, value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function FormResponsesSubmissionTab(props: {
  readonly list: ResponseRow[];
  readonly questions: Array<{ id: string; text: string; type: string; orderIndex: number }>;
  readonly selectedResponseId: string | null;
  readonly onSelectResponse: (id: string) => void;
}) {
  const { list, questions, selectedResponseId, onSelectResponse } = props;
  const sortedQs = [...questions].sort((a, b) => a.orderIndex - b.orderIndex);
  const sections = groupQuestionsIntoSections(sortedQs);
  const selected = list.find((r) => r.id === selectedResponseId) ?? null;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <ul className="flex flex-col gap-2">
        {list.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onSelectResponse(r.id)}
              className={`w-full rounded-lg border px-3 py-3 text-left transition-colors ${
                selectedResponseId === r.id
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-950/30"
                  : "border-neutral-200 bg-[var(--background)] hover:border-neutral-300 dark:border-neutral-700"
              }`}
            >
              <div className="flex justify-between gap-2 text-caption text-[var(--text-secondary)]">
                <span>{r.respondent?.name ?? "Anónimo"}</span>
                <span>{new Date(r.submittedAt).toLocaleString("pt-PT")}</span>
              </div>
              <div className="mt-1 text-small text-[var(--text-secondary)]">
                {r.respondent?.department?.trim() || "—"}
              </div>
            </button>
          </li>
        ))}
      </ul>
      <Card padding="lg" className="min-h-[200px]">
        {selected ? (
          <div>
            <h2 className="text-h3 text-[var(--text-primary)]">Detalhe</h2>
            <p className="mt-1 text-caption text-[var(--text-secondary)]">
              {selected.respondent?.name ?? "Anónimo"} · {selected.respondent?.email ?? "—"}
            </p>
            <nav className="mt-4 flex flex-wrap gap-2 border-b border-neutral-200 pb-2 dark:border-neutral-700">
              {sections.map((s, i) => (
                <a
                  key={`${s.title}-${i}`}
                  href={`#sec-${i}`}
                  className="text-small text-primary-600 hover:underline dark:text-primary-400"
                >
                  {s.title}
                </a>
              ))}
            </nav>
            <div className="mt-4 space-y-8">
              {sections.map((s, si) => (
                <section key={`${s.title}-${si}`} id={`sec-${si}`} className="scroll-mt-24">
                  <h3 className="text-body font-semibold text-[var(--text-primary)]">{s.title}</h3>
                  <ul className="mt-2 space-y-3">
                    {s.questions.map((q) => {
                      const a = selected.answers.find((x) => x.questionId === q.id);
                      if (!acceptsAnswerValue(q.type)) return null;
                      return (
                        <li key={q.id} className="rounded-lg border border-neutral-100 p-3 dark:border-neutral-800">
                          <p className="text-small font-medium text-[var(--text-primary)]">{q.text}</p>
                          <p className="mt-1 text-body text-[var(--text-secondary)]">
                            {answerLabel(q.id, a?.value)}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-body text-[var(--text-secondary)]">Selecione uma submissão na lista.</p>
        )}
      </Card>
    </div>
  );
}
