"use client";

import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";

export type TextBlockDisplayProps = {
  readonly html: string;
};

export function TextBlockDisplay({ html }: TextBlockDisplayProps) {
  const safe = sanitizeRichHtml(html);
  if (!safe) return null;
  return (
    <div
      className="prose prose-neutral max-w-none text-body text-[var(--text-primary)] dark:prose-invert [&_a]:text-primary-600 [&_a]:underline"
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
