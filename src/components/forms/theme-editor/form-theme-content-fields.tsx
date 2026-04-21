"use client";

type FormThemeContentFieldsProps = {
  readonly welcomeMessage: string;
  readonly submitButtonText: string;
  readonly successMessage: string;
  readonly successPageHtml: string;
  readonly successRedirectUrl: string;
  readonly successRedirectDelay: number;
  readonly onWelcomeChange: (v: string) => void;
  readonly onSubmitLabelChange: (v: string) => void;
  readonly onSuccessChange: (v: string) => void;
  readonly onSuccessPageHtmlChange: (v: string) => void;
  readonly onSuccessRedirectUrlChange: (v: string) => void;
  readonly onSuccessRedirectDelayChange: (v: number) => void;
};

export function FormThemeContentFields({
  welcomeMessage,
  submitButtonText,
  successMessage,
  successPageHtml,
  successRedirectUrl,
  successRedirectDelay,
  onWelcomeChange,
  onSubmitLabelChange,
  onSuccessChange,
  onSuccessPageHtmlChange,
  onSuccessRedirectUrlChange,
  onSuccessRedirectDelayChange,
}: FormThemeContentFieldsProps) {
  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
        Mensagem de boas-vindas (opcional)
        <textarea
          value={welcomeMessage}
          onChange={(e) => onWelcomeChange(e.target.value)}
          rows={3}
          className="rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body dark:border-neutral-600"
        />
      </label>
      <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
        Texto do botão de envio
        <input
          type="text"
          value={submitButtonText}
          onChange={(e) => onSubmitLabelChange(e.target.value)}
          className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
        />
      </label>
      <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
        Mensagem após envio (opcional; substitui a mensagem de encerramento nesse ecrã)
        <textarea
          value={successMessage}
          onChange={(e) => onSuccessChange(e.target.value)}
          rows={3}
          className="rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body dark:border-neutral-600"
        />
      </label>
      <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
        Página de sucesso (HTML seguro; opcional — se preencher, substitui o texto simples acima)
        <textarea
          value={successPageHtml}
          onChange={(e) => onSuccessPageHtmlChange(e.target.value)}
          rows={5}
          className="rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 font-mono text-caption dark:border-neutral-600"
          placeholder="<p>Obrigado…</p>"
        />
      </label>
      <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
        Redirecionar para URL após envio (opcional)
        <input
          type="url"
          value={successRedirectUrl}
          onChange={(e) => onSuccessRedirectUrlChange(e.target.value)}
          className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
          placeholder="https://"
        />
      </label>
      <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
        Atraso antes do redirecionamento (segundos; 0 = imediato)
        <input
          type="number"
          min={0}
          max={600}
          value={successRedirectDelay}
          onChange={(e) => onSuccessRedirectDelayChange(Number(e.target.value) || 0)}
          className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body dark:border-neutral-600"
        />
      </label>
    </div>
  );
}
