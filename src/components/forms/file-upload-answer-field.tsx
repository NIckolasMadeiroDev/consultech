"use client";

import { useId, useRef, useState } from "react";
import type { ResponseAttachmentInput } from "@/modules/responses/response-attachment.types";
import type { FileUploadRules } from "@/types/file-upload-rules";
import { mapResponseFileUploadToAttachment } from "@/lib/map-response-file-upload";
import { uploadResponseFileWithProgress } from "@/lib/upload-response-file-client";
import { getClientMaxUploadBytes } from "@/lib/upload-env";

export type FileUploadAnswerFieldProps = {
  readonly formId: string;
  readonly questionId: string;
  readonly rules: FileUploadRules;
  readonly attachments: ResponseAttachmentInput[];
  readonly onAttachmentsChange: (items: ResponseAttachmentInput[]) => void;
  readonly required: boolean;
  readonly disabled: boolean;
  readonly legendId: string;
};

export function FileUploadAnswerField({
  formId,
  questionId,
  rules,
  attachments,
  onAttachmentsChange,
  required,
  disabled,
  legendId,
}: FileUploadAnswerFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const accept = rules.allowedExtensions.map((e) => `.${e.replace(/^\./, "")}`).join(",");
  const cap = Math.min(rules.maxFileBytes, getClientMaxUploadBytes());
  const maxFiles = Math.max(1, Math.min(rules.maxFiles, 50));

  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    setErr(null);
    const room = maxFiles - attachments.length;
    if (room <= 0) {
      setErr(`Limite de ${maxFiles} ficheiro(s) atingido.`);
      return;
    }
    const toSend = list.slice(0, room);
    setBusy(true);
    try {
      const next = [...attachments];
      for (const f of toSend) {
        if (f.size > cap) {
          setErr(`Ficheiro demasiado grande (máx. ${Math.round(cap / (1024 * 1024))} MB).`);
          return;
        }
        setProgress(0);
        try {
          const raw = await uploadResponseFileWithProgress(formId, questionId, f, setProgress);
          next.push(mapResponseFileUploadToAttachment(questionId, raw));
          onAttachmentsChange([...next]);
        } catch (ex) {
          setErr(ex instanceof Error ? ex.message : "Erro ao enviar");
          return;
        }
      }
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Erro ao enviar");
    } finally {
      setProgress(0);
      setBusy(false);
    }
  };

  const removeAt = (index: number) => {
    onAttachmentsChange(attachments.filter((_, i) => i !== index));
  };

  const onKeyDropzone = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div className="mt-2 space-y-3">
      <div
        role="button"
        tabIndex={disabled || busy ? -1 : 0}
        aria-labelledby={`${legendId} ${inputId}-hint`}
        className={`rounded-lg border border-dashed border-neutral-300 bg-[var(--background)] px-4 py-6 text-center text-body outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary-600 dark:border-neutral-600 ${
          disabled || busy ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-primary-400"
        }`}
        onKeyDown={onKeyDropzone}
        onClick={() => {
          if (!disabled && !busy) inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (disabled || busy) return;
          void addFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept || undefined}
          multiple={maxFiles > 1}
          disabled={disabled || busy}
          className="sr-only"
          aria-hidden
          tabIndex={-1}
          onChange={(e) => {
            const fs = e.target.files;
            if (fs?.length) void addFiles(fs);
            e.target.value = "";
          }}
        />
        <p id={`${inputId}-hint`} className="text-[var(--text-primary)]">
          {busy ? "A enviar ficheiro…" : "Arraste ficheiros para aqui ou clique para escolher."}
        </p>
        <p className="mt-1 text-small text-[var(--text-secondary)]">
          Tipos permitidos: {rules.allowedExtensions.join(", ") || "—"} · máx.{" "}
          {Math.round(cap / (1024 * 1024))} MB por ficheiro
          {maxFiles > 1 ? ` · até ${maxFiles} ficheiros` : ""}
        </p>
      </div>
      {busy ? (
        <div
          className="h-2 w-full overflow-hidden rounded bg-neutral-200 dark:bg-neutral-700"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <div
            className="h-full bg-primary-600 transition-[width] duration-150"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      ) : null}
      {err ? (
        <p className="text-small text-error" role="alert">
          {err}
        </p>
      ) : null}
      {attachments.length > 0 ? (
        <ul className="space-y-2" aria-live="polite">
          {attachments.map((a, i) => (
            <li
              key={`${a.storagePath}-${i}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-neutral-200 px-3 py-2 text-small dark:border-neutral-600"
            >
              <span className="min-w-0 truncate font-medium text-[var(--text-primary)]">
                {a.originalFilename}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={a.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 underline"
                >
                  Abrir
                </a>
                <button
                  type="button"
                  className="rounded text-error underline"
                  disabled={disabled || busy}
                  onClick={() => removeAt(i)}
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {required && attachments.length === 0 ? (
        <p className="text-small text-[var(--text-secondary)]" id={`${inputId}-req`}>
          Obrigatório: envie {maxFiles > 1 ? "pelo menos um ficheiro" : "um ficheiro"}.
        </p>
      ) : null}
    </div>
  );
}
