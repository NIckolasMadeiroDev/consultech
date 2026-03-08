"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useFormResponses } from "@/hooks/useFormResponses";
import * as api from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

export default function FormResponsesPage() {
  const params = useParams();
  const formId = params.id as string;
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";
  const { data: responses, loading, error } = useFormResponses(formId, userId);
  const [exporting, setExporting] = useState<string | null>(null);

  async function handleExport(format: "csv" | "json" | "xlsx") {
    setExporting(format);
    try {
      await api.downloadFormResponsesExport(formId, format, userId);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao exportar");
    } finally {
      setExporting(null);
    }
  }

  if (loading) return <p className="text-slate-600">Carregando...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/forms" className="text-slate-600 hover:underline">
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold">Respostas do formulário</h1>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-slate-500">Exportar:</span>
          <button
            type="button"
            onClick={() => handleExport("csv")}
            disabled={!!exporting}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            {exporting === "csv" ? "…" : "CSV"}
          </button>
          <button
            type="button"
            onClick={() => handleExport("xlsx")}
            disabled={!!exporting}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            {exporting === "xlsx" ? "…" : "Excel"}
          </button>
          <button
            type="button"
            onClick={() => handleExport("json")}
            disabled={!!exporting}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50"
          >
            {exporting === "json" ? "…" : "JSON"}
          </button>
        </div>
      </div>
      <ul className="space-y-4">
        {responses?.map((r) => (
          <li key={r.id} className="rounded border bg-white p-4">
            <div className="flex justify-between text-sm text-slate-500">
              <span>{r.respondent?.name ?? "—"} ({r.respondent?.email ?? "—"})</span>
              <span>{new Date(r.submittedAt).toLocaleString("pt-BR")}</span>
            </div>
            <ul className="mt-2 space-y-1">
              {r.answers.map((a) => (
                <li key={`${r.id}-${a.questionId}`} className="text-sm">
                  <span className="text-slate-600">Resposta: </span>
                  {typeof a.value === "object" && Array.isArray(a.value)
                    ? (a.value as string[]).join(", ")
                    : String(a.value)}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {responses?.length === 0 && (
        <p className="text-slate-500">Nenhuma resposta ainda.</p>
      )}
    </div>
  );
}
