type HelpTextEditorProps = Readonly<{
  helpText: string;
  placeholder: string;
  onHelpTextChange: (value: string) => void;
  onPlaceholderChange: (value: string) => void;
  showPlaceholder: boolean;
  disabled?: boolean;
}>;

const HELP_MAX = 2000;
const PH_MAX = 300;

export function HelpTextEditor({
  helpText,
  placeholder,
  onHelpTextChange,
  onPlaceholderChange,
  showPlaceholder,
  disabled,
}: HelpTextEditorProps) {
  return (
    <div className="mt-3 space-y-3">
      <div>
        <label
          htmlFor="help-text-edit"
          className="mb-1 block text-small font-medium text-[var(--text-primary)]"
        >
          Texto de ajuda (opcional)
        </label>
        <textarea
          id="help-text-edit"
          value={helpText}
          onChange={(e) => onHelpTextChange(e.target.value)}
          disabled={disabled}
          maxLength={HELP_MAX}
          rows={2}
          placeholder="Dica curta; o respondente abre ao clicar no ícone (?)."
          className="w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60 dark:border-neutral-600"
        />
        <p className="mt-1 text-caption text-[var(--text-secondary)]">
          {helpText.length}/{HELP_MAX}
        </p>
      </div>
      {showPlaceholder ? (
        <div>
          <label
            htmlFor="placeholder-edit"
            className="mb-1 block text-small font-medium text-[var(--text-primary)]"
          >
            Placeholder do campo (opcional)
          </label>
          <input
            id="placeholder-edit"
            type="text"
            value={placeholder}
            onChange={(e) => onPlaceholderChange(e.target.value)}
            disabled={disabled}
            maxLength={PH_MAX}
            placeholder="Ex.: Digite aqui…"
            className="w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60 dark:border-neutral-600"
          />
          <p className="mt-1 text-caption text-[var(--text-secondary)]">
            {placeholder.length}/{PH_MAX}
          </p>
        </div>
      ) : null}
    </div>
  );
}
