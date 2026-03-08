"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import * as api from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ChevronLeft, ChevronRight, Plus, Trash2, HelpCircle } from "lucide-react";

const QUESTION_TYPES = [
  "short_text",
  "long_text",
  "multiple_choice",
  "checkbox",
  "scale",
  "yes_no",
  "date",
  "number",
] as const;

const TYPE_LABELS: Record<(typeof QUESTION_TYPES)[number], string> = {
  short_text: "Texto curto",
  long_text: "Texto longo",
  multiple_choice: "Múltipla escolha",
  checkbox: "Checkbox",
  scale: "Escala",
  yes_no: "Sim/Não",
  date: "Data",
  number: "Número",
};

const STATUS_HINTS: Record<string, string> = {
  draft: "Só você vê. Não aceita respostas.",
  active: "Aceita respostas. Link visível para respondentes.",
  paused: "Não aceita respostas. Pode reativar depois.",
  archived: "Só leitura. Não aceita respostas nem edição de conteúdo.",
};

type QuestionRow = {
  id?: string;
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

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.fetchForm(id).then((form) => {
        setTitle(form.title);
        setDescription(form.description ?? "");
        setStatus(form.status);
        setSlug(form.slug ?? "");
        setAllowAnonymous(form.allowAnonymous ?? false);
        setQuestions(
          (form.questions ?? []).map((q: QuestionRow & { id: string }) => ({
            id: q.id,
            type: q.type,
            text: q.text,
            required: q.required,
            orderIndex: q.orderIndex,
            options: q.options ?? undefined,
            scaleMin: q.scaleMin,
            scaleMax: q.scaleMax,
          }))
        );
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

  const updateQuestion = useCallback((index: number, patch: Partial<QuestionRow>) => {
    setQuestions((q) =>
      q.map((item, i) => {
        if (i !== index) return item;
        const next = { ...item, ...patch };
        if (
          (patch.type === "multiple_choice" || patch.type === "checkbox") &&
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
  }, [setQuestionOptions]);

  const addQuestion = useCallback(() => {
    setQuestions((q) => [
      ...q,
      {
        type: "short_text",
        text: "",
        required: false,
        orderIndex: q.length,
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
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    setQuestions((q) => {
      const copy = [...q];
      [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
      return copy.map((item, i) => ({ ...item, orderIndex: i }));
    });
  }, [questions.length]);

  const handleSubmit = useCallback(
    async (saveAndReturn: boolean) => {
      setError(null);
      setSaving(true);
      try {
        await api.updateForm(
          id,
          {
            title: title.trim() || "Sem título",
            description: description.trim() || undefined,
            status: status as "draft" | "active" | "archived" | "paused",
            slug: slug.trim() || null,
            allowAnonymous,
            questions: questions.map((q, i) => ({
              ...(q.id && { id: q.id }),
              type: q.type,
              text: q.text.trim(),
              required: q.required,
              orderIndex: i,
              options: (q.type === "multiple_choice" || q.type === "checkbox")
                ? (q.options ?? []).filter((o) => o.trim().length > 0)
                : undefined,
              scaleMin: q.type === "scale" ? (q.scaleMin ?? DEFAULT_SCALE_MIN) : undefined,
              scaleMax: q.type === "scale" ? (q.scaleMax ?? DEFAULT_SCALE_MAX) : undefined,
            })),
          },
          userId
        );
        toast("Formulário salvo.", "success");
        if (saveAndReturn) router.push("/admin/forms");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao salvar");
      } finally {
        setSaving(false);
      }
    },
    [id, title, description, status, slug, allowAnonymous, questions, userId, toast, router]
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

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(false);
        }}
        className="space-y-lg"
      >
        {error && (
          <p className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-small text-error" role="alert">
            {error}
          </p>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Perguntas</CardTitle>
            <Button type="button" variant="secondary" size="sm" onClick={addQuestion}>
              <Plus className="h-4 w-4" aria-hidden />
              Adicionar pergunta
            </Button>
          </CardHeader>
          <CardContent>
            <ul className="space-y-lg">
              {questions.map((q, i) => (
                <li key={q.id ?? `new-${i}`}>
                  <Card padding="md" className="border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-start gap-2">
                      <div className="flex flex-col gap-0.5 pt-1">
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
                            Pergunta {i + 1} · {TYPE_LABELS[q.type]}
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
                          placeholder="Texto da pergunta"
                          value={q.text}
                          onChange={(e) => updateQuestion(i, { text: e.target.value })}
                          className="text-[var(--text-primary)]"
                        />
                        <label className="mt-2 flex cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={q.required}
                            onChange={(e) => updateQuestion(i, { required: e.target.checked })}
                            className="h-4 w-4 rounded border-neutral-300 text-primary-600"
                          />
                          <span className="text-small text-[var(--text-primary)]">Obrigatória</span>
                        </label>
                        {(q.type === "multiple_choice" || q.type === "checkbox") && (
                          <div className="mt-3">
                            <span className="mb-1 block text-small font-medium text-[var(--text-primary)]">
                              Opções
                            </span>
                            <ul className="space-y-2">
                              {(q.options ?? []).map((opt, oi) => (
                                <li key={`${q.id ?? i}-opt-${oi}`} className="flex gap-2">
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => updateOption(i, oi, e.target.value)}
                                    placeholder={`Opção ${oi + 1}`}
                                    className="flex-1 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-1.5 text-body text-[var(--text-primary)] dark:border-neutral-600"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOption(i, oi)}
                                    aria-label="Remover opção"
                                    className="text-error"
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
                              <label htmlFor={`scale-min-${i}`} className="text-small text-[var(--text-secondary)]">Mín</label>
                              <input
                                id={`scale-min-${i}`}
                                type="number"
                                value={q.scaleMin ?? DEFAULT_SCALE_MIN}
                                onChange={(e) => updateQuestion(i, { scaleMin: e.target.value === "" ? undefined : Number(e.target.value) })}
                                className="w-20 rounded-lg border border-neutral-300 bg-[var(--background)] px-2 py-1.5 text-body dark:border-neutral-600"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <label htmlFor={`scale-max-${i}`} className="text-small text-[var(--text-secondary)]">Máx</label>
                              <input
                                id={`scale-max-${i}`}
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
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" loading={saving} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleSubmit(true)}
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
