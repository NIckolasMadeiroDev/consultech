"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import * as api from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  Eye,
  Check,
  GripVertical,
  FolderPlus,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import {
  RespondFormView,
  type RespondFormQuestion,
} from "@/components/forms/respond-form-view";

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

type QuestionRow = {
  type: (typeof QUESTION_TYPES)[number];
  text: string;
  required: boolean;
  orderIndex: number;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  _localId?: number;
};

const DEFAULT_SCALE_MIN = 0;
const DEFAULT_SCALE_MAX = 5;

function getFullUrl(path: string): string {
  if (globalThis.window === undefined) return path;
  return `${globalThis.window.location.origin}${path}`;
}

type ValidationErrors = {
  title?: string;
  questions?: Record<number, { text?: string; options?: string; scale?: string }>;
  submit?: string;
};

const STEP_LABELS: Record<number, string> = { 1: "Informações", 2: "Perguntas", 3: "Revisar" };

function buildLocalPreviewForm(
  title: string,
  description: string,
  closingMessage: string,
  allowAnonymous: boolean,
  rows: QuestionRow[]
): {
  title: string;
  description?: string;
  closingMessage?: string;
  allowAnonymous: boolean;
  questions: RespondFormQuestion[];
} | null {
  const valid = rows.filter((q) => q.text.trim().length > 0);
  const answerable = valid.filter((q) => q.type !== "section");
  if (answerable.length === 0) return null;
  const questions: RespondFormQuestion[] = valid.map((q, i) => {
    const opts =
      q.type === "multiple_choice" || q.type === "dropdown" || q.type === "checkbox"
        ? (q.options ?? []).filter((o) => o.trim().length > 0)
        : undefined;
    return {
      id: `pv-${q._localId ?? i}`,
      type: q.type,
      text: q.text.trim(),
      required: q.type === "section" ? false : q.required,
      orderIndex: i,
      options: opts?.length ? opts : undefined,
      scaleMin: q.type === "scale" ? (q.scaleMin ?? DEFAULT_SCALE_MIN) : undefined,
      scaleMax: q.type === "scale" ? (q.scaleMax ?? DEFAULT_SCALE_MAX) : undefined,
    };
  });
  return {
    title: title.trim() || "Sem título",
    description: description.trim() || undefined,
    closingMessage: closingMessage.trim() || undefined,
    allowAnonymous,
    questions,
  };
}

export default function NewFormPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const userId = user?.id ?? "anonymous";
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [closingMessage, setClosingMessage] = useState("");
  const [folderId, setFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Array<{ id: string; name: string }>>([]);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [isTemplate, setIsTemplate] = useState(false);
  const [slug, setSlug] = useState("");
  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [questions, setQuestions] = useState<QuestionRow[]>([
    { type: "short_text", text: "", required: false, orderIndex: 0, _localId: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [publishAsActive, setPublishAsActive] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewNonce, setPreviewNonce] = useState(0);
  const [previewForm, setPreviewForm] = useState<{
    title: string;
    description?: string;
    closingMessage?: string;
    allowAnonymous: boolean;
    questions: RespondFormQuestion[];
  } | null>(null);
  const [questionDragIndex, setQuestionDragIndex] = useState<number | null>(null);
  const [questionDragOver, setQuestionDragOver] = useState<number | null>(null);
  const [optionDrag, setOptionDrag] = useState<{ qIndex: number; oIndex: number } | null>(null);
  const [optionDragOver, setOptionDragOver] = useState<{ qIndex: number; oIndex: number } | null>(null);
  const nextQuestionKeyRef = useRef(1);

  useEffect(() => {
    void api.fetchFormFolders(userId).then(setFolders).catch(() => setFolders([]));
  }, [userId]);

  const openRespondentPreview = () => {
    const built = buildLocalPreviewForm(
      title,
      description,
      closingMessage,
      allowAnonymous,
      questions
    );
    if (!built) {
      toast("Inclua ao menos uma pergunta com texto para pré-visualizar.", "error");
      return;
    }
    setPreviewForm(built);
    setPreviewNonce((n) => n + 1);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewForm(null);
  };

  const addQuestion = () => {
    const lid = nextQuestionKeyRef.current++;
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
  };

  const addSection = () => {
    const lid = nextQuestionKeyRef.current++;
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
  };

  const updateQuestion = (index: number, patch: Partial<QuestionRow>) => {
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
  };

  const setQuestionOptions = (index: number, options: string[]) => {
    setQuestions((q) =>
      q.map((item, i) => (i === index ? { ...item, options } : item))
    );
  };

  const addOption = (index: number) => {
    const q = questions[index];
    const opts = q.options ?? [];
    setQuestionOptions(index, [...opts, `Opção ${opts.length + 1}`]);
  };

  const updateOption = (index: number, optIndex: number, value: string) => {
    const q = questions[index];
    const opts = [...(q.options ?? [])];
    opts[optIndex] = value;
    setQuestionOptions(index, opts);
  };

  const removeOption = (index: number, optIndex: number) => {
    const q = questions[index];
    const opts = (q.options ?? []).filter((_, i) => i !== optIndex);
    setQuestionOptions(index, opts);
  };

  const moveOption = (qIndex: number, optIndex: number, direction: "up" | "down") => {
    const q = questions[qIndex];
    const opts = [...(q.options ?? [])];
    const nextIndex = direction === "up" ? optIndex - 1 : optIndex + 1;
    if (nextIndex < 0 || nextIndex >= opts.length) return;
    [opts[optIndex], opts[nextIndex]] = [opts[nextIndex], opts[optIndex]];
    setQuestionOptions(qIndex, opts);
  };

  const removeQuestion = (index: number) => {
    setQuestions((q) =>
      q.filter((_, i) => i !== index).map((item, i) => ({ ...item, orderIndex: i }))
    );
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    setQuestions((q) => {
      const copy = [...q];
      [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
      return copy.map((item, i) => ({ ...item, orderIndex: i }));
    });
  };

  const reorderQuestions = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setQuestions((q) => {
      const copy = [...q];
      const [removed] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, removed);
      return copy.map((item, idx) => ({ ...item, orderIndex: idx }));
    });
  };

  const reorderOptions = (qIndex: number, fromOpt: number, toOpt: number) => {
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
  };

  const validate = useMemo((): ValidationErrors => {
    const err: ValidationErrors = {};
    if (!title.trim()) err.title = "Título é obrigatório.";
    else if (title.trim().length < 3) err.title = "Título deve ter pelo menos 3 caracteres.";
    const questionErrors: Record<number, { text?: string; options?: string; scale?: string }> = {};
    questions.forEach((q, i) => {
      const labelKind = q.type === "section" ? "seção" : "pergunta";
      if (!q.text.trim()) {
        questionErrors[i] = {
          ...questionErrors[i],
          text: `Texto da ${labelKind} é obrigatório.`,
        };
      }
      if (q.type === "multiple_choice" || q.type === "dropdown" || q.type === "checkbox") {
        const opts = q.options ?? [];
        if (opts.every((o) => !o.trim())) {
          questionErrors[i] = { ...questionErrors[i], options: "Adicione ao menos uma opção." };
        }
      }
      if (q.type === "scale") {
        const min = q.scaleMin ?? DEFAULT_SCALE_MIN;
        const max = q.scaleMax ?? DEFAULT_SCALE_MAX;
        if (min >= max) {
          questionErrors[i] = { ...questionErrors[i], scale: "Mínimo deve ser menor que o máximo." };
        }
      }
    });
    const withText = questions.filter((q) => q.text.trim().length > 0);
    const answerableWithText = questions.filter(
      (q) => q.type !== "section" && q.text.trim().length > 0
    );
    if (withText.length === 0 && questions.length > 0) {
      err.submit = "Adicione ao menos uma pergunta ou seção com texto.";
    } else if (answerableWithText.length === 0 && questions.length > 0) {
      err.submit = "Inclua ao menos uma pergunta além de seções.";
    } else if (Object.keys(questionErrors).length > 0) {
      err.questions = questionErrors;
    }
    return err;
  }, [title, questions]);

  const runCreate = async (wantActive: boolean) => {
    setError(null);
    if (validate.title || validate.submit || (validate.questions && Object.keys(validate.questions).length > 0)) {
      setError("Corrija os erros antes de criar o formulário.");
      return;
    }
    setSaving(true);
    try {
      const valid = questions.filter((q) => q.text.trim().length > 0);
      const initialStatus: "draft" | "active" = wantActive ? "active" : "draft";
      const payload = {
        title: title.trim() || "Sem título",
        description: description.trim() || undefined,
        closingMessage: closingMessage.trim() || undefined,
        folderId: folderId ?? undefined,
        isTemplate,
        slug: slug.trim() || undefined,
        allowAnonymous,
        initialStatus,
        questions: valid.map((q, i) => {
          const opts =
            q.type === "multiple_choice" || q.type === "dropdown" || q.type === "checkbox"
              ? (q.options ?? []).filter((o) => o.trim().length > 0)
              : undefined;
          return {
            type: q.type,
            text: q.text.trim(),
            required: q.type === "section" ? false : q.required,
            orderIndex: i,
            options: opts?.length ? opts : undefined,
            scaleMin: q.type === "scale" ? (q.scaleMin ?? DEFAULT_SCALE_MIN) : undefined,
            scaleMax: q.type === "scale" ? (q.scaleMax ?? DEFAULT_SCALE_MAX) : undefined,
          };
        }),
      };
      const form = await api.createForm(payload, userId);
      toast(
        wantActive
          ? "Formulário criado e publicado. O link já aceita respostas."
          : "Formulário criado. Redirecionando para edição.",
        "success"
      );
      router.push(`/admin/forms/${form.id}/edit`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao criar formulário";
      setError(msg);
      toast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const canGoNext = step === 1 ? !validate.title : true;
  const slugPreview = slug.trim() ? getFullUrl(`/r/${slug.trim()}`) : null;

  return (
    <div>
      <nav className="mb-md flex items-center gap-2 text-small text-[var(--text-secondary)]" aria-label="Breadcrumb">
        <Link href="/admin/forms" className="hover:text-primary-600 dark:hover:text-primary-400">
          Formulários
        </Link>
        <span aria-hidden>/</span>
        <span className="text-[var(--text-primary)]">Novo</span>
      </nav>
      <h1 className="mb-lg text-h2 text-[var(--text-primary)]">Criar novo formulário</h1>

      <Card className="mb-lg max-w-2xl border-neutral-200 dark:border-neutral-700" padding="md">
        <p className="text-body text-[var(--text-primary)]">
          No passo <strong>Revisar</strong> você pode <strong>criar e publicar</strong> de uma vez ou marcar{" "}
          <strong>Já publicar como Ativo</strong>. Se criar só em rascunho, use na lista{" "}
          <strong>Tirar do rascunho e publicar</strong> ou em Editar{" "}
          <strong>Tirar do rascunho e publicar agora</strong> / status <strong>Ativo</strong> + Salvar.
        </p>
      </Card>

      <div className="mb-lg space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <ol className="flex flex-wrap items-center gap-2" aria-label="Etapas da criação">
            {([1, 2, 3] as const).map((s) => {
              const done = step > s;
              const current = step === s;
              return (
                <li key={s} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(s)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-small font-medium transition-colors ${
                      current
                        ? "bg-primary-600 text-white"
                        : done
                          ? "bg-green-100 text-green-900 dark:bg-green-900/35 dark:text-green-200"
                          : "bg-neutral-100 text-[var(--text-secondary)] hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-caption font-bold ${
                        current
                          ? "bg-white/20 text-white"
                          : done
                            ? "bg-green-600 text-white dark:bg-green-700"
                            : "bg-neutral-200 text-[var(--text-secondary)] dark:bg-neutral-600 dark:text-neutral-200"
                      }`}
                      aria-hidden
                    >
                      {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : s}
                    </span>
                    {STEP_LABELS[s]}
                  </button>
                  {s < 3 && (
                    <span className="hidden text-neutral-300 sm:inline dark:text-neutral-600" aria-hidden>
                      —
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
          <p
            role="status"
            className={`inline-flex max-w-md items-center rounded-lg border px-3 py-2 text-small font-medium ${
              step === 3 && publishAsActive
                ? "border-green-300 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200"
                : "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100"
            }`}
          >
            {step === 3 && publishAsActive
              ? "Ao criar: Ativo — link aceitará respostas."
              : "Falta publicar: ao criar ficará em rascunho até usar Tirar do rascunho e publicar ou marque “Já publicar como Ativo” / “Criar e publicar”."}
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void runCreate(publishAsActive);
        }}
      >
        {error && (
          <p className="mb-md rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-small text-error" role="alert">
            {error}
          </p>
        )}

        {step === 1 && (
          <Card className="max-w-2xl" padding="lg">
            <CardHeader>
              <CardTitle>Informações do formulário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-lg">
              <Input
                id="new-title"
                label="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, title: true }))}
                error={touched.title ? validate.title : undefined}
                required
                placeholder="Ex: Pesquisa de satisfação"
                className="text-[var(--text-primary)]"
              />
              <div>
                <label htmlFor="new-description" className="mb-1 block text-small font-medium text-[var(--text-primary)]">
                  Descrição
                </label>
                <textarea
                  id="new-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Opcional"
                  className="w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600"
                />
              </div>
              <div>
                <label
                  htmlFor="new-closing-message"
                  className="mb-1 block text-small font-medium text-[var(--text-primary)]"
                >
                  Mensagem ao finalizar (opcional)
                </label>
                <textarea
                  id="new-closing-message"
                  value={closingMessage}
                  onChange={(e) => setClosingMessage(e.target.value)}
                  rows={3}
                  placeholder="Ex.: Obrigado por participar. Em breve entraremos em contato."
                  className="w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600"
                />
                <p className="mt-1 text-caption text-[var(--text-secondary)]">
                  Exibida na tela de confirmação depois que o respondente envia o formulário.
                </p>
              </div>
              <Input
                id="new-slug"
                label="Link curto (opcional)"
                value={slug}
                onChange={(e) => setSlug(e.target.value.replaceAll(/[^a-z0-9-_]/gi, ""))}
                placeholder="ex: pesquisa-2025"
                hint="Link curto: /r/seu-slug. Somente letras, números, hífen e underscore."
                className="text-[var(--text-primary)]"
              />
              {slugPreview && (
                <p className="text-caption text-[var(--text-secondary)]">
                  Preview:{" "}
                  <a
                    href={slugPreview}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline dark:text-primary-400"
                  >
                    {slugPreview}
                  </a>
                </p>
              )}
              <div>
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="new-folder-id" className="block text-small font-medium text-[var(--text-primary)]">
                    Pasta (opcional)
                  </label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setNewFolderOpen(true)} leftIcon={<FolderPlus className="h-4 w-4" />}>
                    Nova pasta
                  </Button>
                </div>
                <select
                  id="new-folder-id"
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
                  Use pastas nomeadas na lista para evitar variações como &quot;2025&quot; e &quot;2025 &quot;.
                </p>
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  id="new-is-template"
                  type="checkbox"
                  checked={isTemplate}
                  onChange={(e) => setIsTemplate(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-body text-[var(--text-primary)]">
                  Marcar como modelo (aparece na lista para reutilizar via &quot;Usar modelo&quot;)
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  id="new-allow-anonymous"
                  type="checkbox"
                  checked={allowAnonymous}
                  onChange={(e) => setAllowAnonymous(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-body text-[var(--text-primary)]">Permitir respostas anônimas</span>
              </label>
            </CardContent>
            <div className="flex justify-end border-t border-neutral-200 pt-lg dark:border-neutral-700">
              <Button type="button" variant="secondary" onClick={() => setStep(2)} disabled={!canGoNext}>
                Próximo
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="max-w-2xl" padding="lg">
            <CardHeader>
              <CardTitle>Perguntas e seções</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-lg">
                {questions.map((q, i) => (
                  <li
                    key={q._localId ?? i}
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
                            onChange={(e) =>
                              updateQuestion(i, { type: e.target.value as QuestionRow["type"] })
                            }
                            className="mb-2 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] dark:border-neutral-600"
                          >
                            {QUESTION_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {TYPE_LABELS[t]}
                              </option>
                            ))}
                          </select>
                          <Input
                            id={`new-q-${q._localId}-text`}
                            placeholder={q.type === "section" ? "Título da seção" : "Texto da pergunta"}
                            value={q.text}
                            onChange={(e) => updateQuestion(i, { text: e.target.value })}
                            error={validate.questions?.[i]?.text}
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
                                    key={`opt-slot-${q._localId ?? i}-${oi}`}
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
                              {validate.questions?.[i]?.options && (
                                <p className="mt-1 text-small text-error">{validate.questions[i].options}</p>
                              )}
                            </div>
                          )}
                          {q.type === "scale" && (
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-2">
                                <label
                                  htmlFor={`scale-min-${q._localId ?? i}`}
                                  className="text-small text-[var(--text-secondary)]"
                                >
                                  Mín
                                </label>
                                <input
                                  id={`scale-min-${q._localId ?? i}`}
                                  type="number"
                                  value={q.scaleMin ?? DEFAULT_SCALE_MIN}
                                  onChange={(e) =>
                                    updateQuestion(i, {
                                      scaleMin: e.target.value === "" ? undefined : Number(e.target.value),
                                    })
                                  }
                                  className="w-20 rounded-lg border border-neutral-300 bg-[var(--background)] px-2 py-1.5 text-body dark:border-neutral-600"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <label
                                  htmlFor={`scale-max-${q._localId ?? i}`}
                                  className="text-small text-[var(--text-secondary)]"
                                >
                                  Máx
                                </label>
                                <input
                                  id={`scale-max-${q._localId ?? i}`}
                                  type="number"
                                  value={q.scaleMax ?? DEFAULT_SCALE_MAX}
                                  onChange={(e) =>
                                    updateQuestion(i, {
                                      scaleMax: e.target.value === "" ? undefined : Number(e.target.value),
                                    })
                                  }
                                  className="w-20 rounded-lg border border-neutral-300 bg-[var(--background)] px-2 py-1.5 text-body dark:border-neutral-600"
                                />
                              </div>
                              <span className="text-caption text-[var(--text-secondary)]">
                                Valor padrão: {DEFAULT_SCALE_MIN} a {DEFAULT_SCALE_MAX}
                              </span>
                              {validate.questions?.[i]?.scale && (
                                <p className="w-full text-small text-error">{validate.questions[i].scale}</p>
                              )}
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
            <div className="flex flex-col gap-2 border-t border-neutral-200 pt-lg dark:border-neutral-700 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={openRespondentPreview}
                  leftIcon={<Eye className="h-4 w-4" />}
                >
                  Ver como respondente
                </Button>
                <Button type="button" variant="primary" onClick={() => setStep(3)}>
                  Próximo
                </Button>
              </div>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="max-w-2xl" padding="lg">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <CardTitle>Revisar e criar</CardTitle>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={openRespondentPreview}
                  leftIcon={<Eye className="h-4 w-4" />}
                >
                  Ver como respondente
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-lg">
              <div className="rounded-lg border border-neutral-200 bg-neutral-50/80 p-md dark:border-neutral-700 dark:bg-neutral-900/40">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    id="new-publish-as-active"
                    type="checkbox"
                    checked={publishAsActive}
                    onChange={(e) => setPublishAsActive(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span>
                    <span className="block text-body font-medium text-[var(--text-primary)]">
                      Já publicar como Ativo
                    </span>
                    <span className="mt-0.5 block text-small text-[var(--text-secondary)]">
                      O link do formulário passará a aceitar respostas assim que for criado. Equivale a usar o botão
                      &quot;Criar e publicar&quot; abaixo.
                    </span>
                  </span>
                </label>
              </div>
              <dl className="space-y-2 text-body text-[var(--text-primary)]">
                <div>
                  <dt className="text-small font-medium text-[var(--text-secondary)]">Status ao criar</dt>
                  <dd>
                    {publishAsActive ? (
                      <span className="font-medium text-green-700 dark:text-green-400">Ativo (publicado)</span>
                    ) : (
                      <span>Rascunho</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-small font-medium text-[var(--text-secondary)]">Título</dt>
                  <dd>{title.trim() || "Sem título"}</dd>
                </div>
                {description.trim() && (
                  <div>
                    <dt className="text-small font-medium text-[var(--text-secondary)]">Descrição</dt>
                    <dd>{description}</dd>
                  </div>
                )}
                {closingMessage.trim() && (
                  <div>
                    <dt className="text-small font-medium text-[var(--text-secondary)]">
                      Mensagem ao finalizar
                    </dt>
                    <dd className="whitespace-pre-wrap">{closingMessage}</dd>
                  </div>
                )}
                {slug.trim() && (
                  <div>
                    <dt className="text-small font-medium text-[var(--text-secondary)]">Link curto</dt>
                    <dd>
                      <a
                        href={getFullUrl(`/r/${slug}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline dark:text-primary-400"
                      >
                        /r/{slug}
                      </a>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-small font-medium text-[var(--text-secondary)]">Respostas anônimas</dt>
                  <dd>{allowAnonymous ? "Sim" : "Não"}</dd>
                </div>
                {folderId && (
                  <div>
                    <dt className="text-small font-medium text-[var(--text-secondary)]">Pasta</dt>
                    <dd>{folders.find((f) => f.id === folderId)?.name ?? folderId}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-small font-medium text-[var(--text-secondary)]">Modelo</dt>
                  <dd>{isTemplate ? "Sim (reutilizável na lista)" : "Não"}</dd>
                </div>
                <div>
                  <dt className="mb-2 text-small font-medium text-[var(--text-secondary)]">Perguntas</dt>
                  <dd>
                    <ol className="list-inside list-decimal space-y-1">
                      {questions.filter((q) => q.text.trim()).map((q) => (
                        <li key={q._localId}>
                          {q.type === "section" ? (
                            <span className="font-medium text-primary-600 dark:text-primary-400">
                              Seção: {q.text.trim()}
                            </span>
                          ) : (
                            <>
                              {q.text.trim()}
                              <span className="ml-1 text-caption text-[var(--text-secondary)]">
                                ({TYPE_LABELS[q.type]}
                                {q.required ? ", obrigatória" : ""})
                              </span>
                            </>
                          )}
                        </li>
                      ))}
                    </ol>
                  </dd>
                </div>
              </dl>
            </CardContent>
            <div className="flex flex-col gap-md border-t border-neutral-200 pt-lg dark:border-neutral-700 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                Voltar
              </Button>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                <Link href="/admin/forms">
                  <Button type="button" variant="secondary" className="w-full sm:w-auto">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" variant="secondary" loading={saving} disabled={saving} className="w-full sm:w-auto">
                  {saving ? "Criando..." : "Criar formulário"}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  loading={saving}
                  disabled={saving}
                  className="w-full sm:w-auto"
                  onClick={() => void runCreate(true)}
                >
                  {saving ? "Criando..." : "Criar e publicar"}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </form>

      {previewOpen && previewForm !== null && (
        <Modal
          open
          onClose={closePreview}
          title="Ver como respondente"
          panelClassName="max-w-3xl"
          bodyClassName="max-h-[min(85vh,720px)] overflow-y-auto"
          footer={
            <Button type="button" variant="secondary" size="sm" onClick={closePreview}>
              Fechar
            </Button>
          }
        >
          <p className="mb-lg text-small text-[var(--text-secondary)]">
            Pré-visualização local: nada é salvo no servidor. Confira textos, ordem das perguntas e opções.
          </p>
          <div className="rounded-lg border border-dashed border-neutral-300 bg-[var(--surface)] p-md dark:border-neutral-600">
            <RespondFormView
              key={previewNonce}
              formId="__preview__"
              form={previewForm}
              preview
              onPreviewDone={closePreview}
            />
          </div>
        </Modal>
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
    </div>
  );
}
