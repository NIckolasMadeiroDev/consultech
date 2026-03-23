"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const inputBaseClass =
  "h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none transition-colors duration-150 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600";
const textareaClass =
  "mt-2 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2.5 text-body text-[var(--text-primary)] outline-none transition-colors duration-150 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600";
const radioCheckClass =
  "h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-neutral-600";

export type AnswerValue = string | number | boolean | string[];

export type RespondFormQuestion = {
  id: string;
  type: string;
  text: string;
  required: boolean;
  orderIndex: number;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  conditionQuestionId?: string;
  conditionOperator?: string;
  conditionValue?: unknown;
};

export function isQuestionVisible(
  q: RespondFormQuestion,
  answers: Record<string, AnswerValue>
): boolean {
  if (!q.conditionQuestionId) return true;
  const ref = answers[q.conditionQuestionId];
  const target = q.conditionValue;
  const op = q.conditionOperator ?? "eq";
  if (op === "eq") return ref === target;
  if (op === "neq") return ref !== target;
  if (op === "contains") {
    if (Array.isArray(ref)) return ref.includes(target as string);
    if (typeof ref === "string") return ref.includes(String(target));
    return false;
  }
  return true;
}

export function RespondFormView({
  formId,
  form,
  preview = false,
  onPreviewDone,
}: {
  readonly formId: string;
  readonly form: {
    title: string;
    description?: string;
    closingMessage?: string;
    allowAnonymous?: boolean;
    questions: RespondFormQuestion[];
  };
  readonly preview?: boolean;
  readonly onPreviewDone?: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const submitErrorRef = useRef<HTMLDivElement>(null);

  const sortedQuestions = useMemo(
    () => [...(form.questions ?? [])].sort((a, b) => a.orderIndex - b.orderIndex),
    [form.questions]
  );
  const visibleQuestions = useMemo(
    () => sortedQuestions.filter((q) => isQuestionVisible(q, answers)),
    [sortedQuestions, answers]
  );

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) ?? [];
      const next = checked ? [...current, option] : current.filter((x) => x !== option);
      return { ...prev, [questionId]: next };
    });
  };

  const handleMultipleChoiceSelect = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    if (!formEl.checkValidity()) {
      formEl.reportValidity();
      return;
    }
    for (const q of visibleQuestions) {
      if (q.type === "section") continue;
      if (q.type === "checkbox" && q.required) {
        const v = (answers[q.id] as string[]) ?? [];
        if (v.length === 0) {
          setErr("Marque ao menos uma opção em cada pergunta obrigatória de múltipla escolha (caixas).");
          globalThis.document.getElementById(`${q.id}-cb-0`)?.focus();
          return;
        }
      }
    }
    setErr(null);
    if (preview) {
      setSending(true);
      await new Promise((r) => setTimeout(r, 0));
      setSubmitted(true);
      setSending(false);
      return;
    }
    setSending(true);
    try {
      const { submitResponse } = await import("@/lib/api");
      const answerable = visibleQuestions.filter((q) => q.type !== "section");
      const payload: {
        formId: string;
        respondent?: { name: string; email: string; employeeId?: string; department?: string };
        answers: Array<{ questionId: string; value: AnswerValue }>;
      } = {
        formId,
        answers: answerable.map((q) => ({
          questionId: q.id,
          value: answers[q.id] ?? (q.type === "yes_no" ? false : ""),
        })),
      };
      if (!form.allowAnonymous) {
        payload.respondent = {
          name,
          email,
          employeeId: employeeId || undefined,
          department: department || undefined,
        };
      }
      await submitResponse(payload);
      setSubmitted(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao enviar");
      queueMicrotask(() => {
        submitErrorRef.current?.focus();
        submitErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg">
        <Card
          padding="lg"
          className="border-green-200 bg-green-50 text-center dark:border-green-800 dark:bg-green-950/40"
        >
          <div className="flex justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" aria-hidden />
            </span>
          </div>
          <p className="mt-4 text-body-lg font-medium text-[var(--text-primary)]">Obrigado!</p>
          <p className="mt-2 whitespace-pre-wrap text-body text-[var(--text-primary)]">
            {form.closingMessage?.trim()
              ? form.closingMessage.trim()
              : "Sua resposta foi registrada."}
          </p>
          {preview && (
            <p className="mt-3 rounded-lg border border-primary-200 bg-primary-50/80 px-3 py-2 text-small text-[var(--text-primary)] dark:border-primary-800 dark:bg-primary-950/40">
              Pré-visualização: nenhum dado foi enviado ao servidor.
            </p>
          )}
          <p className="mt-3 text-small text-[var(--text-secondary)]">
            {preview ? "Feche a janela de pré-visualização para voltar à edição." : "Você pode fechar esta página ou voltar ao início."}
          </p>
          {preview && onPreviewDone && (
            <div className="mt-6">
              <Button type="button" variant="primary" onClick={onPreviewDone}>
                Fechar pré-visualização
              </Button>
            </div>
          )}
          {!preview && (
            <Link href="/" className="mt-6 inline-block">
              <Button variant="primary">Voltar ao início</Button>
            </Link>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <header className="mb-lg sm:mb-xl">
        <h1 className="text-h2 font-semibold text-[var(--text-primary)] sm:text-h1">
          {form.title}
        </h1>
        {form.description && (
          <p className="mt-2 text-body text-[var(--text-secondary)]">{form.description}</p>
        )}
      </header>

      <Card padding="lg" className="border-neutral-200 dark:border-neutral-700">
        <form onSubmit={handleSubmit} className="space-y-6">
          {err && (
            <div
              ref={submitErrorRef}
              tabIndex={-1}
              className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-small text-error outline-none focus:ring-2 focus:ring-error/40"
              role="alert"
              aria-live="assertive"
            >
              {err}
            </div>
          )}

          {!form.allowAnonymous && (
            <section aria-labelledby="respondent-fields-heading">
              <h2 id="respondent-fields-heading" className="mb-lg text-h4 text-[var(--text-primary)]">
                Seus dados
              </h2>
              <div className="grid gap-4 sm:grid-cols-1">
                <Input
                  id="respondent-name"
                  type="text"
                  label="Nome"
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
                <Input
                  id="respondent-email"
                  type="email"
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
                <Input
                  id="respondent-employeeId"
                  type="text"
                  label="Matrícula"
                  placeholder="Matrícula (opcional)"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  autoComplete="off"
                />
                <Input
                  id="respondent-department"
                  type="text"
                  label="Departamento"
                  placeholder="Departamento (opcional)"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  autoComplete="organization-title"
                />
              </div>
            </section>
          )}

          <section aria-labelledby="form-questions-heading">
            <h2 id="form-questions-heading" className="mb-lg text-h4 text-[var(--text-primary)]">
              Perguntas
            </h2>
            <ul className="space-y-4">
              {visibleQuestions.map((q) =>
                q.type === "section" ? (
                  <li key={q.id} className="border-b border-neutral-200 pb-2 pt-4 first:pt-0 dark:border-neutral-700">
                    <h3
                      id={`section-heading-${q.id}`}
                      className="text-h4 font-semibold text-primary-600 dark:text-primary-400"
                    >
                      {q.text}
                    </h3>
                  </li>
                ) : (
                  <li
                    key={q.id}
                    className="rounded-lg border border-neutral-200 bg-[var(--surface)] p-lg transition-colors duration-150 dark:border-neutral-700"
                  >
                    {(() => {
                      const legendId = `q-legend-${q.id}`;
                      const requiredSuffix = q.required ? (
                        <>
                          <span aria-hidden="true"> *</span>
                          <span className="sr-only"> (obrigatório)</span>
                        </>
                      ) : null;
                      const legend = (
                        <legend
                          id={legendId}
                          className="mb-0 block w-full px-0 text-small font-medium text-[var(--text-primary)]"
                        >
                          {q.text}
                          {requiredSuffix}
                        </legend>
                      );

                      return (
                        <fieldset className="m-0 min-w-0 border-0 p-0" aria-required={q.required}>
                          {legend}

                          {q.type === "short_text" && (
                            <input
                              type="text"
                              id={`answer-${q.id}`}
                              value={(answers[q.id] as string) ?? ""}
                              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                              className={`mt-2 ${inputBaseClass}`}
                              required={q.required}
                              aria-labelledby={legendId}
                              aria-required={q.required}
                            />
                          )}
                          {q.type === "long_text" && (
                            <textarea
                              id={`answer-${q.id}`}
                              value={(answers[q.id] as string) ?? ""}
                              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                              className={textareaClass}
                              rows={3}
                              required={q.required}
                              aria-labelledby={legendId}
                              aria-required={q.required}
                            />
                          )}
                          {q.type === "yes_no" && (
                            <div className="mt-2 flex flex-wrap gap-4">
                              <label className="flex cursor-pointer items-center gap-2 text-body text-[var(--text-primary)]">
                                <input
                                  type="radio"
                                  id={`${q.id}-yes`}
                                  name={q.id}
                                  checked={answers[q.id] === true}
                                  onChange={() => setAnswers((a) => ({ ...a, [q.id]: true }))}
                                  className={radioCheckClass}
                                  required={q.required}
                                  value="yes"
                                />
                                <span>Sim</span>
                              </label>
                              <label className="flex cursor-pointer items-center gap-2 text-body text-[var(--text-primary)]">
                                <input
                                  type="radio"
                                  id={`${q.id}-no`}
                                  name={q.id}
                                  checked={answers[q.id] === false}
                                  onChange={() => setAnswers((a) => ({ ...a, [q.id]: false }))}
                                  className={radioCheckClass}
                                  value="no"
                                />
                                <span>Não</span>
                              </label>
                            </div>
                          )}
                          {q.type === "number" && (
                            <input
                              type="number"
                              id={`answer-${q.id}`}
                              value={(answers[q.id] as number) ?? ""}
                              onChange={(e) =>
                                setAnswers((a) => ({
                                  ...a,
                                  [q.id]: e.target.value ? Number(e.target.value) : "",
                                }))
                              }
                              className={`mt-2 ${inputBaseClass}`}
                              required={q.required}
                              aria-labelledby={legendId}
                              aria-required={q.required}
                            />
                          )}
                          {q.type === "date" && (
                            <input
                              type="date"
                              id={`answer-${q.id}`}
                              value={(answers[q.id] as string) ?? ""}
                              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                              className={`mt-2 ${inputBaseClass}`}
                              required={q.required}
                              aria-labelledby={legendId}
                              aria-required={q.required}
                            />
                          )}
                          {q.type === "scale" && (
                            <div className="mt-2">
                              <input
                                type="range"
                                id={`answer-${q.id}`}
                                min={q.scaleMin ?? 0}
                                max={q.scaleMax ?? 5}
                                value={(answers[q.id] as number) ?? (q.scaleMin ?? 0)}
                                onChange={(e) =>
                                  setAnswers((a) => ({ ...a, [q.id]: Number(e.target.value) }))
                                }
                                className="w-full accent-primary-600"
                                required={q.required}
                                aria-labelledby={legendId}
                                aria-valuemin={q.scaleMin ?? 0}
                                aria-valuemax={q.scaleMax ?? 5}
                                aria-valuenow={(answers[q.id] as number) ?? (q.scaleMin ?? 0)}
                                aria-valuetext={`Valor ${(answers[q.id] as number) ?? (q.scaleMin ?? 0)} na escala de ${q.scaleMin ?? 0} a ${q.scaleMax ?? 5}`}
                                aria-required={q.required}
                              />
                              <span className="mt-1 block text-small text-[var(--text-secondary)]" aria-hidden="true">
                                {(answers[q.id] as number) ?? (q.scaleMin ?? 0)}
                              </span>
                            </div>
                          )}
                          {q.type === "multiple_choice" && (
                            <div className="mt-2 space-y-2">
                              {(q.options ?? []).map((opt, oi) => (
                                <label
                                  key={`${q.id}-mc-${oi}`}
                                  className="flex cursor-pointer items-center gap-2 text-body text-[var(--text-primary)]"
                                  htmlFor={`${q.id}-opt-${oi}`}
                                >
                                  <input
                                    type="radio"
                                    id={`${q.id}-opt-${oi}`}
                                    name={q.id}
                                    value={opt}
                                    checked={answers[q.id] === opt}
                                    onChange={() => handleMultipleChoiceSelect(q.id, opt)}
                                    className={radioCheckClass}
                                    required={q.required && oi === 0}
                                  />
                                  {opt}
                                </label>
                              ))}
                            </div>
                          )}
                          {q.type === "dropdown" && (
                            <select
                              id={`answer-${q.id}`}
                              className={`mt-2 ${inputBaseClass}`}
                              value={(answers[q.id] as string) ?? ""}
                              onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                              required={q.required}
                              aria-labelledby={legendId}
                              aria-required={q.required}
                            >
                              <option value="">Selecione…</option>
                              {(q.options ?? []).map((opt, oi) => (
                                <option key={`${q.id}-d-${oi}`} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          )}
                          {q.type === "checkbox" && (
                            <div className="mt-2 space-y-2">
                              {(q.options ?? []).map((opt, oi) => (
                                <div key={`${q.id}-cb-${oi}`} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id={`${q.id}-cb-${oi}`}
                                    checked={((answers[q.id] as string[]) ?? []).includes(opt)}
                                    onChange={(e) => handleCheckboxChange(q.id, opt, e.target.checked)}
                                    className={radioCheckClass}
                                  />
                                  <label htmlFor={`${q.id}-cb-${oi}`} className="cursor-pointer text-body text-[var(--text-primary)]">
                                    {opt}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </fieldset>
                      );
                    })()}
                  </li>
                )
              )}
            </ul>
          </section>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={sending}
            disabled={sending}
          >
            {preview ? "Simular envio" : sending ? "Enviando..." : "Enviar resposta"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
