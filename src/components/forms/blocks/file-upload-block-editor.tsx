"use client";

import { Input } from "@/components/ui/input";
import type { FileUploadRules } from "@/types/file-upload-rules";

export type FileUploadBlockEditorProps = {
  readonly rules: FileUploadRules;
  readonly onChange: (rules: FileUploadRules) => void;
  readonly disabled?: boolean;
};

export function FileUploadBlockEditor({ rules, onChange, disabled }: FileUploadBlockEditorProps) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-small text-[var(--text-primary)]">
        <input
          type="checkbox"
          checked={rules.required}
          onChange={(e) => onChange({ ...rules, required: e.target.checked })}
          disabled={disabled}
        />
        Envio obrigatório
      </label>
      <Input
        label="Tamanho máximo (MB)"
        type="number"
        min={1}
        max={50}
        value={Math.round(rules.maxFileBytes / (1024 * 1024))}
        onChange={(e) => {
          const mb = Number(e.target.value);
          const n = Number.isFinite(mb) ? Math.min(50, Math.max(1, mb)) : 5;
          onChange({ ...rules, maxFileBytes: n * 1024 * 1024 });
        }}
        disabled={disabled}
      />
      <Input
        label="Número máximo de ficheiros"
        type="number"
        min={1}
        max={10}
        value={rules.maxFiles}
        onChange={(e) => {
          const n = Number(e.target.value);
          const v = Number.isFinite(n) ? Math.min(10, Math.max(1, Math.floor(n))) : 1;
          onChange({ ...rules, maxFiles: v });
        }}
        disabled={disabled}
      />
      <Input
        label="Extensões permitidas (separadas por vírgula, sem ponto)"
        type="text"
        value={rules.allowedExtensions.join(", ")}
        onChange={(e) => {
          const parts = e.target.value
            .split(/[,;\s]+/)
            .map((x) => x.replace(/^\./, "").toLowerCase())
            .filter(Boolean);
          onChange({ ...rules, allowedExtensions: parts.length ? parts : ["pdf"] });
        }}
        disabled={disabled}
        placeholder="pdf, png, jpg"
      />
    </div>
  );
}
