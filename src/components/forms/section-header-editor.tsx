type SectionHeaderEditorProps = Readonly<{
  sectionDescription: string;
  onSectionDescriptionChange: (value: string) => void;
  disabled?: boolean;
}>;

const MAX = 5000;

export function SectionHeaderEditor({
  sectionDescription,
  onSectionDescriptionChange,
  disabled,
}: SectionHeaderEditorProps) {
  return (
    <div className="mt-3">
      <label
        htmlFor="section-description-edit"
        className="mb-1 block text-small font-medium text-[var(--text-primary)]"
      >
        Descrição da seção (opcional)
      </label>
      <textarea
        id="section-description-edit"
        value={sectionDescription}
        onChange={(e) => onSectionDescriptionChange(e.target.value)}
        disabled={disabled}
        maxLength={MAX}
        rows={3}
        placeholder="Texto explicativo exibido abaixo do título da seção para os respondentes."
        className="w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60 dark:border-neutral-600"
      />
      <p className="mt-1 text-caption text-[var(--text-secondary)]">
        {sectionDescription.length}/{MAX}
      </p>
    </div>
  );
}
