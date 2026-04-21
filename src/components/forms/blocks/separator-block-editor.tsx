"use client";

const STYLES = [
  { id: "solid" as const, label: "Linha sólida" },
  { id: "dashed" as const, label: "Tracejada" },
  { id: "dotted" as const, label: "Pontilhada" },
  { id: "spacer" as const, label: "Espaço (sem linha)" },
];

export type SeparatorBlockEditorProps = {
  readonly styleId: string;
  readonly onChange: (styleId: string) => void;
  readonly disabled?: boolean;
};

export function SeparatorBlockEditor({ styleId, onChange, disabled }: SeparatorBlockEditorProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-small font-medium text-[var(--text-primary)]">Estilo do separador</legend>
      <div className="flex flex-wrap gap-2">
        {STYLES.map((s) => (
          <label
            key={s.id}
            className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-small dark:border-neutral-700"
          >
            <input
              type="radio"
              name="separator-style"
              value={s.id}
              checked={styleId === s.id}
              onChange={() => onChange(s.id)}
              disabled={disabled}
            />
            {s.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
