"use client";

import { FORM_QUESTION_ICON_NAMES } from "@/lib/form-question-icon-options";
import { QuestionLabelIcon } from "@/components/forms/question-label-icon";

type IconSelectorProps = {
  readonly value: string;
  readonly questionType: string;
  readonly onChange: (next: string) => void;
};

export function IconSelector({ value, questionType, onChange }: IconSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-small text-[var(--text-secondary)]">
        Ícone ao lado do enunciado (opcional; usa o padrão do tipo se vazio)
      </p>
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => onChange("")}
          className={`rounded-lg border px-2 py-1.5 text-caption ${
            !value.trim()
              ? "border-primary-500 bg-primary-50 dark:bg-primary-950/40"
              : "border-neutral-200 dark:border-neutral-600"
          }`}
        >
          Padrão
        </button>
        {FORM_QUESTION_ICON_NAMES.map((name) => (
          <button
            key={name}
            type="button"
            title={name}
            onClick={() => onChange(name)}
            className={`rounded-lg border p-2 ${
              value === name
                ? "border-primary-500 bg-primary-50 dark:bg-primary-950/40"
                : "border-neutral-200 dark:border-neutral-600"
            }`}
          >
            <QuestionLabelIcon questionType={questionType} customIcon={name} className="h-4 w-4 text-[var(--text-primary)]" />
          </button>
        ))}
      </div>
    </div>
  );
}
