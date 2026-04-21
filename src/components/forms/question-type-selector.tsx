"use client";

export type QuestionTypeOption = { readonly value: string; readonly label: string };

export type QuestionTypeSelectorProps = {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly groups: readonly {
    readonly heading: string;
    readonly options: readonly QuestionTypeOption[];
  }[];
  readonly id?: string;
  readonly "aria-labelledby"?: string;
};

export function QuestionTypeSelector({
  value,
  onChange,
  disabled,
  groups,
  id,
  "aria-labelledby": ariaLabelledBy,
}: QuestionTypeSelectorProps) {
  return (
    <select
      id={id}
      aria-labelledby={ariaLabelledBy}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="mb-2 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] dark:border-neutral-600"
    >
      {groups.map((g) => (
        <optgroup key={g.heading} label={g.heading}>
          {g.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
