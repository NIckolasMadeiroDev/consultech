"use client";

export type MarkdownBlockEditorProps = {
  readonly value: string;
  readonly onChange: (markdown: string) => void;
  readonly disabled?: boolean;
  readonly "aria-labelledby"?: string;
};

export function MarkdownBlockEditor({
  value,
  onChange,
  disabled,
  "aria-labelledby": ariaLabelledBy,
}: MarkdownBlockEditorProps) {
  return (
    <textarea
      className="mt-2 min-h-[160px] w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 font-mono text-small text-[var(--text-primary)] outline-none focus-visible:ring-2 focus-visible:ring-primary-600 dark:border-neutral-600"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      aria-labelledby={ariaLabelledBy}
      placeholder="## Título&#10;- lista&#10;[link](https://...)"
    />
  );
}
