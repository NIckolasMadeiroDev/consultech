"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";

type SuccessPageProps = {
  readonly themed: boolean;
  readonly title: string;
  readonly plainBody: string;
  readonly htmlBody: string | null | undefined;
  readonly redirectUrl: string | null | undefined;
  readonly redirectDelaySec: number;
  readonly preview: boolean;
  readonly onPreviewDone?: () => void;
};

function isSafeRedirectUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export function SuccessPage({
  themed,
  title,
  plainBody,
  htmlBody,
  redirectUrl,
  redirectDelaySec,
  preview,
  onPreviewDone,
}: SuccessPageProps) {
  const html = htmlBody?.trim() ? sanitizeRichHtml(htmlBody) : "";
  const rawUrl = redirectUrl?.trim() ?? "";
  const canRedirect = rawUrl.length > 0 && isSafeRedirectUrl(rawUrl);
  const delay = Math.max(0, Math.min(600, redirectDelaySec || 0));
  const [secondsLeft, setSecondsLeft] = useState(() => delay);

  useEffect(() => {
    setSecondsLeft(delay);
  }, [delay]);

  useEffect(() => {
    if (preview || !canRedirect) return;
    if (delay <= 0) {
      window.location.assign(rawUrl);
      return;
    }
    let remaining = delay;
    const id = window.setInterval(() => {
      remaining -= 1;
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(id);
        window.location.assign(rawUrl);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [preview, canRedirect, delay, rawUrl]);

  return (
    <div className="mx-auto max-w-lg">
      <Card
        padding="lg"
        className={
          themed
            ? "form-theme-card form-theme-surface border text-center"
            : "border-green-200 bg-green-50 text-center dark:border-green-800 dark:bg-green-950/40"
        }
      >
        <div className="flex justify-center">
          <span
            className={
              themed
                ? "flex h-14 w-14 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--form-success)_15%,transparent)]"
                : "flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50"
            }
          >
            <CheckCircle
              className={
                themed
                  ? "h-8 w-8 text-[color:var(--form-success)]"
                  : "h-8 w-8 text-green-600 dark:text-green-400"
              }
              aria-hidden
            />
          </span>
        </div>
        <p
          className={
            themed
              ? "mt-4 text-body-lg font-medium text-[color:var(--form-text-primary)]"
              : "mt-4 text-body-lg font-medium text-[var(--text-primary)]"
          }
        >
          {title}
        </p>
        {html ? (
          <div
            className={
              themed
                ? "prose prose-sm mt-3 max-w-none text-left text-[color:var(--form-text-primary)]"
                : "prose prose-sm mt-3 max-w-none text-left text-[var(--text-primary)]"
            }
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <p
            className={
              themed
                ? "mt-2 whitespace-pre-wrap text-body text-[color:var(--form-text-primary)]"
                : "mt-2 whitespace-pre-wrap text-body text-[var(--text-primary)]"
            }
          >
            {plainBody}
          </p>
        )}
        {canRedirect && !preview && delay > 0 ? (
          <p className="mt-3 text-small text-[var(--text-secondary)]">
            Redirecionamento em {secondsLeft}s…
          </p>
        ) : null}
        {preview && (
          <p className="mt-3 rounded-lg border border-primary-200 bg-primary-50/80 px-3 py-2 text-small text-[var(--text-primary)] dark:border-primary-800 dark:bg-primary-950/40">
            Pré-visualização: nenhum dado foi enviado ao servidor.
          </p>
        )}
        <p className="mt-3 text-small text-[var(--text-secondary)]">
          {preview
            ? "Feche a janela de pré-visualização para voltar à edição."
            : "Pode fechar esta página ou voltar ao início."}
        </p>
        {preview && onPreviewDone && (
          <div className="mt-6">
            <Button type="button" variant="primary" onClick={onPreviewDone}>
              Fechar pré-visualização
            </Button>
          </div>
        )}
        {!preview && (
          <Link href="/" className="mt-6 inline-block">
            <Button variant="primary">Voltar ao início</Button>
          </Link>
        )}
      </Card>
    </div>
  );
}
