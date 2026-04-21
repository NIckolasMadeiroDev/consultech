"use client";

import { markdownToSafeHtml } from "@/lib/markdown-to-safe-html";

export type SafeFormattedTextProps = {
  readonly source: string;
  readonly className?: string;
};

export function SafeFormattedText({ source, className }: SafeFormattedTextProps) {
  const html = markdownToSafeHtml(source);
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
