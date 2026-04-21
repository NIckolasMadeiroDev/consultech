"use client";

import { useEffect, useState } from "react";
import * as api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function answerToCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(String).join("; ");
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}

type Column = { questionId: string; label: string };

export function DashboardFormResponsesPreview({
  formId,
  formTitle,
  userId,
  startDate,
  endDate,
  columns,
  exportLimit,
}: Readonly<{
  formId: string;
  formTitle: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  columns: Column[];
  exportLimit: number;
}>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<
    Array<{
      id: string;
      submittedAt: string;
      respondent: { name: string; email: string; department?: string | null } | null;
      answers: Array<{ questionId: string; value: unknown }>;
    }>
  >([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .fetchFormResponsesPage(formId, userId, {
        startDate,
        endDate,
        page: 1,
        limit: 25,
      })
      .then((res) => {
        if (!cancelled) {
          setRows(res.data);
          setTotal(res.total);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro ao carregar");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, formId, userId, startDate, endDate]);

  const handleExport = async (format: "csv" | "xlsx") => {
    await api.downloadFormResponsesExport(formId, format, userId, {
      startDate,
      endDate,
      limit: exportLimit,
    });
  };

  return (
    <Card padding="md" className="border border-neutral-200 dark:border-neutral-700">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-small font-medium text-[var(--text-primary)]">Tabela e exportação — {formTitle}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => setOpen((o) => !o)}>
            {open ? "Ocultar pré-visualização" : "Modo tabela"}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => void handleExport("csv")}>
            CSV
          </Button>
          <Button size="sm" onClick={() => void handleExport("xlsx")}>
            Excel
          </Button>
        </div>
      </div>
      <p className="mt-2 text-caption text-[var(--text-secondary)]">
        Exportação com o mesmo período do dashboard; limite padrão {exportLimit.toLocaleString("pt-BR")} linhas
        (ajustável na API). Arquivos abrem no Excel ou LibreOffice.
      </p>
      {open && (
        <div className="mt-md">
          {loading && <p className="text-caption text-[var(--text-secondary)]">A carregar…</p>}
          {error && <p className="text-caption text-error">{error}</p>}
          {!loading && !error && (
            <>
              <p className="mb-2 text-caption text-[var(--text-secondary)]">
                Pré-visualização: {rows.length} de {total} resposta(s) no período (primeira página).
              </p>
              <div className="max-h-72 overflow-auto rounded-lg border border-neutral-200 dark:border-neutral-700">
                <table className="w-full min-w-[640px] border-collapse text-left text-small">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/50">
                      <th className="p-2 font-medium text-[var(--text-secondary)]">Data</th>
                      <th className="p-2 font-medium text-[var(--text-secondary)]">Respondente</th>
                      {columns.map((c) => (
                        <th key={c.questionId} className="max-w-[180px] p-2 font-medium text-[var(--text-secondary)]">
                          <span className="line-clamp-3">{c.label}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const map = new Map(r.answers.map((a) => [a.questionId, a.value]));
                      return (
                        <tr
                          key={r.id}
                          className="border-b border-neutral-100 dark:border-neutral-800"
                        >
                          <td className="whitespace-nowrap p-2 text-[var(--text-primary)]">
                            {new Date(r.submittedAt).toLocaleString("pt-BR")}
                          </td>
                          <td className="p-2 text-[var(--text-primary)]">
                            {r.respondent?.name ?? "—"}
                            {r.respondent?.department ? (
                              <span className="block text-caption text-[var(--text-secondary)]">
                                {r.respondent.department}
                              </span>
                            ) : null}
                          </td>
                          {columns.map((c) => (
                            <td key={c.questionId} className="max-w-[180px] p-2 text-[var(--text-primary)]">
                              <span className="line-clamp-3">{answerToCell(map.get(c.questionId))}</span>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  );
}
