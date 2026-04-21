"use client";

import { Card } from "@/components/ui/card";
import { acceptsAnswerValue } from "@/lib/form-question-kinds";
import type { FormResponseAggregate } from "@/lib/api";

export function FormResponsesQuestionTab(props: {
  readonly loading: boolean;
  readonly aggregates: FormResponseAggregate[] | null;
  readonly sortedQuestions: Array<{ id: string; text: string; type: string; orderIndex: number }>;
  readonly selectedQuestionId: string | null;
  readonly onSelectQuestion: (id: string | null) => void;
}) {
  const { loading, aggregates, sortedQuestions, selectedQuestionId, onSelectQuestion } = props;
  const answerable = sortedQuestions.filter((q) => acceptsAnswerValue(q.type));

  if (loading || !aggregates) {
    return (
      <Card padding="lg">
        <p className="text-body text-[var(--text-secondary)]">A carregar…</p>
      </Card>
    );
  }

  const agg = aggregates.find((a) => a.questionId === selectedQuestionId);

  return (
    <Card padding="lg">
      <div className="space-y-4">
        <div>
          <label htmlFor="qsel" className="mb-1 block text-caption text-[var(--text-secondary)]">
            Pergunta
          </label>
          <select
            id="qsel"
            value={selectedQuestionId ?? ""}
            onChange={(e) => onSelectQuestion(e.target.value || null)}
            className="h-10 w-full max-w-xl rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
          >
            {answerable.map((q) => (
              <option key={q.id} value={q.id}>
                {q.text.slice(0, 120)}
              </option>
            ))}
          </select>
        </div>
        {!agg ? (
          <p className="text-body text-[var(--text-secondary)]">Sem dados.</p>
        ) : agg.optionCounts ? (
          <ul className="space-y-1">
            {Object.entries(agg.optionCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([k, n]) => (
                <li key={k} className="flex justify-between text-body text-[var(--text-primary)]">
                  <span>{k}</span>
                  <span className="text-[var(--text-secondary)]">{n}</span>
                </li>
              ))}
          </ul>
        ) : agg.numericSamples?.length ? (
          <p className="text-body text-[var(--text-primary)]">
            Média:{" "}
            {(agg.numericSamples.reduce((a, b) => a + b, 0) / agg.numericSamples.length).toFixed(2)} (n=
            {agg.numericSamples.length})
          </p>
        ) : agg.textSamples?.length ? (
          <ul className="list-disc space-y-2 pl-5 text-body text-[var(--text-primary)]">
            {agg.textSamples.slice(0, 24).map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        ) : (
          <p className="text-body text-[var(--text-secondary)]">Sem respostas preenchidas.</p>
        )}
      </div>
    </Card>
  );
}
