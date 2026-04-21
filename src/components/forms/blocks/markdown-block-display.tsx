"use client";

import { markdownToSafeHtml } from "@/lib/markdown-to-safe-html";

export type MarkdownBlockDisplayProps = {
  readonly source: string;
};

export function MarkdownBlockDisplay({ source }: MarkdownBlockDisplayProps) {
  const safe = markdownToSafeHtml(source);
  if (!safe) return null;
  return (
    <div
      className="prose prose-neutral max-w-none text-body text-[var(--text-primary)] dark:prose-invert [&_a]:text-primary-600 [&_a]:underline"
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
