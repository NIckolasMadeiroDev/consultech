"use client";

import { useState } from "react";
import type { FormTheme } from "@/types/form-theme";
import { THEME_TEMPLATES } from "@/lib/theme-templates";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

type TemplateSelectorProps = {
  readonly onApply: (theme: FormTheme) => void;
};

export function TemplateSelector({ onApply }: TemplateSelectorProps) {
  const [pending, setPending] = useState<FormTheme | null>(null);
  return (
    <div className="space-y-3">
      <p className="text-small text-[var(--text-secondary)]">
        Aplicar um modelo substitui o tema atual. Pode guardar depois com &quot;Guardar tema&quot;.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {THEME_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setPending(t.theme)}
            className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-left transition hover:border-primary-400 dark:border-neutral-700 dark:bg-neutral-800/60"
          >
            <span className="block text-small font-semibold text-[var(--text-primary)]">{t.name}</span>
            <span className="mt-1 block text-caption text-[var(--text-secondary)]">{t.description}</span>
            <span
              className="mt-2 block h-2 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${t.theme.colors.primary}, ${t.theme.colors.secondary})`,
              }}
            />
          </button>
        ))}
      </div>
      <Modal
        open={pending !== null}
        onClose={() => setPending(null)}
        title="Aplicar modelo de tema?"
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setPending(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                if (pending) onApply(pending);
                setPending(null);
              }}
            >
              Aplicar
            </Button>
          </div>
        }
      >
        <p className="text-body text-[var(--text-primary)]">
          O tema personalizado será substituído pelo modelo selecionado. Esta ação não é definitiva até
          guardar.
        </p>
      </Modal>
    </div>
  );
}
