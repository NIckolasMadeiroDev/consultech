"use client";

const BORDER: Record<string, string> = {
  solid: "border-t border-neutral-300 dark:border-neutral-600",
  dashed: "border-t border-dashed border-neutral-300 dark:border-neutral-600",
  dotted: "border-t border-dotted border-neutral-300 dark:border-neutral-600",
  spacer: "border-0",
};

export type SeparatorDisplayProps = {
  readonly styleId?: string | null;
};

export function SeparatorDisplay({ styleId }: SeparatorDisplayProps) {
  const key = styleId && BORDER[styleId] ? styleId : "solid";
  return (
    <div className="my-4" role="separator" aria-hidden>
      <div className={`${BORDER[key] ?? BORDER.solid} ${key === "spacer" ? "h-6" : "pt-2"}`} />
    </div>
  );
}
