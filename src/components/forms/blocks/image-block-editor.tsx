"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
export type ImageBlockEditorProps = {
  readonly imageUrl: string;
  readonly imageAlt: string;
  readonly onChange: (patch: { imageUrl: string; imageAlt: string }) => void;
  readonly disabled?: boolean;
  readonly onRequestUpload?: (file: File) => Promise<string>;
};

export function ImageBlockEditor({
  imageUrl,
  imageAlt,
  onChange,
  disabled,
  onRequestUpload,
}: ImageBlockEditorProps) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <Input
        label="URL da imagem"
        type="url"
        value={imageUrl}
        onChange={(e) => onChange({ imageUrl: e.target.value, imageAlt })}
        disabled={disabled}
        placeholder="https://..."
      />
      {onRequestUpload && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="text-small text-[var(--text-secondary)]"
            disabled={disabled || busy}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f || !onRequestUpload) return;
              setErr(null);
              setBusy(true);
              try {
                const url = await onRequestUpload(f);
                onChange({ imageUrl: url, imageAlt: imageAlt || f.name });
              } catch (ex) {
                setErr(ex instanceof Error ? ex.message : "Falha no envio");
              } finally {
                setBusy(false);
                e.target.value = "";
              }
            }}
          />
          {busy ? <span className="text-small text-[var(--text-secondary)]">A enviar…</span> : null}
        </div>
      )}
      {err ? <p className="text-small text-error">{err}</p> : null}
      <Input
        label="Texto alternativo (acessibilidade)"
        type="text"
        value={imageAlt}
        onChange={(e) => onChange({ imageUrl, imageAlt: e.target.value })}
        disabled={disabled}
      />
      {imageUrl.trim() ? (
        <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
          <img
            src={imageUrl}
            alt={imageAlt || ""}
            className="max-h-48 w-full object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}
