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
import { Input } from "@/components/ui/input";
import { ChevronLeft, Lightbulb, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/modal";

export default function FormResponsesPage() {
  const params = useParams();
  const formId = params.id as string;
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [filterRespondent, setFilterRespondent] = useState("");
  const [filterAnswer, setFilterAnswer] = useState("");
  const { data: responses, loading, error, refetch } = useFormResponses(formId, userId, {
    startDate: filterStart || undefined,
    endDate: filterEnd || undefined,
    respondentSearch: filterRespondent.trim() || undefined,
    answerSearch: filterAnswer.trim() || undefined,
  });
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
          startDate: filterStart || undefined,
          endDate: filterEnd || undefined,
          respondentSearch: filterRespondent.trim() || undefined,
          answerSearch: filterAnswer.trim() || undefined,
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
            <span className="text-small text-[var(--text-secondary)]">IA (dados agregados):</span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void runInsights("summary")}
              loading={insightsLoading}
              disabled={insightsLoading || !responses?.length}
              leftIcon={<Sparkles className="h-4 w-4" />}
            >
              Resumir
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void runInsights("insights")}
              loading={insightsLoading}
              disabled={insightsLoading || !responses?.length}
              leftIcon={<Lightbulb className="h-4 w-4" />}
            >
              Principais insights
            </Button>
          </div>
        </div>
      </div>
      <Card className="mb-lg" padding="lg">
        <p className="mb-3 text-small font-medium text-[var(--text-primary)]">Filtros e busca</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="resp-filter-start" className="mb-1 block text-caption text-[var(--text-secondary)]">
              Data inicial
            </label>
            <input
              id="resp-filter-start"
              type="date"
              value={filterStart}
              onChange={(e) => setFilterStart(e.target.value)}
              className="h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body text-[var(--text-primary)] dark:border-neutral-600"
            />
          </div>
          <div>
            <label htmlFor="resp-filter-end" className="mb-1 block text-caption text-[var(--text-secondary)]">
              Data final
            </label>
            <input
              id="resp-filter-end"
              type="date"
              value={filterEnd}
              onChange={(e) => setFilterEnd(e.target.value)}
              className="h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-body text-[var(--text-primary)] dark:border-neutral-600"
            />
          </div>
          <Input
            id="resp-filter-respondent"
            label="Respondente"
            value={filterRespondent}
            onChange={(e) => setFilterRespondent(e.target.value)}
            placeholder="Nome, e-mail, matrícula ou setor"
            className="text-[var(--text-primary)]"
          />
          <Input
            id="resp-filter-answer"
            label="Texto nas respostas"
            value={filterAnswer}
            onChange={(e) => setFilterAnswer(e.target.value)}
            placeholder="Busca no conteúdo das respostas"
            className="text-[var(--text-primary)]"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setFilterStart("");
              setFilterEnd("");
              setFilterRespondent("");
              setFilterAnswer("");
            }}
          >
            Limpar filtros
          </Button>
        </div>
      </Card>
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
