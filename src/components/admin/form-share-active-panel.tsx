"use client";

import { useEffect, useState } from "react";
import { Copy, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/contexts/toast-context";

type FormShareActivePanelProps = {
  readonly respondUrl: string;
  readonly shortUrl: string | null;
};

export function FormShareActivePanel({ respondUrl, shortUrl }: FormShareActivePanelProps) {
  const toast = useToast();
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void import("qrcode")
      .then((QR) =>
        QR.default.toDataURL(respondUrl, {
          width: 200,
          margin: 2,
          color: { dark: "#111827", light: "#ffffff" },
        })
      )
      .then((url) => {
        if (!cancelled) setQrSrc(url);
      })
      .catch(() => {
        if (!cancelled) setQrSrc(null);
      });
    return () => {
      cancelled = true;
    };
  }, [respondUrl]);

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`${label} copiado.`, "success");
    } catch {
      toast("Não foi possível copiar.", "error");
    }
  };

  return (
    <Card className="max-w-2xl border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/25" padding="lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-900 dark:text-green-100">
          <Link2 className="h-5 w-5 shrink-0" aria-hidden />
          Compartilhar (formulário ativo)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="shrink-0 rounded-lg border border-neutral-200 bg-white p-2 dark:border-neutral-600 dark:bg-neutral-900">
            {qrSrc ? (
              <img
                src={qrSrc}
                width={200}
                height={200}
                className="h-[200px] w-[200px]"
                alt="QR code com o link para responder o formulário"
              />
            ) : (
              <div className="flex h-[200px] w-[200px] items-center justify-center text-caption text-[var(--text-secondary)]">
                Gerando QR…
              </div>
            )}
            <p className="mt-2 text-center text-caption text-[var(--text-secondary)]">
              QR aponta para o link completo de resposta
            </p>
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="mb-1 text-small font-medium text-[var(--text-primary)]">Link completo</p>
              <div className="flex flex-wrap items-center gap-2">
                <code className="max-w-full truncate rounded bg-white/80 px-2 py-1 text-caption dark:bg-neutral-900/80">
                  {respondUrl}
                </code>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => void copy(respondUrl, "Link completo")}
                  leftIcon={<Copy className="h-4 w-4" />}
                >
                  Copiar
                </Button>
              </div>
            </div>
            {shortUrl ? (
              <div>
                <p className="mb-1 text-small font-medium text-[var(--text-primary)]">Link curto</p>
                <div className="flex flex-wrap items-center gap-2">
                  <code className="max-w-full truncate rounded bg-white/80 px-2 py-1 text-caption dark:bg-neutral-900/80">
                    {shortUrl}
                  </code>
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={() => void copy(shortUrl, "Link curto")}
                    leftIcon={<Copy className="h-4 w-4" />}
                  >
                    Copiar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-small text-[var(--text-secondary)]">
                Defina um <strong>link curto</strong> nas informações do formulário para copiar a URL amigável
                (/r/…).
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
