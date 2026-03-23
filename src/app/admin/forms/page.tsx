"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForms } from "@/hooks/useForms";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import * as api from "@/lib/api";
import {
  MoreVertical,
  Copy,
  ExternalLink,
  FileEdit,
  Archive,
  CopyPlus,
  ClipboardList,
  FileWarning,
  GripVertical,
  Search,
  FolderPlus,
} from "lucide-react";

type FormItem = {
  id: string;
  title: string;
  status: string;
  slug?: string;
  folderId?: string;
  folder?: string;
  isTemplate?: boolean;
  createdAt: string;
};

type FolderRow = { id: string; name: string };

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
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

const STATUS_SEARCH: Record<string, string> = {
  draft: "rascunho",
  active: "ativo",
  paused: "pausado",
  archived: "arquivado",
};

function normalizeSearch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

function matchesSearch(form: FormItem, query: string): boolean {
  const q = query.trim();
  if (!q) return true;
  const needle = normalizeSearch(q);
  const parts = [
    normalizeSearch(form.title),
    normalizeSearch(form.folder ?? ""),
    normalizeSearch(form.status),
    normalizeSearch(STATUS_SEARCH[form.status] ?? ""),
    normalizeSearch(STATUS_CONFIG[form.status]?.label ?? ""),
  ];
  return parts.some((p) => p.includes(needle));
}

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
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";
  const { data: forms, loading, error, refetch } = useForms(userId);
  const toast = useToast();
  const [folders, setFolders] = useState<FolderRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [listKind, setListKind] = useState<"all" | "templates" | "forms">("all");
  const [folderFilter, setFolderFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [confirmModal, setConfirmModal] = useState<{
    type: "archive" | "duplicate";
    formId: string;
    formTitle: string;
  } | null>(null);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formDragId, setFormDragId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | "root" | null>(null);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  const loadFolders = useCallback(async () => {
    try {
      const list = await api.fetchFormFolders(userId);
      setFolders(list.map((f) => ({ id: f.id, name: f.name })));
    } catch {
      setFolders([]);
    }
  }, [userId]);

  useEffect(() => {
    if (!loading && forms && !error) void loadFolders();
  }, [loading, forms, error, loadFolders]);

  const closeConfirmModal = useCallback(() => setConfirmModal(null), []);

  const filteredAndSortedForms = useMemo(() => {
    if (!forms) return [];
    let list: FormItem[] = [...forms];
    if (statusFilter !== "all") {
      list = list.filter((f) => f.status === statusFilter);
    }
    if (listKind === "templates") {
      list = list.filter((f) => f.isTemplate === true);
    } else if (listKind === "forms") {
      list = list.filter((f) => !f.isTemplate);
    }
    if (folderFilter === "none") {
      list = list.filter((f) => !f.folderId);
    } else if (folderFilter !== "all") {
      list = list.filter((f) => f.folderId === folderFilter);
    }
    list = list.filter((f) => matchesSearch(f, searchQuery));
    list.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return a.title.localeCompare(b.title, "pt-BR");
    });
    return list;
  }, [forms, statusFilter, listKind, folderFilter, sortBy, searchQuery]);

  const formsByFolder = useMemo(() => {
    const m = new Map<string | null, FormItem[]>();
    for (const f of filteredAndSortedForms) {
      const k = f.folderId ?? null;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(f);
    }
    return m;
  }, [filteredAndSortedForms]);

  const sectionOrder = useMemo(() => {
    const ordered: { folderId: string | null; name: string }[] = [
      { folderId: null, name: "Sem pasta" },
      ...[...folders].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")).map((f) => ({
        folderId: f.id,
        name: f.name,
      })),
    ];
    return ordered;
  }, [folders]);

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

  const handleUseTemplate = async (formId: string) => {
    setDropdownOpenId(null);
    setActionLoading(formId);
    try {
      const { duplicateForm } = await import("@/lib/api");
      const created = (await duplicateForm(formId, userId)) as { id?: string };
      if (!created?.id) throw new Error("Resposta inválida ao duplicar");
      toast("Cópia em rascunho criada. Ajuste o título e publique quando estiver pronto.", "success");
      await refetch();
      router.push(`/admin/forms/${created.id}/edit`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao usar modelo", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const moveFormToFolder = async (formId: string, targetFolderId: string | null) => {
    setActionLoading(formId);
    try {
      await api.updateForm(formId, { folderId: targetFolderId }, userId);
      toast("Formulário movido de pasta.", "success");
      await refetch();
      await loadFolders();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao mover formulário", "error");
    } finally {
      setActionLoading(null);
      setFormDragId(null);
      setDragOverFolderId(null);
    }
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

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name) {
      toast("Informe o nome da pasta.", "error");
      return;
    }
    setCreatingFolder(true);
    try {
      await api.createFormFolder(name, userId);
      toast("Pasta criada.", "success");
      setNewFolderName("");
      setNewFolderOpen(false);
      await loadFolders();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Erro ao criar pasta", "error");
    } finally {
      setCreatingFolder(false);
    }
  };

  const renderFormCard = (form: FormItem) => (
    <Card
      className={`flex flex-wrap items-center justify-between gap-4 ${
        form.status === "draft"
          ? "border-l-4 border-l-amber-500 bg-amber-50/40 dark:bg-amber-950/15"
          : ""
      }`}
      padding="md"
    >
      <div className="flex min-w-0 flex-1 items-start gap-2">
        <button
          type="button"
          draggable
          onDragStart={(e) => {
            setFormDragId(form.id);
            e.dataTransfer.setData("text/plain", form.id);
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragEnd={() => {
            setFormDragId(null);
            setDragOverFolderId(null);
          }}
          aria-label={`Arrastar formulário ${form.title} para outra pasta`}
          className="mt-0.5 cursor-grab touch-none rounded p-1 text-neutral-400 hover:bg-neutral-100 active:cursor-grabbing dark:hover:bg-neutral-800"
        >
          <GripVertical className="h-4 w-4 shrink-0" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {form.status === "draft" && (
              <span
                className="text-amber-600 dark:text-amber-400"
                title="Criado, ainda não publicado — o link não aceita respostas"
              >
                <FileWarning className="h-4 w-4 shrink-0" aria-hidden />
              </span>
            )}
            <span className="font-medium text-[var(--text-primary)]">{form.title}</span>
            <StatusBadge status={form.status} />
            {form.isTemplate && (
              <span className="rounded-md bg-violet-100 px-2 py-0.5 text-caption font-medium text-violet-900 dark:bg-violet-900/35 dark:text-violet-200">
                Modelo
              </span>
            )}
          </div>
          {form.folder?.trim() && (
            <p className="mt-1 text-caption text-[var(--text-secondary)]">Pasta: {form.folder.trim()}</p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {form.isTemplate && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => void handleUseTemplate(form.id)}
            loading={actionLoading === form.id}
            disabled={!!actionLoading}
          >
            Usar modelo
          </Button>
        )}
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
          onClick={() => copyToClipboard(getFullUrl(`/forms/${form.id}/respond`), "link completo")}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-small text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/20"
          title="Copiar link completo"
        >
          <Copy className="h-4 w-4" />
          <span className="hidden sm:inline">Copiar link completo</span>
        </button>
        {form.slug && (
          <button
            type="button"
            onClick={() => copyToClipboard(getFullUrl(`/r/${form.slug}`), "link curto")}
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
            onClick={() => setDropdownOpenId(dropdownOpenId === form.id ? null : form.id)}
            aria-haspopup="true"
            aria-expanded={dropdownOpenId === form.id}
            disabled={!!actionLoading}
          >
            <MoreVertical className="h-4 w-4" aria-hidden />
          </Button>
          {dropdownOpenId === form.id && (
            <>
              <div className="fixed inset-0 z-10" aria-hidden onClick={() => setDropdownOpenId(null)} />
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
  );

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
      <div>
        <h1 className="mb-lg text-h2 text-[var(--text-primary)]">Formulários</h1>
        <Card className="flex flex-col items-center justify-center py-12" padding="lg">
          <p className="text-body text-[var(--text-secondary)]">{error}</p>
          <Button
            className="mt-6"
            variant="primary"
            onClick={async () => {
              const ok = await refetch();
              if (ok) toast("Lista atualizada.", "success");
              else toast("Não foi possível recarregar. Tente de novo.", "error");
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
        <h1 className="text-h2 text-[var(--text-primary)]">Formulários</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => setNewFolderOpen(true)} leftIcon={<FolderPlus className="h-4 w-4" />}>
            Nova pasta
          </Button>
          <Link href="/admin/forms/new">
            <Button>Novo formulário</Button>
          </Link>
        </div>
      </div>

      {forms && forms.length > 0 && (
        <div className="mb-lg flex flex-col gap-3">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, pasta ou status…"
              aria-label="Buscar formulários"
              className="h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] py-2 pl-10 pr-3 text-body text-[var(--text-primary)] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
              <span>Lista:</span>
              <select
                value={listKind}
                onChange={(e) => setListKind(e.target.value as "all" | "templates" | "forms")}
                className="rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-1.5 text-body text-[var(--text-primary)] dark:border-neutral-600"
              >
                <option value="all">Todos</option>
                <option value="templates">Só modelos</option>
                <option value="forms">Sem modelos</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-small text-[var(--text-secondary)]">
              <span>Pasta:</span>
              <select
                value={folderFilter}
                onChange={(e) => setFolderFilter(e.target.value)}
                className="rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-1.5 text-body text-[var(--text-primary)] dark:border-neutral-600"
              >
                <option value="all">Todas</option>
                <option value="none">Sem pasta</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
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
        </div>
      )}

      {forms && forms.length > 0 && (
        <Card className="mb-lg max-w-3xl border-neutral-200 dark:border-neutral-700" padding="md">
          <p className="text-body text-[var(--text-primary)]">
            <strong>Pastas:</strong> arraste pelo ícone ⋮⋮ para mover entre &quot;Sem pasta&quot; e pastas criadas.
            Use <strong>Nova pasta</strong> para nomes padronizados e evitar duplicatas por digitação.
          </p>
        </Card>
      )}

      {filteredAndSortedForms.length === 0 && forms && forms.length > 0 && (
        <Card className="py-8 text-center" padding="lg">
          <p className="text-body text-[var(--text-secondary)]">
            Nenhum resultado para os filtros ou busca atuais.
          </p>
        </Card>
      )}

      {forms?.length === 0 && (
        <Card className="flex flex-col items-center justify-center py-16" padding="lg">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <ClipboardList className="h-8 w-8 text-[var(--text-secondary)]" aria-hidden />
          </div>
          <h2 className="text-h4 text-[var(--text-primary)]">Nenhum formulário ainda</h2>
          <p className="mt-2 max-w-sm text-center text-body text-[var(--text-secondary)]">
            Crie o primeiro para começar a coletar respostas.
          </p>
          <Link href="/admin/forms/new" className="mt-6">
            <Button>Criar formulário</Button>
          </Link>
        </Card>
      )}

      {filteredAndSortedForms.length > 0 && (
        <div className="space-y-lg">
          {sectionOrder.map((sec) => {
            const list = formsByFolder.get(sec.folderId) ?? [];
            const dropKey = sec.folderId === null ? "root" : sec.folderId;
            const isOver = dragOverFolderId === dropKey;
            return (
              <section
                key={dropKey}
                className={`rounded-xl border-2 border-dashed p-md transition-colors ${
                  isOver ? "border-primary-500 bg-primary-50/40 dark:bg-primary-950/20" : "border-transparent"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setDragOverFolderId(dropKey);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = formDragId ?? e.dataTransfer.getData("text/plain");
                  if (id) void moveFormToFolder(id, sec.folderId);
                }}
              >
                <h2 className="mb-md text-h4 text-[var(--text-primary)]">{sec.name}</h2>
                {list.length === 0 ? (
                  <p className="text-small text-[var(--text-secondary)]">
                    Nenhum formulário nesta pasta{formDragId ? " — solte aqui para mover" : ""}.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-md">
                    {list.map((f) => (
                      <li key={f.id}>{renderFormCard(f)}</li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}

      {newFolderOpen && (
        <Modal
          open
          onClose={() => {
            setNewFolderOpen(false);
            setNewFolderName("");
          }}
          title="Nova pasta"
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setNewFolderOpen(false);
                  setNewFolderName("");
                }}
              >
                Cancelar
              </Button>
              <Button variant="primary" size="sm" loading={creatingFolder} disabled={creatingFolder} onClick={() => void handleCreateFolder()}>
                Criar
              </Button>
            </>
          }
        >
          <Input
            label="Nome da pasta"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Ex.: 2025 · Clima organizacional"
            className="text-[var(--text-primary)]"
          />
        </Modal>
      )}

      {confirmModal !== null && (
        <Modal
          open
          onClose={closeConfirmModal}
          title={confirmModal.type === "archive" ? "Arquivar formulário" : "Duplicar formulário"}
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
              Arquivar este formulário? Essa ação pode ser desfeita em Editar (alterar status para Ativo ou
              Rascunho).
            </p>
          ) : (
            <p className="text-body text-[var(--text-primary)]">
              Será criada uma cópia em rascunho (útil para repetir a mesma pesquisa no ano seguinte ou a partir de
              um modelo). Depois edite o título, pasta e publique.
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
