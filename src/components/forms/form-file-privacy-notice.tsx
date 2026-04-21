const DEFAULT_COPY =
  "Os ficheiros que enviar são tratados conforme a política de privacidade desta organização e apenas para os fins indicados neste formulário.";

export type FormFilePrivacyNoticeProps = {
  readonly themed: boolean;
};

export function FormFilePrivacyNotice({ themed }: FormFilePrivacyNoticeProps) {
  const custom = process.env.NEXT_PUBLIC_FORM_FILE_PRIVACY_NOTICE?.trim();
  const text = custom && custom.length > 0 ? custom : DEFAULT_COPY;
  return (
    <p
      className={
        themed
          ? "mt-4 rounded-lg border border-[color-mix(in_srgb,var(--form-text-primary)_12%,transparent)] bg-[color-mix(in_srgb,var(--form-text-primary)_4%,transparent)] px-3 py-2 text-small text-[color:var(--form-text-secondary)]"
          : "mt-4 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-small text-[var(--text-secondary)] dark:border-neutral-600 dark:bg-neutral-900/40"
      }
      role="note"
    >
      {text}
    </p>
  );
}
