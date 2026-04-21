"use client";

import { Input } from "@/components/ui/input";

export type FileDownloadBlockEditorProps = {
  readonly fileUrl: string;
  readonly fileLabel: string;
  readonly fileMime: string;
  readonly onChange: (patch: { fileUrl: string; fileLabel: string; fileMime: string }) => void;
  readonly disabled?: boolean;
};

export function FileDownloadBlockEditor({
  fileUrl,
  fileLabel,
  fileMime,
  onChange,
  disabled,
}: FileDownloadBlockEditorProps) {
  return (
    <div className="space-y-3">
      <Input
        label="URL do ficheiro (https)"
        type="url"
        value={fileUrl}
        onChange={(e) => onChange({ fileUrl: e.target.value, fileLabel, fileMime })}
        disabled={disabled}
      />
      <Input
        label="Nome apresentado ao respondente"
        type="text"
        value={fileLabel}
        onChange={(e) => onChange({ fileUrl, fileLabel: e.target.value, fileMime })}
        disabled={disabled}
      />
      <Input
        label="Tipo MIME (ex.: application/pdf)"
        type="text"
        value={fileMime}
        onChange={(e) => onChange({ fileUrl, fileLabel, fileMime: e.target.value })}
        disabled={disabled}
        placeholder="application/pdf"
      />
    </div>
  );
}
