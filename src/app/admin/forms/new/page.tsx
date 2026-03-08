"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import Link from "next/link";
import * as api from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/contexts/toast-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

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

export default function NewFormPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const userId = user?.id ?? "anonymous";
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [questions, setQuestions] = useState<QuestionRow[]>([
    { type: "short_text", text: "", required: false, orderIndex: 0, _localId: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const addQuestion = () => {
    const nextIndex = questions.length;
    setQuestions((q) => [
      ...q,
      {
        type: "short_text",
        text: "",
        required: false,
        orderIndex: nextIndex,
        _localId: nextIndex,
      },
    ]);
  };

  const updateQuestion = (index: number, patch: Partial<QuestionRow>) => {
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

  const validate = useMemo((): ValidationErrors => {
    const err: ValidationErrors = {};
    if (!title.trim()) err.title = "Título é obrigatório.";
    else if (title.trim().length < 3) err.title = "Título deve ter pelo menos 3 caracteres.";
    const questionErrors: Record<number, { text?: string; options?: string; scale?: string }> = {};
    questions.forEach((q, i) => {
      if (!q.text.trim()) {
        questionErrors[i] = { ...questionErrors[i], text: "Texto da pergunta é obrigatório." };
      }
      if (q.type === "multiple_choice" || q.type === "checkbox") {
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
    if (withText.length === 0 && questions.length > 0) {
      err.submit = "Adicione ao menos uma pergunta com texto.";
    } else if (Object.keys(questionErrors).length > 0) {
      err.questions = questionErrors;
    }
    return err;
  }, [title, questions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (validate.title || validate.submit || (validate.questions && Object.keys(validate.questions).length > 0)) {
      setError("Corrija os erros antes de criar o formulário.");
      return;
    }
    setSaving(true);
    try {
      const valid = questions.filter((q) => q.text.trim().length > 0);
      const payload = {
        title: title.trim() || "Sem título",
        description: description.trim() || undefined,
        slug: slug.trim() || undefined,
        allowAnonymous,
        questions: valid.map((q, i) => {
          const opts = (q.type === "multiple_choice" || q.type === "checkbox")
            ? (q.options ?? []).filter((o) => o.trim().length > 0)
            : undefined;
          return {
            type: q.type,
            text: q.text.trim(),
            required: q.required,
            orderIndex: i,
            options: opts?.length ? opts : undefined,
            scaleMin: q.type === "scale" ? (q.scaleMin ?? DEFAULT_SCALE_MIN) : undefined,
            scaleMax: q.type === "scale" ? (q.scaleMax ?? DEFAULT_SCALE_MAX) : undefined,
          };
        }),
      };
      const form = await api.createForm(payload, userId);
      toast("Formulário criado. Redirecionando para edição.", "success");
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

      <div className="mb-lg flex gap-2">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(s)}
            className={`rounded-lg px-3 py-1.5 text-small font-medium ${
              step === s
                ? "bg-primary-600 text-white"
                : "bg-neutral-100 text-[var(--text-secondary)] hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            }`}
          >
            {STEP_LABELS[s]}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
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
                  <li key={q._localId ?? i}>
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
                            placeholder="Texto da pergunta"
                            value={q.text}
                            onChange={(e) => updateQuestion(i, { text: e.target.value })}
                            error={validate.questions?.[i]?.text}
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
                                  <li key={`opt-${q._localId ?? i}-${opt}-${oi}`} className="flex gap-2">
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
                              {validate.questions?.[i]?.options && (
                                <p className="mt-1 text-small text-error">{validate.questions[i].options}</p>
                              )}
                            </div>
                          )}
                          {q.type === "scale" && (
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-2">
                                <label htmlFor={`scale-min-${i}`} className="text-small text-[var(--text-secondary)]">
                                  Mín
                                </label>
                                <input
                                  id={`scale-min-${i}`}
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
                                <label htmlFor={`scale-max-${i}`} className="text-small text-[var(--text-secondary)]">
                                  Máx
                                </label>
                                <input
                                  id={`scale-max-${i}`}
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
            </CardContent>
            <div className="flex justify-between border-t border-neutral-200 pt-lg dark:border-neutral-700">
              <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button type="button" variant="primary" onClick={() => setStep(3)}>
                Próximo
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="max-w-2xl" padding="lg">
            <CardHeader>
              <CardTitle>Revisar e criar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-lg">
              <dl className="space-y-2 text-body text-[var(--text-primary)]">
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
                <div>
                  <dt className="mb-2 text-small font-medium text-[var(--text-secondary)]">Perguntas</dt>
                  <dd>
                    <ol className="list-inside list-decimal space-y-1">
                      {questions.filter((q) => q.text.trim()).map((q) => (
                        <li key={q._localId}>
                          {q.text.trim()}
                          <span className="ml-1 text-caption text-[var(--text-secondary)]">
                            ({TYPE_LABELS[q.type]}{q.required ? ", obrigatória" : ""})
                          </span>
                        </li>
                      ))}
                    </ol>
                  </dd>
                </div>
              </dl>
            </CardContent>
            <div className="flex justify-between border-t border-neutral-200 pt-lg dark:border-neutral-700">
              <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                Voltar
              </Button>
              <div className="flex gap-2">
                <Link href="/admin/forms">
                  <Button type="button" variant="secondary">
                    Cancelar
                  </Button>
                </Link>
                <Button type="submit" loading={saving} disabled={saving}>
                  {saving ? "Criando..." : "Criar formulário"}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </form>
    </div>
  );
}
