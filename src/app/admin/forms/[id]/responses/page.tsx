"use client";

import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import * as api from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Lightbulb, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { FormResponsesAdmin } from "@/components/forms/admin/form-responses-admin";

export default function FormResponsesPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const formId = params.id as string;
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";
  const toast = useToast();
  const [exporting, setExporting] = useState<string | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [insightsContent, setInsightsContent] = useState("");
  const [insightsTitle, setInsightsTitle] = useState("");
  const [insightsMeta, setInsightsMeta] = useState<api.FormResponsesInsightsMeta | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  async function runInsights(mode: "summary" | "insights") {
    if (insightsLoading) return;
    setInsightsLoading(true);
    try {
      const r = await api.requestFormResponsesInsights(
        formId,
        {
          mode,
          startDate: searchParams.get("startDate") || undefined,
          endDate: searchParams.get("endDate") || undefined,
          respondentSearch: searchParams.get("respondentSearch") || undefined,
          answerSearch: searchParams.get("answerSearch") || undefined,
          department: searchParams.get("department") || undefined,
        },
        userId
      );
      setInsightsContent(r.content);
      setInsightsMeta(r.meta);
      setInsightsTitle(mode === "summary" ? "Resumo inteligente" : "Principais insights");
      setInsightsOpen(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao gerar análise";
      toast(msg, "error");
    } finally {
      setInsightsLoading(false);
    }
  }

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

  return (
    <div>
      <Modal
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        title={insightsTitle}
        footer={
          <Button type="button" variant="secondary" onClick={() => setInsightsOpen(false)}>
            Fechar
          </Button>
        }
        panelClassName="max-w-2xl"
      >
        {insightsMeta ? (
          <p className="mb-3 text-caption text-[var(--text-secondary)]">
            {insightsMeta.totalMatchingResponses} resposta(s) no filtro atual
            {insightsMeta.sampleIsPartial
              ? ` · análise nas ${insightsMeta.sampleSize} mais recentes da amostra`
              : insightsMeta.sampleSize !== insightsMeta.totalMatchingResponses
                ? ` · ${insightsMeta.sampleSize} na amostra`
                : ""}
            . Nenhum dado pessoal identificável é enviado ao modelo; textos abertos entram truncados e com máscaras.
          </p>
        ) : null}
        <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap text-body text-[var(--text-primary)]">
          {insightsContent}
        </div>
      </Modal>
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
        <div className="flex flex-col items-stretch gap-3 sm:items-end">
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
          <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-700 sm:border-0 sm:pt-0">
            <span className="text-small text-[var(--text-secondary)]">IA (usa filtros na URL):</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void runInsights("summary")}
              loading={insightsLoading}
              disabled={insightsLoading}
              leftIcon={<Sparkles className="h-4 w-4" />}
            >
              Resumir
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void runInsights("insights")}
              loading={insightsLoading}
              disabled={insightsLoading}
              leftIcon={<Lightbulb className="h-4 w-4" />}
            >
              Principais insights
            </Button>
          </div>
        </div>
      </div>
      <FormResponsesAdmin formId={formId} userId={userId} />
    </div>
  );
}
