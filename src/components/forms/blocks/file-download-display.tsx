"use client";

import { Download } from "lucide-react";

export type FileDownloadDisplayProps = {
  readonly url: string;
  readonly label: string;
  readonly mime?: string | null;
};

function isPdfMime(m: string | null | undefined): boolean {
  return (m ?? "").toLowerCase().includes("pdf");
}

export function FileDownloadDisplay({ url, label, mime }: FileDownloadDisplayProps) {
  const href = url.trim();
  if (!href) return null;
  const pdf = isPdfMime(mime);
  return (
    <div className="space-y-3 rounded-lg border border-neutral-200 bg-[var(--surface)] p-4 dark:border-neutral-700">
      <div className="flex flex-wrap items-center gap-3">
        <Download className="h-6 w-6 shrink-0 text-primary-600" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-[var(--text-primary)]">{label.trim() || "Ficheiro"}</p>
          {mime?.trim() ? (
            <p className="text-small text-[var(--text-secondary)]">{mime.trim()}</p>
          ) : null}
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg bg-primary-600 px-4 py-2 text-small font-medium text-white hover:bg-primary-700"
        >
          Abrir / transferir
        </a>
      </div>
      {pdf ? (
        <div className="overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-600">
          <iframe
            title={label.trim() || "Pré-visualização PDF"}
            src={href}
            className="h-[min(70vh,480px)] w-full bg-white"
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      ) : null}
    </div>
  );
}
