"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDashboard } from "@/hooks/useDashboard";
import { useForms } from "@/hooks/useForms";
import * as api from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  FileText,
  MessageSquare,
  Trash2,
  Pencil,
  ExternalLink,
  ChevronLeft,
  Percent,
  Clock,
  ListOrdered,
} from "lucide-react";

type FormWithSummary = {
  formId: string;
  title: string;
  count: number;
  lastSubmittedAt: string | null;
};

type PeriodKey = "all" | "7" | "30";

type DashboardAnalytics = Awaited<ReturnType<typeof api.fetchDashboardAnalytics>>;

const PERIOD_OPTIONS: { value: PeriodKey; label: string }[] = [
  { value: "all", label: "Todo o período" },
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
];

function getPeriodParams(period: PeriodKey): { startDate?: string; endDate?: string } {
  if (period === "all") return {};
  const end = new Date();
  const start = new Date();
  const days = period === "7" ? 7 : 30;
  start.setDate(start.getDate() - days);
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

function DashboardDetailSkeleton() {
  return (
    <div className="space-y-lg">
      <div className="h-8 w-64 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
      <Card padding="lg">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function DashboardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";
  const { data: dashboard, loading, error, refetch } = useDashboard(id);
  const { data: forms } = useForms(userId);
  const toast = useToast();
  const [formDetails, setFormDetails] = useState<FormWithSummary[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [period, setPeriod] = useState<PeriodKey>("all");
  const [editModal, setEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editFormIds, setEditFormIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    if (!dashboard || !id) {
      setFormDetails([]);
      return;
    }
    let cancelled = false;
    setDetailsLoading(true);
    const params = getPeriodParams(period);
    api
      .fetchDashboardSummary(id, userId, params)
      .then((summary) => {
        if (!cancelled) setFormDetails(summary.forms);
      })
      .catch(() => {
        if (!cancelled) setFormDetails([]);
      })
      .finally(() => {
        if (!cancelled) setDetailsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dashboard, id, userId, period]);

  useEffect(() => {
    if (!dashboard || !id) {
      setAnalytics(null);
      return;
    }
    let cancelled = false;
    setAnalyticsLoading(true);
    const p = getPeriodParams(period);
    api
      .fetchDashboardAnalytics(id, userId, p)
      .then((data) => {
        if (!cancelled) setAnalytics(data);
      })
      .catch(() => {
        if (!cancelled) setAnalytics(null);
      })
      .finally(() => {
        if (!cancelled) setAnalyticsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dashboard, id, userId, period]);

  const totalResponses = useMemo(
    () => formDetails.reduce((acc, f) => acc + f.count, 0),
    [formDetails]
  );

  const openEditModal = useCallback(() => {
    if (dashboard) {
      setEditTitle(dashboard.title);
      setEditFormIds([...dashboard.formIds]);
      setEditModal(true);
    }
  }, [dashboard]);

  const handleSaveEdit = async () => {
    if (!dashboard) return;
    setSaving(true);
    try {
      await api.updateDashboard(
        dashboard.id,
        { title: editTitle.trim() || dashboard.title, formIds: editFormIds },
        userId
      );
      toast("Dashboard atualizado.", "success");
      refetch();
      setEditModal(false);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao salvar", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleEditFormId = (formId: string) => {
    setEditFormIds((prev) =>
      prev.includes(formId) ? prev.filter((id) => id !== formId) : [...prev, formId]
    );
  };

  const handleDelete = async () => {
    if (!dashboard) return;
    setDeleting(true);
    try {
      await api.deleteDashboard(dashboard.id, userId);
      toast("Dashboard excluído.", "success");
      router.replace("/admin/dashboards");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao excluir", "error");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-lg flex items-center gap-4">
          <div className="h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
        </div>
        <DashboardDetailSkeleton />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div>
        <h1 className="mb-lg text-h2 text-[var(--text-primary)]">Dashboard</h1>
        <Card className="flex flex-col items-center justify-center py-12" padding="lg">
          <p className="text-body text-[var(--text-secondary)]">
            {error ?? "Dashboard não encontrado."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/admin/dashboards">
              <Button variant="secondary">Voltar</Button>
            </Link>
            {error && (
              <Button variant="primary" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/dashboards"
            className="inline-flex items-center gap-1 text-small text-[var(--text-secondary)] hover:underline"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Voltar
          </Link>
          <h1 className="text-h2 text-[var(--text-primary)]">{dashboard.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" leftIcon={<Pencil className="h-4 w-4" />} onClick={openEditModal}>
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteModal(true)}
            aria-label="Excluir dashboard"
          >
            <Trash2 className="h-4 w-4 text-error" aria-hidden />
          </Button>
        </div>
      </div>

      <div className="mb-lg grid gap-md sm:grid-cols-2">
        <Card className="flex items-center gap-4 transition-shadow duration-150 ease-out hover:shadow-md" padding="md">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <FileText className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden />
          </div>
          <div>
            <p className="text-caption text-[var(--text-secondary)]">Formulários</p>
            <p className="text-h4 text-[var(--text-primary)]">{dashboard.formIds.length}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 transition-shadow duration-150 ease-out hover:shadow-md" padding="md">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
            <MessageSquare className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden />
          </div>
          <div>
            <p className="text-caption text-[var(--text-secondary)]">Respostas no total</p>
            <p className="text-h4 text-[var(--text-primary)]">
              {detailsLoading ? "—" : totalResponses}
            </p>
          </div>
        </Card>
      </div>

      <div className="mb-lg">
        <h2 className="mb-md text-h4 text-[var(--text-primary)]">Painéis prontos</h2>
        <div className="grid gap-md lg:grid-cols-3">
          <Card className="flex items-start gap-4 transition-shadow duration-150 ease-out hover:shadow-md" padding="md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Percent className="h-6 w-6 text-emerald-700 dark:text-emerald-400" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-caption text-[var(--text-secondary)]">Taxa de conclusão média</p>
              <p className="mt-1 text-h4 text-[var(--text-primary)]">
                {analyticsLoading
                  ? "—"
                  : analytics?.avgCompletionRate != null
                    ? `${(analytics.avgCompletionRate * 100).toFixed(1)}%`
                    : "—"}
              </p>
              <p className="mt-2 text-caption text-[var(--text-secondary)]">
                Média do preenchimento das perguntas visíveis por resposta (condicionais consideradas).
              </p>
            </div>
          </Card>
          <Card className="flex items-start gap-4 transition-shadow duration-150 ease-out hover:shadow-md" padding="md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-6 w-6 text-amber-800 dark:text-amber-400" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-caption text-[var(--text-secondary)]">Tempo médio por resposta</p>
              <p className="mt-1 text-h4 text-[var(--text-primary)]">—</p>
              <p className="mt-2 text-caption text-[var(--text-secondary)]">
                {analytics?.avgTimeHint ??
                  "Quando houver timestamps por etapa, o tempo médio aparecerá aqui."}
              </p>
            </div>
          </Card>
          <Card className="flex items-start gap-4 transition-shadow duration-150 ease-out hover:shadow-md" padding="md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/30">
              <ListOrdered className="h-6 w-6 text-sky-800 dark:text-sky-400" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-caption text-[var(--text-secondary)]">Abandono por pergunta</p>
              <p className="mt-1 text-h4 text-[var(--text-primary)]">
                {analyticsLoading
                  ? "—"
                  : analytics && analytics.abandonmentByQuestion.length > 0
                    ? `${analytics.abandonmentByQuestion.length} perguntas`
                    : "—"}
              </p>
              <p className="mt-2 text-caption text-[var(--text-secondary)]">
                Estimativa de não resposta entre quem viu a pergunta (útil para opcionais e funil).
              </p>
            </div>
          </Card>
        </div>
      </div>

      {analytics && analytics.abandonmentByQuestion.length > 0 && (
        <Card className="mb-lg" padding="lg">
          <h2 className="text-h4 text-[var(--text-primary)]">Abandono estimado por pergunta</h2>
          <p className="mt-1 text-caption text-[var(--text-secondary)]">
            Para cada pergunta: entre respostas em que ela era visível, percentual que não preencheu.
          </p>
          <div className="mt-lg overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-body">
              <thead>
                <tr className="border-b border-neutral-200 text-caption text-[var(--text-secondary)] dark:border-neutral-700">
                  <th className="pb-2 pr-4 font-medium">Formulário</th>
                  <th className="pb-2 pr-4 font-medium">Pergunta</th>
                  <th className="pb-2 pr-4 font-medium">Responderam</th>
                  <th className="pb-2 font-medium">Abandono est.</th>
                </tr>
              </thead>
              <tbody>
                {analytics.abandonmentByQuestion.map((row) => (
                  <tr
                    key={`${row.formId}-${row.questionId}`}
                    className="border-b border-neutral-100 dark:border-neutral-800"
                  >
                    <td className="py-2 pr-4 text-[var(--text-primary)]">{row.formTitle}</td>
                    <td className="max-w-xs py-2 pr-4 text-[var(--text-primary)]">
                      <span className="line-clamp-2">{row.questionText}</span>
                    </td>
                    <td className="py-2 pr-4 text-[var(--text-secondary)]">
                      {row.responseRatePercent}% ({row.answeredCount}/{row.eligibleResponses})
                    </td>
                    <td className="py-2 text-[var(--text-primary)]">
                      {row.abandonmentEstimatePercent}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card padding="lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-h4 text-[var(--text-primary)]">Formulários vinculados</h2>
          <label className="flex items-center gap-2 text-small text-[var(--text-secondary)]">
            <span>Período:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodKey)}
              className="rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-1.5 text-body text-[var(--text-primary)] dark:border-neutral-600"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {(() => {
          if (detailsLoading && formDetails.length === 0) {
            return (
              <ul className="pt-lg space-y-2">
                {dashboard.formIds.map((formId) => (
                  <li key={formId} className="h-14 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
                ))}
              </ul>
            );
          }
          if (formDetails.length > 0) {
            return (
              <ul className="pt-lg space-y-3">
                {formDetails.map((f) => (
                  <li key={f.formId}>
                    <Card className="flex flex-wrap items-center justify-between gap-3" padding="md">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/admin/forms/${f.formId}/responses`}
                          className="font-medium text-primary-600 hover:underline dark:text-primary-400"
                        >
                          {f.title}
                        </Link>
                        <p className="mt-1 text-caption text-[var(--text-secondary)]">
                          {f.count} resposta(s)
                          {f.lastSubmittedAt
                            ? ` · Última em ${new Date(f.lastSubmittedAt).toLocaleDateString("pt-BR")}`
                            : ""}
                        </p>
                      </div>
                      <Link href={`/admin/forms/${f.formId}/responses`}>
                        <Button variant="ghost" size="sm" leftIcon={<ExternalLink className="h-4 w-4" />}>
                          Ver respostas
                        </Button>
                      </Link>
                    </Card>
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p className="pt-lg text-body text-[var(--text-secondary)]">
              Nenhum formulário vinculado. Use Editar para adicionar.
            </p>
          );
        })()}
      </Card>

      {editModal && (
        <Modal
          open
          onClose={() => setEditModal(false)}
          title="Editar dashboard"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setEditModal(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSaveEdit} loading={saving} disabled={saving}>
                Salvar
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Título"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Nome do dashboard"
            />
            <div>
              <span className="mb-2 block text-small font-medium text-[var(--text-secondary)]">
                Formulários
              </span>
              {forms && forms.length > 0 ? (
                <ul className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-neutral-200 bg-[var(--background)] p-lg dark:border-neutral-700">
                  {forms.map((f) => (
                    <li key={f.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`edit-form-${f.id}`}
                        checked={editFormIds.includes(f.id)}
                        onChange={() => toggleEditFormId(f.id)}
                        className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-neutral-600"
                      />
                      <label
                        htmlFor={`edit-form-${f.id}`}
                        className="cursor-pointer text-body text-[var(--text-primary)]"
                      >
                        {f.title}
                      </label>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-caption text-[var(--text-secondary)]">Nenhum formulário disponível.</p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {deleteModal && (
        <Modal
          open
          onClose={() => setDeleteModal(false)}
          title="Excluir dashboard"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setDeleteModal(false)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                loading={deleting}
                disabled={deleting}
              >
                Excluir
              </Button>
            </>
          }
        >
          <p className="text-body text-[var(--text-primary)]">
            Excluir o dashboard &quot;{dashboard.title}&quot;? Esta ação não pode ser desfeita.
          </p>
        </Modal>
      )}
    </div>
  );
}
