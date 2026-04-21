"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "consultech_theme_editor_tour_v1";

type ThemeEditorTourProps = {
  readonly onDismiss: () => void;
};

export function ThemeEditorTour({ onDismiss }: ThemeEditorTourProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && !window.localStorage.getItem(STORAGE_KEY)) {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  if (!open) return null;

  const finish = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
    }
    setOpen(false);
    onDismiss();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-tour-title"
    >
      <div className="max-w-md rounded-xl border border-neutral-200 bg-[var(--background)] p-6 shadow-lg dark:border-neutral-700">
        <h2 id="theme-tour-title" className="text-h4 text-[var(--text-primary)]">
          Editor de tema
        </h2>
        <p className="mt-3 text-body text-[var(--text-secondary)]">
          Use as abas à esquerda para cores, tipografia, layout e textos. A pré-visualização à direita atualiza com um
          pequeno atraso para manter o editor fluido. O indicador de acessibilidade resume contraste e leitura.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="primary" onClick={finish}>
            Entendi
          </Button>
        </div>
      </div>
    </div>
  );
}
