"use client";

import { useState } from "react";

type ImagesSectionProps = {
  readonly headerImage: string | null;
  readonly logoImage: string | null;
  readonly backgroundImage: string | null;
  readonly onUploadHeader: (file: File) => Promise<void>;
  readonly onUploadLogo: (file: File) => Promise<void>;
  readonly onUploadBackground: (file: File) => Promise<void>;
  readonly onClearHeader: () => void;
  readonly onClearLogo: () => void;
  readonly onClearBackground: () => void;
};

export function ImagesSection({
  headerImage,
  logoImage,
  backgroundImage,
  onUploadHeader,
  onUploadLogo,
  onUploadBackground,
  onClearHeader,
  onClearLogo,
  onClearBackground,
}: ImagesSectionProps) {
  const [busy, setBusy] = useState<string | null>(null);

  async function run(key: string, fn: (f: File) => Promise<void>, file: File | null) {
    if (!file) return;
    setBusy(key);
    try {
      await fn(file);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-small font-medium text-[var(--text-primary)]">Cabeçalho</p>
        {headerImage ? (
          <img src={headerImage} alt="" className="mb-2 max-h-40 w-full rounded-lg object-cover" />
        ) : null}
        <div className="flex flex-wrap gap-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="text-small"
            disabled={busy !== null}
            onChange={(e) => run("header", onUploadHeader, e.target.files?.[0] ?? null)}
          />
          {headerImage ? (
            <button
              type="button"
              className="text-small text-error underline"
              onClick={onClearHeader}
            >
              Remover
            </button>
          ) : null}
        </div>
      </div>
      <div>
        <p className="mb-2 text-small font-medium text-[var(--text-primary)]">Logo</p>
        {logoImage ? (
          <img src={logoImage} alt="" className="mb-2 h-16 w-auto object-contain" />
        ) : null}
        <div className="flex flex-wrap gap-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="text-small"
            disabled={busy !== null}
            onChange={(e) => run("logo", onUploadLogo, e.target.files?.[0] ?? null)}
          />
          {logoImage ? (
            <button
              type="button"
              className="text-small text-error underline"
              onClick={onClearLogo}
            >
              Remover
            </button>
          ) : null}
        </div>
      </div>
      <div>
        <p className="mb-2 text-small font-medium text-[var(--text-primary)]">Imagem de fundo</p>
        {backgroundImage ? (
          <div
            className="mb-2 h-24 w-full rounded-lg bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        ) : null}
        <div className="flex flex-wrap gap-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="text-small"
            disabled={busy !== null}
            onChange={(e) => run("bg", onUploadBackground, e.target.files?.[0] ?? null)}
          />
          {backgroundImage ? (
            <button
              type="button"
              className="text-small text-error underline"
              onClick={onClearBackground}
            >
              Remover
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
