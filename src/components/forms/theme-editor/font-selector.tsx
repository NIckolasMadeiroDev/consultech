"use client";

import { useMemo, useState } from "react";
import {
  POPULAR_GOOGLE_FONTS,
  loadGoogleFontsInDocument,
  type GoogleFontEntry,
} from "@/lib/google-fonts";

type FontSelectorProps = {
  readonly headingFont: string;
  readonly bodyFont: string;
  readonly onPickHeading: (stack: string) => void;
  readonly onPickBody: (stack: string) => void;
};

function stackForEntry(entry: GoogleFontEntry): string {
  if (entry.category === "serif") return `${entry.name}, Georgia, serif`;
  if (entry.category === "monospace") return `${entry.name}, ui-monospace, monospace`;
  return `${entry.name}, system-ui, sans-serif`;
}

export function FontSelector({ headingFont, bodyFont, onPickHeading, onPickBody }: FontSelectorProps) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return POPULAR_GOOGLE_FONTS;
    return POPULAR_GOOGLE_FONTS.filter((f) => f.name.toLowerCase().includes(s));
  }, [q]);

  return (
    <div className="space-y-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
      <p className="text-small font-medium text-[var(--text-primary)]">Google Fonts</p>
      <label className="flex flex-col gap-1 text-small text-[var(--text-secondary)]">
        Pesquisar
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ex.: Inter"
          className="h-9 rounded-lg border border-neutral-300 bg-[var(--background)] px-2 text-body dark:border-neutral-600"
        />
      </label>
      <div className="max-h-40 space-y-1 overflow-y-auto">
        {filtered.map((f) => (
          <div
            key={f.name}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-neutral-50 px-2 py-1.5 dark:bg-neutral-800/80"
          >
            <span className="text-small text-[var(--text-primary)]">{f.name}</span>
            <div className="flex gap-1">
              <button
                type="button"
                className="rounded border border-neutral-300 px-2 py-0.5 text-caption text-primary-600 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-700"
                onClick={() => {
                  const stack = stackForEntry(f);
                  loadGoogleFontsInDocument([f.name]);
                  onPickHeading(stack);
                }}
              >
                Título
              </button>
              <button
                type="button"
                className="rounded border border-neutral-300 px-2 py-0.5 text-caption text-primary-600 hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-700"
                onClick={() => {
                  const stack = stackForEntry(f);
                  loadGoogleFontsInDocument([f.name]);
                  onPickBody(stack);
                }}
              >
                Corpo
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="text-caption text-[var(--text-secondary)]">
        Fontes atuais: título — {headingFont.split(",")[0]?.trim()}; corpo — {bodyFont.split(",")[0]?.trim()}
      </p>
    </div>
  );
}
