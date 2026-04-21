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
import { Trash2, Pencil, ChevronLeft } from "lucide-react";
import { DashboardResponseContentSection } from "@/components/dashboards/dashboard-response-content-section";
import { DashboardFlowMetricsSection } from "@/components/dashboards/dashboard-flow-metrics-section";

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

function getPeriodLabel(period: PeriodKey): string {
  return PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? "";
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
    api
      .fetchDashboardSummary(id, userId, getPeriodParams(period))
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
    api
      .fetchDashboardAnalytics(id, userId, getPeriodParams(period))
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

  const periodParams = useMemo(() => getPeriodParams(period), [period]);
  const periodLabel = useMemo(() => getPeriodLabel(period), [period]);

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

      <div className="mb-lg">
        <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <span className="text-small font-medium text-[var(--text-primary)]">Período de análise</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodKey)}
            className="w-full max-w-xs rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] dark:border-neutral-600 sm:w-auto"
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-2 text-caption text-[var(--text-secondary)]">
          Gráficos, agregações e exportações usam {periodLabel.toLowerCase()}.
        </p>
      </div>

      <DashboardResponseContentSection
        forms={analytics?.responseContentByForm ?? []}
        userId={userId}
        startDate={periodParams.startDate}
        endDate={periodParams.endDate}
        loading={analyticsLoading}
      />

      <DashboardFlowMetricsSection
        defaultCollapsed={analytics?.hideAbandonmentByDefault ?? false}
        analytics={analytics}
        analyticsLoading={analyticsLoading}
        dashboardTitle={dashboard.title}
        dashboardFormIds={dashboard.formIds}
        formDetails={formDetails}
        detailsLoading={detailsLoading}
        totalResponses={totalResponses}
        periodLabel={periodLabel}
      />

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
