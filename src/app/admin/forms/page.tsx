"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useForms } from "@/hooks/useForms";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  MoreVertical,
  Copy,
  ExternalLink,
  FileEdit,
  Archive,
  CopyPlus,
  ClipboardList,
} from "lucide-react";

type FormStatus = "draft" | "active" | "paused" | "archived";

type FormItem = {
  id: string;
  title: string;
  status: string;
  slug?: string;
  createdAt: string;
};

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  draft: {
    label: "Rascunho",
    className:
      "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200",
  },
  active: {
    label: "Ativo",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  },
  paused: {
    label: "Pausado",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
  archived: {
    label: "Arquivado",
    className:
      "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  },
};

function StatusBadge({ status }: { readonly status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-small font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function FormsListSkeleton() {
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

export default function AdminFormsPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";
  const { data: forms, loading, error, refetch } = useForms(userId);
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [confirmModal, setConfirmModal] = useState<{
    type: "archive" | "duplicate";
    formId: string;
    formTitle: string;
  } | null>(null);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const closeConfirmModal = useCallback(() => setConfirmModal(null), []);

  const filteredAndSortedForms = useMemo(() => {
    if (!forms) return [];
    let list: FormItem[] = [...forms];
    if (statusFilter !== "all") {
      list = list.filter((f) => f.status === statusFilter);
    }
    list.sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return a.title.localeCompare(b.title, "pt-BR");
    });
    return list;
  }, [forms, statusFilter, sortBy]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast("Copiado!", "success");
    } catch {
      toast(`Não foi possível copiar o ${label}`, "error");
    }
  };

  const handleArchive = (id: string) => {
    setDropdownOpenId(null);
    setConfirmModal({ type: "archive", formId: id, formTitle: "" });
  };

  const handleDuplicate = (id: string) => {
    setDropdownOpenId(null);
    setConfirmModal({ type: "duplicate", formId: id, formTitle: "" });
  };

  const confirmAction = async () => {
    if (!confirmModal) return;
    const { type, formId } = confirmModal;
    setActionLoading(formId);
    try {
      if (type === "archive") {
        const { archiveForm } = await import("@/lib/api");
        await archiveForm(formId, userId);
        toast("Formulário arquivado. Você pode reativar em Editar.", "success");
      } else {
        const { duplicateForm } = await import("@/lib/api");
        await duplicateForm(formId, userId);
        toast("Formulário duplicado com sucesso.", "success");
      }
      refetch();
      setConfirmModal(null);
      setDropdownOpenId(null);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao executar ação", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const getFullUrl = (path: string) => {
    if (globalThis.window === undefined) return path;
    return `${globalThis.window.location.origin}${path}`;
  };

  if (loading) {
    return (
      <div>
        <div className="mb-lg flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-h2 text-[var(--text-primary)]">Formulários</h1>
          <div className="h-10 w-36 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
        </div>
        <FormsListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-body text-error">{error}</p>
    );
  }

  return (
    <div>
      <div className="mb-lg flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-h2 text-[var(--text-primary)]">Formulários</h1>
        <Link href="/admin/forms/new">
          <Button>Novo formulário</Button>
        </Link>
      </div>

      {forms && forms.length > 0 && (
        <div className="mb-lg flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-small text-[var(--text-secondary)]">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-1.5 text-body text-[var(--text-primary)] dark:border-neutral-600"
            >
              <option value="all">Todos</option>
              <option value="draft">Rascunho</option>
              <option value="active">Ativo</option>
              <option value="paused">Pausado</option>
              <option value="archived">Arquivado</option>
            </select>
          </label>
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

      {filteredAndSortedForms.length === 0 && forms && forms.length > 0 && (
        <Card className="py-8 text-center" padding="lg">
          <p className="text-body text-[var(--text-secondary)]">
            Nenhum formulário com o status selecionado. Tente outro filtro.
          </p>
        </Card>
      )}

      {forms?.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-16" padding="lg">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <ClipboardList className="h-8 w-8 text-[var(--text-secondary)]" aria-hidden />
          </div>
          <h2 className="text-h4 text-[var(--text-primary)]">
            Nenhum formulário ainda
          </h2>
          <p className="mt-2 max-w-sm text-center text-body text-[var(--text-secondary)]">
            Crie o primeiro para começar a coletar respostas.
          </p>
          <Link href="/admin/forms/new" className="mt-6">
            <Button>Criar formulário</Button>
          </Link>
        </Card>
      )}

      {filteredAndSortedForms.length > 0 && (
        <ul className="flex flex-col gap-md">
          {filteredAndSortedForms.map((form) => (
            <li key={form.id}>
              <Card className="flex flex-wrap items-center justify-between gap-4" padding="md">
                <div className="min-w-0 flex-1">
                  <span className="font-medium text-[var(--text-primary)]">
                    {form.title}
                  </span>
                  <span className="ml-2">
                    <StatusBadge status={form.status} />
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/admin/forms/${form.id}/edit`}>
                    <Button variant="secondary" size="sm" leftIcon={<FileEdit className="h-4 w-4" />}>
                      Editar
                    </Button>
                  </Link>
                  <Link href={`/admin/forms/${form.id}/responses`}>
                    <Button variant="ghost" size="sm" leftIcon={<ClipboardList className="h-4 w-4" />}>
                      Ver respostas
                    </Button>
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        getFullUrl(`/forms/${form.id}/respond`),
                        "link completo"
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-small text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20"
                    title="Copiar link completo"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="hidden sm:inline">Copiar link completo</span>
                  </button>
                  {form.slug && (
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          getFullUrl(`/r/${form.slug}`),
                          "link curto"
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-small text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20"
                      title="Copiar link curto"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="hidden sm:inline">Copiar link curto</span>
                    </button>
                  )}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setDropdownOpenId(dropdownOpenId === form.id ? null : form.id)
                      }
                      aria-haspopup="true"
                      aria-expanded={dropdownOpenId === form.id}
                      disabled={!!actionLoading}
                    >
                      <MoreVertical className="h-4 w-4" aria-hidden />
                    </Button>
                    {dropdownOpenId === form.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          aria-hidden
                          onClick={() => setDropdownOpenId(null)}
                        />
                        <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] rounded-lg border border-neutral-200 bg-[var(--background)] py-1 shadow-lg dark:border-neutral-700">
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-small text-[var(--text-primary)] hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            onClick={() => {
                              handleDuplicate(form.id);
                            }}
                          >
                            <CopyPlus className="h-4 w-4" />
                            Duplicar
                          </button>
                          {form.status !== "archived" && (
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-small text-error hover:bg-red-50 dark:hover:bg-red-950/30"
                              onClick={() => {
                                handleArchive(form.id);
                              }}
                            >
                              <Archive className="h-4 w-4" />
                              Arquivar
                            </button>
                          )}
                          <a
                            href={`/forms/${form.id}/respond`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center gap-2 px-3 py-2 text-small text-[var(--text-primary)] hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Abrir link em nova aba
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {confirmModal !== null && (
        <Modal
          open
          onClose={closeConfirmModal}
          title={
            confirmModal.type === "archive"
              ? "Arquivar formulário"
              : "Duplicar formulário"
          }
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={closeConfirmModal}>
                Cancelar
              </Button>
              <Button
                variant={confirmModal.type === "archive" ? "danger" : "primary"}
                size="sm"
                onClick={confirmAction}
                loading={actionLoading === confirmModal.formId}
                disabled={!!actionLoading}
              >
                {confirmModal.type === "archive" ? "Arquivar" : "Duplicar"}
              </Button>
            </>
          }
        >
          {confirmModal.type === "archive" ? (
            <p className="text-body text-[var(--text-primary)]">
              Arquivar este formulário? Essa ação pode ser desfeita em Editar
              (alterar status para Ativo ou Rascunho).
            </p>
          ) : (
            <p className="text-body text-[var(--text-primary)]">
              Será criada uma cópia deste formulário em rascunho. Você pode editá-la
              depois.
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
