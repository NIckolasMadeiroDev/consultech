"use client";

import { useId, useState } from "react";
import { HelpCircle } from "lucide-react";
import { SafeFormattedText } from "@/components/forms/safe-formatted-text";

type QuestionHelpProps = Readonly<{
  helpText: string;
  labelId: string;
}>;

export function QuestionHelp({ helpText, labelId }: QuestionHelpProps) {
  const baseId = useId();
  const panelId = `${baseId}-help`;
  const [open, setOpen] = useState(false);
  const trimmed = helpText.trim();
  if (!trimmed) return null;

  return (
    <span className="relative inline-flex shrink-0 items-start">
      <button
        type="button"
        className="ml-1.5 inline-flex rounded p-0.5 text-primary-600 hover:bg-primary-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:text-primary-400"
        aria-expanded={open}
        aria-controls={panelId}
        aria-describedby={labelId}
        onClick={() => setOpen((v) => !v)}
      >
        <HelpCircle className="h-4 w-4" aria-hidden />
        <span className="sr-only">Ajuda sobre esta pergunta</span>
      </button>
      {open ? (
        <span
          id={panelId}
          role="region"
          className="absolute left-0 top-full z-20 mt-1 max-w-xs rounded-lg border border-neutral-200 bg-[var(--surface)] px-3 py-2 text-left text-small text-[var(--text-primary)] shadow-md dark:border-neutral-600"
        >
          <SafeFormattedText source={trimmed} className="prose prose-sm max-w-none dark:prose-invert" />
        </span>
      ) : null}
    </span>
  );
}
