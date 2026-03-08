"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useFormResponses } from "@/hooks/useFormResponses";
import * as api from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function FormResponsesPage() {
  const params = useParams();
  const formId = params.id as string;
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";
  const { data: responses, loading, error, refetch } = useFormResponses(formId, userId);
  const toast = useToast();
  const [exporting, setExporting] = useState<string | null>(null);

  async function handleExport(format: "csv" | "json" | "xlsx") {
    setExporting(format);
    try {
      await api.downloadFormResponsesExport(formId, format, userId);
      toast("Download iniciado. Verifique sua pasta de downloads.", "success");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao exportar";
      toast(msg, "error");
    } finally {
      setExporting(null);
    }
  }

  if (loading) {
    return (
      <div>
        <div className="mb-lg h-8 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-lg text-h2 text-[var(--text-primary)]">Respostas</h1>
        <Card className="flex flex-col items-center justify-center py-12" padding="lg">
          <p className="text-body text-[var(--text-secondary)]">{error}</p>
          <Button
            className="mt-6"
            variant="primary"
            onClick={async () => {
              await refetch();
              toast("Tentando recarregar…", "info");
            }}
          >
            Tentar novamente
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/forms"
            className="inline-flex items-center gap-1 text-small text-[var(--text-secondary)] hover:underline"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Voltar
          </Link>
          <h1 className="text-h2 text-[var(--text-primary)]">Respostas do formulário</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-small text-[var(--text-secondary)]">Exportar:</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExport("csv")}
            loading={exporting === "csv"}
            disabled={!!exporting}
          >
            CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExport("xlsx")}
            loading={exporting === "xlsx"}
            disabled={!!exporting}
          >
            Excel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExport("json")}
            loading={exporting === "json"}
            disabled={!!exporting}
          >
            JSON
          </Button>
        </div>
      </div>
      <ul className="flex flex-col gap-md">
        {responses?.map((r) => (
          <li key={r.id}>
            <Card className="p-lg" padding="none">
              <div className="flex flex-wrap justify-between gap-2 text-caption text-[var(--text-secondary)]">
                <span>{r.respondent?.name ?? "—"} ({r.respondent?.email ?? "—"})</span>
                <span>{new Date(r.submittedAt).toLocaleString("pt-BR")}</span>
              </div>
              <ul className="mt-2 space-y-1">
                {r.answers.map((a) => (
                  <li key={`${r.id}-${a.questionId}`} className="text-body text-[var(--text-primary)]">
                    <span className="text-[var(--text-secondary)]">Resposta: </span>
                    {typeof a.value === "object" && Array.isArray(a.value)
                      ? (a.value as string[]).join(", ")
                      : String(a.value)}
                  </li>
                ))}
              </ul>
            </Card>
          </li>
        ))}
      </ul>
      {responses?.length === 0 && (
        <Card className="py-12 text-center" padding="lg">
          <p className="text-body text-[var(--text-secondary)]">Nenhuma resposta ainda.</p>
        </Card>
      )}
    </div>
  );
}
