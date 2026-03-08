"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDashboards } from "@/hooks/useDashboards";
import { useForms } from "@/hooks/useForms";
import * as api from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { LayoutDashboard, Trash2, ExternalLink, Plus } from "lucide-react";

type DashboardListItem = {
  id: string;
  title: string;
  createdAt: string;
  formIds: string[];
};

function DashboardsListSkeleton() {
  return (
    <ul className="flex flex-col gap-md">
      {[1, 2, 3].map((i) => (
        <li key={i}>
          <Card className="flex items-center justify-between gap-4" padding="md">
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-4 w-20 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
            </div>
            <div className="h-9 w-24 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800" />
          </Card>
        </li>
      ))}
    </ul>
  );
}

export default function AdminDashboardsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";
  const { data: dashboards, loading, error, refetch } = useDashboards(userId);
  const { data: forms, loading: formsLoading } = useForms(userId);
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [selectedFormIds, setSelectedFormIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [deleteModal, setDeleteModal] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filteredAndSortedDashboards = useMemo(() => {
    if (!dashboards) return [];
    const list: DashboardListItem[] = [...dashboards];
    list.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return a.title.localeCompare(b.title, "pt-BR");
    });
    return list;
  }, [dashboards, sortBy]);

  const toggleFormId = useCallback((formId: string) => {
    setSelectedFormIds((prev) =>
      prev.includes(formId) ? prev.filter((id) => id !== formId) : [...prev, formId]
    );
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (selectedFormIds.length === 0) {
      setCreateError("Selecione ao menos um formulário.");
      return;
    }
    setCreating(true);
    try {
      const dash = await api.createDashboard(
        { title: title.trim() || "Dashboard", formIds: selectedFormIds },
        userId
      );
      toast("Dashboard criado.", "success");
      router.push(`/admin/dashboards/${dash.id}`);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Erro ao criar dashboard");
      toast(e instanceof Error ? e.message : "Erro ao criar dashboard", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await api.deleteDashboard(deleteModal.id, userId);
      toast("Dashboard excluído.", "success");
      refetch();
      setDeleteModal(null);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao excluir", "error");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-lg flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-h2 text-[var(--text-primary)]">Dashboards</h1>
          <div className="h-10 w-36 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
        </div>
        <DashboardsListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-lg text-h2 text-[var(--text-primary)]">Dashboards</h1>
        <Card className="flex flex-col items-center justify-center py-12" padding="lg">
          <p className="text-body text-[var(--text-secondary)]">{error}</p>
          <Button className="mt-6" variant="primary" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-lg flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h2 text-[var(--text-primary)]">Dashboards</h1>
        <a href="#novo-dashboard" className="inline-flex">
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            Novo dashboard
          </Button>
        </a>
      </div>

      <Card id="novo-dashboard" className="mb-lg" padding="none">
        <CardHeader className="p-xl pb-0">
          <CardTitle>Novo dashboard</CardTitle>
        </CardHeader>
        <CardContent className="p-xl pt-lg">
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              type="text"
              label="Título"
              placeholder="Ex.: Pesquisa de clima"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="max-w-md"
            />
            <div>
              <span className="mb-2 block text-small font-medium text-[var(--text-secondary)]">
                Formulários
              </span>
              {(() => {
                if (formsLoading) {
                  return (
                    <p className="text-caption text-[var(--text-secondary)]">Carregando formulários...</p>
                  );
                }
                if (forms && forms.length > 0) {
                  return (
                    <ul className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-neutral-200 bg-[var(--background)] p-lg dark:border-neutral-700">
                      {forms.map((f) => (
                        <li key={f.id} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id={`form-${f.id}`}
                            checked={selectedFormIds.includes(f.id)}
                            onChange={() => toggleFormId(f.id)}
                            className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-neutral-600"
                          />
                          <label
                            htmlFor={`form-${f.id}`}
                            className="cursor-pointer text-body text-[var(--text-primary)]"
                          >
                            {f.title}
                          </label>
                        </li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p className="text-caption text-[var(--text-secondary)]">
                    Nenhum formulário. Crie um em Formulários primeiro.
                  </p>
                );
              })()}
            </div>
            {createError && (
              <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-small text-error" role="alert">
                {createError}
              </p>
            )}
            <Button type="submit" loading={creating} disabled={creating || !forms?.length}>
              Criar dashboard
            </Button>
          </form>
        </CardContent>
      </Card>

      {dashboards && dashboards.length > 0 && (
        <div className="mb-lg flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-small text-[var(--text-secondary)]">
            <span>Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "title")}
              className="rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-1.5 text-body text-[var(--text-primary)] dark:border-neutral-600"
            >
              <option value="date">Mais recentes</option>
              <option value="title">Título (A–Z)</option>
            </select>
          </label>
        </div>
      )}

      {filteredAndSortedDashboards.length > 0 && (
        <ul className="flex flex-col gap-md">
          {filteredAndSortedDashboards.map((d) => (
            <li key={d.id}>
              <Card className="flex flex-wrap items-center justify-between gap-4 transition-shadow duration-150 ease-out hover:shadow-md" padding="md">
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-[var(--text-primary)]">{d.title}</span>
                  <p className="mt-1 text-caption text-[var(--text-secondary)]">
                    {d.formIds.length} formulário(s) · Criado em{" "}
                    {new Date(d.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/dashboards/${d.id}`}>
                    <Button variant="secondary" size="sm" leftIcon={<ExternalLink className="h-4 w-4" />}>
                      Ver
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteModal({ id: d.id, title: d.title })}
                    aria-label={`Excluir dashboard ${d.title}`}
                  >
                    <Trash2 className="h-4 w-4 text-error" aria-hidden />
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {dashboards?.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-16" padding="lg">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <LayoutDashboard className="h-8 w-8 text-[var(--text-secondary)]" aria-hidden />
          </div>
          <h2 className="text-h4 text-[var(--text-primary)]">Nenhum dashboard ainda</h2>
          <p className="mt-2 max-w-sm text-center text-body text-[var(--text-secondary)]">
            Crie um dashboard acima para reunir métricas de vários formulários em um só lugar.
          </p>
        </Card>
      )}

      {deleteModal !== null && (
        <Modal
          open
          onClose={() => setDeleteModal(null)}
          title="Excluir dashboard"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setDeleteModal(null)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteConfirm}
                loading={deleting}
                disabled={deleting}
              >
                Excluir
              </Button>
            </>
          }
        >
          <p className="text-body text-[var(--text-primary)]">
            Excluir o dashboard &quot;{deleteModal.title}&quot;? Esta ação não pode ser desfeita.
          </p>
        </Modal>
      )}
    </div>
  );
}
