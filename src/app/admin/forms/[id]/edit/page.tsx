"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import * as api from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  GripVertical,
  FolderPlus,
} from "lucide-react";
import { FormShareActivePanel } from "@/components/admin/form-share-active-panel";

const QUESTION_TYPES = [
  "section",
  "short_text",
  "long_text",
  "multiple_choice",
  "dropdown",
  "checkbox",
  "scale",
  "yes_no",
  "date",
  "number",
] as const;

const TYPE_LABELS: Record<(typeof QUESTION_TYPES)[number], string> = {
  section: "Seção",
  short_text: "Texto curto",
  long_text: "Texto longo",
  multiple_choice: "Múltipla escolha",
  dropdown: "Lista suspensa",
  checkbox: "Checkbox",
  scale: "Escala",
  yes_no: "Sim/Não",
  date: "Data",
  number: "Número",
};

const STATUS_HINTS: Record<string, string> = {
  draft:
    "Rascunho: não aceita respostas. Para publicar, altere o status para Ativo ou use Publicar agora.",
  active: "Ativo: aceita respostas. Compartilhe o link com os respondentes.",
  paused: "Não aceita respostas. Pode reativar depois.",
  archived: "Só leitura. Não aceita respostas nem edição de conteúdo.",
};

type QuestionRow = {
  id?: string;
  _localId: number;
  type: (typeof QUESTION_TYPES)[number];
  text: string;
  required: boolean;
  orderIndex: number;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
};

const DEFAULT_SCALE_MIN = 0;
const DEFAULT_SCALE_MAX = 5;

function getFullUrl(path: string): string {
  if (globalThis.window === undefined) return path;
  return `${globalThis.window.location.origin}${path}`;
}

export default function EditFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [closingMessage, setClosingMessage] = useState("");
  const [folderId, setFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Array<{ id: string; name: string }>>([]);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [isTemplate, setIsTemplate] = useState(false);
  const [status, setStatus] = useState("draft");
  const [slug, setSlug] = useState("");
  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [responseCount, setResponseCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removeQuestionIndex, setRemoveQuestionIndex] = useState<number | null>(null);
  const [questionDragIndex, setQuestionDragIndex] = useState<number | null>(null);
  const [questionDragOver, setQuestionDragOver] = useState<number | null>(null);
  const [optionDrag, setOptionDrag] = useState<{ qIndex: number; oIndex: number } | null>(null);
  const [optionDragOver, setOptionDragOver] = useState<{ qIndex: number; oIndex: number } | null>(null);
  const nextLocalKeyRef = useRef(0);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.fetchForm(id).then((form) => {
        setTitle(form.title);
        setDescription(form.description ?? "");
        setClosingMessage(form.closingMessage ?? "");
        setFolderId(form.folderId ?? null);
        setIsTemplate(Boolean(form.isTemplate));
        setStatus(form.status);
        setSlug(form.slug ?? "");
        setAllowAnonymous(form.allowAnonymous ?? false);
        let seq = 0;
        setQuestions(
          (form.questions ?? []).map((q: QuestionRow & { id: string }) => ({
            id: q.id,
            _localId: seq++,
            type: q.type,
            text: q.text,
            required: q.required,
            orderIndex: q.orderIndex,
            options: q.options ?? undefined,
            scaleMin: q.scaleMin,
            scaleMax: q.scaleMax,
          }))
        );
        nextLocalKeyRef.current = seq;
      }),
      api.fetchFormResponses(id, userId).then((list: unknown[]) => {
        setResponseCount(list?.length ?? 0);
      }).catch(() => setResponseCount(0)),
    ])
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Erro";
        setLoadError(msg === "Form not found" ? "Formulário não encontrado ou sem permissão." : msg);
      })
      .finally(() => setLoading(false));
  }, [id, userId]);

  useEffect(() => {
    void api.fetchFormFolders(userId).then(setFolders).catch(() => setFolders([]));
  }, [userId]);

  const updateQuestion = useCallback((index: number, patch: Partial<QuestionRow>) => {
    setQuestions((q) =>
      q.map((item, i) => {
        if (i !== index) return item;
        const next = { ...item, ...patch };
        if (patch.type === "section" || next.type === "section") {
          next.required = false;
        }
        if (
          (patch.type === "multiple_choice" ||
            patch.type === "dropdown" ||
            patch.type === "checkbox") &&
          (!next.options || next.options.length === 0)
        ) {
          next.options = ["Opção 1", "Opção 2"];
        }
        if (patch.type === "scale") {
          next.scaleMin ??= DEFAULT_SCALE_MIN;
          next.scaleMax ??= DEFAULT_SCALE_MAX;
        }
        return next;
      })
    );
  }, []);

  const setQuestionOptions = useCallback((index: number, options: string[]) => {
    setQuestions((q) =>
      q.map((item, i) => (i === index ? { ...item, options } : item))
    );
  }, []);

  const addOption = useCallback((index: number) => {
    const q = questions[index];
    const opts = q?.options ?? [];
    setQuestionOptions(index, [...opts, `Opção ${opts.length + 1}`]);
  }, [questions, setQuestionOptions]);

  const updateOption = useCallback((index: number, optIndex: number, value: string) => {
    const q = questions[index];
    const opts = [...(q?.options ?? [])];
    opts[optIndex] = value;
    setQuestionOptions(index, opts);
  }, [questions, setQuestionOptions]);

  const removeOption = useCallback((index: number, optIndex: number) => {
    const q = questions[index];
    const opts = (q?.options ?? []).filter((_, i) => i !== optIndex);
    setQuestionOptions(index, opts);
  }, [questions, setQuestionOptions]);

  const moveOption = useCallback((qIndex: number, optIndex: number, direction: "up" | "down") => {
    setQuestions((prev) => {
      const q = prev[qIndex];
      const opts = [...(q.options ?? [])];
      const nextIndex = direction === "up" ? optIndex - 1 : optIndex + 1;
      if (nextIndex < 0 || nextIndex >= opts.length) return prev;
      [opts[optIndex], opts[nextIndex]] = [opts[nextIndex], opts[optIndex]];
      return prev.map((item, i) => (i === qIndex ? { ...item, options: opts } : item));
    });
  }, []);

  const addQuestion = useCallback(() => {
    const lid = nextLocalKeyRef.current++;
    setQuestions((q) => [
      ...q,
      {
        type: "short_text",
        text: "",
        required: false,
        orderIndex: q.length,
        _localId: lid,
      },
    ]);
  }, []);

  const addSection = useCallback(() => {
    const lid = nextLocalKeyRef.current++;
    setQuestions((q) => [
      ...q,
      {
        type: "section",
        text: "",
        required: false,
        orderIndex: q.length,
        _localId: lid,
      },
    ]);
  }, []);

  const removeQuestion = useCallback((index: number) => {
    setRemoveQuestionIndex(index);
  }, []);

  const confirmRemoveQuestion = useCallback(() => {
    if (removeQuestionIndex === null) return;
    setQuestions((q) =>
      q.filter((_, i) => i !== removeQuestionIndex).map((item, i) => ({ ...item, orderIndex: i }))
    );
    setRemoveQuestionIndex(null);
  }, [removeQuestionIndex]);

  const moveQuestion = useCallback((index: number, direction: "up" | "down") => {
    setQuestions((q) => {
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= q.length) return q;
      const copy = [...q];
      [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
      return copy.map((item, i) => ({ ...item, orderIndex: i }));
    });
  }, []);

  const reorderQuestions = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setQuestions((q) => {
      const copy = [...q];
      const [removed] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, removed);
      return copy.map((item, idx) => ({ ...item, orderIndex: idx }));
    });
  }, []);

  const reorderOptions = useCallback((qIndex: number, fromOpt: number, toOpt: number) => {
    if (fromOpt === toOpt) return;
    setQuestions((prev) =>
      prev.map((item, i) => {
        if (i !== qIndex) return item;
        const opts = [...(item.options ?? [])];
        const [removed] = opts.splice(fromOpt, 1);
        opts.splice(toOpt, 0, removed);
        return { ...item, options: opts };
      })
    );
  }, []);

  const persist = useCallback(
    async (saveAndReturn: boolean, statusOverride?: string) => {
      setError(null);
      setSaving(true);
      const effectiveStatus = (statusOverride ?? status) as "draft" | "active" | "archived" | "paused";
      try {
        await api.updateForm(
          id,
          {
            title: title.trim() || "Sem título",
            description: description.trim() || undefined,
            closingMessage: closingMessage.trim() || null,
            folderId,
            isTemplate,
            status: effectiveStatus,
            slug: slug.trim() || null,
            allowAnonymous,
            questions: questions.map((q, i) => ({
              ...(q.id && { id: q.id }),
              type: q.type,
              text: q.text.trim(),
              required: q.type === "section" ? false : q.required,
              orderIndex: i,
              options:
                q.type === "multiple_choice" || q.type === "dropdown" || q.type === "checkbox"
                  ? (q.options ?? []).filter((o) => o.trim().length > 0)
                  : undefined,
              scaleMin: q.type === "scale" ? (q.scaleMin ?? DEFAULT_SCALE_MIN) : undefined,
              scaleMax: q.type === "scale" ? (q.scaleMax ?? DEFAULT_SCALE_MAX) : undefined,
            })),
          },
          userId
        );
        if (statusOverride !== undefined) setStatus(statusOverride);
        toast(
          statusOverride === "active"
            ? "Formulário publicado. O link já aceita respostas."
            : "Formulário salvo.",
          "success"
        );
        if (saveAndReturn) router.push("/admin/forms");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erro ao salvar";
        setError(msg);
        toast(msg, "error");
      } finally {
        setSaving(false);
      }
    },
    [
      id,
      title,
      description,
      closingMessage,
      folderId,
      isTemplate,
      status,
      slug,
      allowAnonymous,
      questions,
      userId,
      toast,
      router,
    ]
  );

  if (loading) {
    return (
      <div className="p-lg">
        <p className="text-body text-[var(--text-secondary)]">Carregando...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-lg">
        <Card className="max-w-xl" padding="lg">
          <p className="text-body text-[var(--text-primary)]">{loadError}</p>
          <Link href="/admin/forms" className="mt-4 inline-block">
            <Button variant="secondary">Voltar à lista</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <nav className="mb-md flex items-center gap-2 text-small text-[var(--text-secondary)]" aria-label="Breadcrumb">
        <Link href="/admin/forms" className="hover:text-primary-600 dark:hover:text-primary-400">
          Formulários
        </Link>
        <span aria-hidden>/</span>
        <span className="text-[var(--text-primary)]">Editar</span>
      </nav>
      <h1 className="mb-lg text-h2 text-[var(--text-primary)]">Editar formulário</h1>

      {status === "draft" || status === "paused" ? (
        <div
          role="status"
          className="mb-lg flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-md py-3 text-body text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
          <p>
            <strong>Falta publicar.</strong> O link não aceita respostas até o status ser{" "}
            <strong>Ativo</strong>. Use o cartão abaixo ou altere o status nas informações do formulário.
          </p>
        </div>
      ) : status === "active" ? (
        <div
          role="status"
          className="mb-lg flex items-start gap-3 rounded-lg border border-green-300 bg-green-50 px-md py-3 text-body text-green-900 dark:border-green-800 dark:bg-green-950/40 dark:text-green-100"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" aria-hidden />
          <p>
            <strong>Publicado.</strong> O link aceita respostas enquanto estiver <strong>Ativo</strong>.
          </p>
        </div>
      ) : null}

      {status === "active" && id ? (
        <div className="mb-lg">
          <FormShareActivePanel
            respondUrl={getFullUrl(`/forms/${id}/respond`)}
            shortUrl={slug.trim() ? getFullUrl(`/r/${slug.trim()}`) : null}
          />
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void persist(false);
        }}
        className="space-y-lg"
      >
        {error && (
          <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-small text-error" role="alert">
            {error}
          </p>
        )}

        {(status === "draft" || status === "paused") && (
          <Card
            className="max-w-2xl border-primary-200 bg-primary-50/50 dark:border-primary-900 dark:bg-primary-950/30"
            padding="lg"
          >
            <CardHeader>
              <CardTitle>Publicar o formulário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <p className="text-body text-[var(--text-primary)]">
                Enquanto estiver em <strong>Rascunho</strong> ou <strong>Pausado</strong>, o link{" "}
                <strong>não aceita</strong> respostas. Com status <strong>Ativo</strong>, qualquer pessoa com o
                link pode responder.
              </p>
              <div className="flex flex-wrap gap-2">
                {status === "draft" && (
                  <Button
                    type="button"
                    variant="primary"
                    loading={saving}
                    disabled={saving}
                    onClick={() => void persist(false, "active")}
                  >
                    Publicar agora
                  </Button>
                )}
                {status === "paused" && (
                  <Button
                    type="button"
                    variant="primary"
                    loading={saving}
                    disabled={saving}
                    onClick={() => void persist(false, "active")}
                  >
                    Reativar e publicar
                  </Button>
                )}
                <Link href={`/forms/${id}/respond`} target="_blank" rel="noopener noreferrer">
                  <Button type="button" variant="secondary" size="sm">
                    Abrir link do formulário
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="max-w-2xl" padding="lg">
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-lg">
            <Input
              id="edit-title"
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="text-[var(--text-primary)]"
            />
            <div>
              <label htmlFor="edit-description" className="mb-1 block text-small font-medium text-[var(--text-primary)]">
                Descrição
              </label>
              <textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600"
              />
            </div>
            <div>
              <label
                htmlFor="edit-closing-message"
                className="mb-1 block text-small font-medium text-[var(--text-primary)]"
              >
                Mensagem ao finalizar (opcional)
              </label>
              <textarea
                id="edit-closing-message"
                value={closingMessage}
                onChange={(e) => setClosingMessage(e.target.value)}
                rows={3}
                placeholder="Ex.: Obrigado por participar."
                className="w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600"
              />
              <p className="mt-1 text-caption text-[var(--text-secondary)]">
                Exibida na confirmação após o envio da resposta.
              </p>
            </div>
            <div>
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="edit-folder-id" className="block text-small font-medium text-[var(--text-primary)]">
                  Pasta (opcional)
                </label>
                <Button type="button" variant="ghost" size="sm" onClick={() => setNewFolderOpen(true)} leftIcon={<FolderPlus className="h-4 w-4" />}>
                  Nova pasta
                </Button>
              </div>
              <select
                id="edit-folder-id"
                value={folderId ?? ""}
                onChange={(e) => setFolderId(e.target.value === "" ? null : e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] dark:border-neutral-600"
              >
                <option value="">Sem pasta</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-caption text-[var(--text-secondary)]">
                Pastas padronizam a organização na lista; você também pode arrastar formulários entre pastas na lista.
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                id="edit-is-template"
                type="checkbox"
                checked={isTemplate}
                onChange={(e) => setIsTemplate(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-body text-[var(--text-primary)]">
                Formulário modelo (aparece na lista para &quot;Usar modelo&quot;)
              </span>
            </label>
            <div>
              <label htmlFor="edit-status" className="mb-1 flex items-center gap-1.5 text-small font-medium text-[var(--text-primary)]">
                Status{" "}
                <span title={STATUS_HINTS[status] ?? ""} className="text-neutral-400" aria-label="Explicação do status">
                  <HelpCircle className="h-4 w-4" />
                </span>
              </label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                title={STATUS_HINTS[status] ?? ""}
                className="w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] dark:border-neutral-600"
              >
                <option value="draft" title={STATUS_HINTS.draft}>Rascunho</option>
                <option value="active" title={STATUS_HINTS.active}>Ativo</option>
                <option value="paused" title={STATUS_HINTS.paused}>Pausado</option>
                <option value="archived" title={STATUS_HINTS.archived}>Arquivado</option>
              </select>
              <p className="mt-1 text-caption text-[var(--text-secondary)]">
                {STATUS_HINTS[status]}
              </p>
            </div>
            <Input
              id="edit-slug"
              label="Link curto (opcional)"
              value={slug}
              onChange={(e) => setSlug(e.target.value.replaceAll(/[^a-z0-9-_]/gi, ""))}
              placeholder="ex: pesquisa-2025"
              hint="Link curto: /r/seu-slug"
              className="text-[var(--text-primary)]"
            />
            {slug && (
              <p className="text-caption text-[var(--text-secondary)]">
                Preview:{" "}
                <a href={getFullUrl(`/r/${slug}`)} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline dark:text-primary-400">
                  {getFullUrl(`/r/${slug}`)}
                </a>
              </p>
            )}
            <label className="flex cursor-pointer items-center gap-2">
              <input
                id="edit-allow-anonymous"
                type="checkbox"
                checked={allowAnonymous}
                onChange={(e) => setAllowAnonymous(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-body text-[var(--text-primary)]">Permitir respostas anônimas</span>
            </label>
          </CardContent>
        </Card>

        <Card className="max-w-2xl" padding="lg">
          <CardHeader>
            <CardTitle>Perguntas e seções</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-lg">
              {questions.map((q, i) => (
                <li
                  key={q.id ?? `local-${q._localId}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    setQuestionDragOver(i);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const raw = e.dataTransfer.getData("text/plain");
                    const from = questionDragIndex ?? (raw ? Number(raw) : NaN);
                    if (!Number.isNaN(from) && from !== i) reorderQuestions(from, i);
                    setQuestionDragIndex(null);
                    setQuestionDragOver(null);
                  }}
                  className={
                    questionDragOver === i
                      ? "rounded-xl ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-[var(--background)]"
                      : ""
                  }
                >
                  <Card padding="md" className="border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-start gap-2">
                      <div className="flex flex-col gap-0.5 pt-1">
                        <button
                          type="button"
                          draggable
                          onDragStart={(e) => {
                            setQuestionDragIndex(i);
                            e.dataTransfer.setData("text/plain", String(i));
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragEnd={() => {
                            setQuestionDragIndex(null);
                            setQuestionDragOver(null);
                          }}
                          aria-label="Arrastar para reordenar pergunta"
                          className="cursor-grab touch-none rounded p-1 text-neutral-400 hover:bg-neutral-100 active:cursor-grabbing dark:hover:bg-neutral-800"
                        >
                          <GripVertical className="h-4 w-4 shrink-0" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveQuestion(i, "up")}
                          disabled={i === 0}
                          aria-label="Mover pergunta para cima"
                          className="rounded p-1 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800"
                        >
                          <ChevronLeft className="h-4 w-4 rotate-90" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveQuestion(i, "down")}
                          disabled={i === questions.length - 1}
                          aria-label="Mover pergunta para baixo"
                          className="rounded p-1 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800"
                        >
                          <ChevronRight className="h-4 w-4 rotate-90" />
                        </button>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-small font-medium text-[var(--text-secondary)]">
                            {q.type === "section" ? "Seção" : `Pergunta ${i + 1}`} · {TYPE_LABELS[q.type]}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(i)}
                            className="text-error hover:bg-error/10"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                            Remover
                          </Button>
                        </div>
                        <select
                          value={q.type}
                          onChange={(e) => updateQuestion(i, { type: e.target.value as QuestionRow["type"] })}
                          className="mb-2 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] dark:border-neutral-600"
                        >
                          {QUESTION_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {TYPE_LABELS[t]}
                            </option>
                          ))}
                        </select>
                        <Input
                          id={q.id ? `edit-q-${q.id}-text` : `edit-q-${q._localId}-text`}
                          placeholder={q.type === "section" ? "Título da seção" : "Texto da pergunta"}
                          value={q.text}
                          onChange={(e) => updateQuestion(i, { text: e.target.value })}
                          className="text-[var(--text-primary)]"
                        />
                        {q.type !== "section" && (
                          <label className="mt-2 flex cursor-pointer items-center gap-2">
                            <input
                              type="checkbox"
                              checked={q.required}
                              onChange={(e) => updateQuestion(i, { required: e.target.checked })}
                              className="h-4 w-4 rounded border-neutral-300 text-primary-600"
                            />
                            <span className="text-small text-[var(--text-primary)]">Obrigatória</span>
                          </label>
                        )}
                        {(q.type === "multiple_choice" ||
                          q.type === "dropdown" ||
                          q.type === "checkbox") && (
                          <div className="mt-3">
                            <span className="mb-1 block text-small font-medium text-[var(--text-primary)]">
                              Opções (arraste pelo ícone ou use as setas)
                            </span>
                            <ul className="space-y-2">
                              {(q.options ?? []).map((opt, oi) => (
                                <li
                                  key={`opt-slot-${q.id ?? q._localId}-${oi}`}
                                  className={`flex gap-1 rounded-lg ${
                                    optionDragOver?.qIndex === i && optionDragOver?.oIndex === oi
                                      ? "ring-2 ring-primary-500 ring-offset-1 dark:ring-offset-[var(--background)]"
                                      : ""
                                  }`}
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = "move";
                                    setOptionDragOver({ qIndex: i, oIndex: oi });
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    if (optionDrag === null || optionDrag.qIndex !== i) {
                                      setOptionDrag(null);
                                      setOptionDragOver(null);
                                      return;
                                    }
                                    const from = optionDrag.oIndex;
                                    if (from !== oi) reorderOptions(i, from, oi);
                                    setOptionDrag(null);
                                    setOptionDragOver(null);
                                  }}
                                >
                                  <div className="flex flex-col gap-0.5 pt-1">
                                    <button
                                      type="button"
                                      draggable
                                      onDragStart={(e) => {
                                        setOptionDrag({ qIndex: i, oIndex: oi });
                                        e.dataTransfer.setData("text/plain", `${i}:${oi}`);
                                        e.dataTransfer.effectAllowed = "move";
                                      }}
                                      onDragEnd={() => {
                                        setOptionDrag(null);
                                        setOptionDragOver(null);
                                      }}
                                      aria-label="Arrastar para reordenar opção"
                                      className="cursor-grab touch-none rounded p-0.5 text-neutral-400 hover:bg-neutral-100 active:cursor-grabbing dark:hover:bg-neutral-800"
                                    >
                                      <GripVertical className="h-4 w-4 shrink-0" aria-hidden />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => moveOption(i, oi, "up")}
                                      disabled={oi === 0}
                                      aria-label="Mover opção para cima"
                                      className="rounded p-0.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800"
                                    >
                                      <ChevronUp className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => moveOption(i, oi, "down")}
                                      disabled={oi === (q.options ?? []).length - 1}
                                      aria-label="Mover opção para baixo"
                                      className="rounded p-0.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800"
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => updateOption(i, oi, e.target.value)}
                                    placeholder={`Opção ${oi + 1}`}
                                    className="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-1.5 text-body text-[var(--text-primary)] dark:border-neutral-600"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOption(i, oi)}
                                    aria-label="Remover opção"
                                    className="shrink-0 text-error"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => addOption(i)}
                              className="mt-1 text-primary-600 dark:text-primary-400"
                            >
                              <Plus className="h-4 w-4" aria-hidden />
                              Adicionar opção
                            </Button>
                          </div>
                        )}
                        {q.type === "scale" && (
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                              <label
                                htmlFor={`scale-min-${q.id ?? q._localId}`}
                                className="text-small text-[var(--text-secondary)]"
                              >
                                Mín
                              </label>
                              <input
                                id={`scale-min-${q.id ?? q._localId}`}
                                type="number"
                                value={q.scaleMin ?? DEFAULT_SCALE_MIN}
                                onChange={(e) => updateQuestion(i, { scaleMin: e.target.value === "" ? undefined : Number(e.target.value) })}
                                className="w-20 rounded-lg border border-neutral-300 bg-[var(--background)] px-2 py-1.5 text-body dark:border-neutral-600"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <label
                                htmlFor={`scale-max-${q.id ?? q._localId}`}
                                className="text-small text-[var(--text-secondary)]"
                              >
                                Máx
                              </label>
                              <input
                                id={`scale-max-${q.id ?? q._localId}`}
                                type="number"
                                value={q.scaleMax ?? DEFAULT_SCALE_MAX}
                                onChange={(e) => updateQuestion(i, { scaleMax: e.target.value === "" ? undefined : Number(e.target.value) })}
                                className="w-20 rounded-lg border border-neutral-300 bg-[var(--background)] px-2 py-1.5 text-body dark:border-neutral-600"
                              />
                            </div>
                            <span className="text-caption text-[var(--text-secondary)]">
                              Valor padrão: {DEFAULT_SCALE_MIN} a {DEFAULT_SCALE_MAX}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
            <div className="mt-lg flex flex-col gap-2 border-t border-neutral-200 pt-lg dark:border-neutral-700 sm:flex-row sm:flex-wrap">
              <Button type="button" variant="secondary" size="sm" onClick={addQuestion}>
                <Plus className="h-4 w-4" aria-hidden />
                Adicionar pergunta
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={addSection}>
                <Plus className="h-4 w-4" aria-hidden />
                Adicionar seção
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" loading={saving} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void persist(true)}
            loading={saving}
            disabled={saving}
          >
            Salvar e voltar
          </Button>
          <Link href="/admin/forms">
            <Button type="button" variant="ghost">Cancelar</Button>
          </Link>
        </div>
      </form>

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
              <Button
                variant="primary"
                size="sm"
                loading={creatingFolder}
                disabled={creatingFolder}
                onClick={() => {
                  const name = newFolderName.trim();
                  if (!name) {
                    toast("Informe o nome da pasta.", "error");
                    return;
                  }
                  setCreatingFolder(true);
                  void api
                    .createFormFolder(name, userId)
                    .then((created) => {
                      toast("Pasta criada.", "success");
                      setFolderId(created.id);
                      setNewFolderName("");
                      setNewFolderOpen(false);
                      return api.fetchFormFolders(userId).then(setFolders);
                    })
                    .catch((e) => toast(e instanceof Error ? e.message : "Erro ao criar pasta", "error"))
                    .finally(() => setCreatingFolder(false));
                }}
              >
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

      {removeQuestionIndex !== null && (
        <Modal
          open
          onClose={() => setRemoveQuestionIndex(null)}
          title="Remover pergunta"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setRemoveQuestionIndex(null)}>
                Cancelar
              </Button>
              <Button variant="danger" size="sm" onClick={confirmRemoveQuestion}>
                Remover
              </Button>
            </>
          }
        >
          {responseCount > 0 ? (
            <p className="text-body text-[var(--text-primary)]">
              Este formulário já tem {responseCount} resposta(s). A pergunta será removida da edição, mas as respostas já enviadas não são alteradas. Deseja remover mesmo assim?
            </p>
          ) : (
            <p className="text-body text-[var(--text-primary)]">
              Deseja remover esta pergunta?
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
