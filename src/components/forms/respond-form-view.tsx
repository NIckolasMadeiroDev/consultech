"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { FormSubmitPausedError } from "@/lib/api";
import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const inputBaseClass =
  "h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none transition-colors duration-150 placeholder:text-neutral-400 focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 dark:border-neutral-600 dark:focus-visible:ring-offset-[var(--background)]";
const textareaClass =
  "mt-2 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2.5 text-body text-[var(--text-primary)] outline-none transition-colors duration-150 placeholder:text-neutral-400 focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 dark:border-neutral-600 dark:focus-visible:ring-offset-[var(--background)]";
const radioCheckClass =
  "h-4 w-4 shrink-0 rounded border-neutral-300 text-primary-600 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 dark:border-neutral-600 dark:focus-visible:ring-offset-[var(--background)]";

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

function draftStorageKey(formId: string) {
  return `consultech-form-draft:${formId}`;
}

type StoredDraft = {
  v: 1;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  answers: Record<string, AnswerValue>;
};

function isRequiredFilled(
  q: RespondFormQuestion,
  answers: Record<string, AnswerValue>
): boolean {
  const v = answers[q.id];
  switch (q.type) {
    case "short_text":
    case "long_text":
      return typeof v === "string" && v.trim() !== "";
    case "number":
      return typeof v === "number" && !Number.isNaN(v);
    case "date":
      return typeof v === "string" && v.trim() !== "";
    case "yes_no":
      return v === true || v === false;
    case "multiple_choice":
    case "dropdown":
      return typeof v === "string" && v.trim() !== "";
    case "checkbox":
      return Array.isArray(v) && v.length > 0;
    case "scale":
      return typeof v === "number" && !Number.isNaN(v);
    default:
      return true;
  }
}

function buildSectionBlocks(
  visibleQuestions: RespondFormQuestion[]
): { title: string; questions: RespondFormQuestion[] }[] {
  const blocks: { title: string; questions: RespondFormQuestion[] }[] = [];
  let pendingTitle = "Geral";
  const agg: RespondFormQuestion[] = [];
  for (const q of visibleQuestions) {
    if (q.type === "section") {
      if (agg.length > 0) {
        blocks.push({ title: pendingTitle, questions: [...agg] });
        agg.length = 0;
      }
      pendingTitle = q.text;
    } else {
      agg.push(q);
    }
  }
  if (agg.length > 0) {
    blocks.push({ title: pendingTitle, questions: agg });
  } else if (blocks.length === 0) {
    blocks.push({ title: pendingTitle, questions: [] });
  }
  return blocks;
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
  const [errTargetQuestionId, setErrTargetQuestionId] = useState<string | null>(null);
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

  const draftStateRef = useRef({
    name: "",
    email: "",
    employeeId: "",
    department: "",
    answers: {} as Record<string, AnswerValue>,
  });
  const [draftHydrated, setDraftHydrated] = useState(false);

  useEffect(() => {
    draftStateRef.current = { name, email, employeeId, department, answers };
  }, [name, email, employeeId, department, answers]);

  const progress = useMemo(() => {
    const blocks = buildSectionBlocks(visibleQuestions);
    const answerable = visibleQuestions.filter((q) => q.type !== "section");
    const requiredQs = answerable.filter((q) => q.required);
    const filled = requiredQs.filter((q) => isRequiredFilled(q, answers)).length;
    const totalReq = requiredQs.length;
    const pct = totalReq === 0 ? 100 : Math.min(100, Math.round((100 * filled) / totalReq));
    const allReq = visibleQuestions.filter((q) => q.type !== "section" && q.required);
    const allDone =
      allReq.length === 0 || allReq.every((q) => isRequiredFilled(q, answers));
    let currentIdx = 0;
    if (blocks.length > 0) {
      if (allDone) {
        currentIdx = blocks.length - 1;
      } else {
        const idx = blocks.findIndex((b) => {
          const req = b.questions.filter((q) => q.required);
          return req.length > 0 && req.some((q) => !isRequiredFilled(q, answers));
        });
        currentIdx = idx === -1 ? 0 : idx;
      }
    }
    const cur = blocks[currentIdx] ?? blocks[0];
    const sectionTitle = cur?.title ?? "Geral";
    return {
      filled,
      totalReq,
      pct,
      sectionTitle,
      sectionIndex: currentIdx + 1,
      sectionTotal: Math.max(1, blocks.length),
    };
  }, [visibleQuestions, answers]);

  useEffect(() => {
    if (preview) {
      setDraftHydrated(true);
      return;
    }
    try {
      const raw = localStorage.getItem(draftStorageKey(formId));
      if (raw) {
        const d = JSON.parse(raw) as StoredDraft;
        if (d?.v === 1 && d.answers && typeof d.answers === "object") {
          setAnswers(d.answers);
          if (!form.allowAnonymous) {
            setName(typeof d.name === "string" ? d.name : "");
            setEmail(typeof d.email === "string" ? d.email : "");
            setEmployeeId(typeof d.employeeId === "string" ? d.employeeId : "");
            setDepartment(typeof d.department === "string" ? d.department : "");
          }
        }
      }
    } catch {
    }
    setDraftHydrated(true);
  }, [formId, preview, form.allowAnonymous]);

  useEffect(() => {
    if (preview || !draftHydrated) return;
    const t = window.setTimeout(() => {
      try {
        const payload: StoredDraft = {
          v: 1,
          name,
          email,
          employeeId,
          department,
          answers,
        };
        localStorage.setItem(draftStorageKey(formId), JSON.stringify(payload));
      } catch {
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [name, email, employeeId, department, answers, formId, preview, draftHydrated]);

  const hasUnsubmittedContent =
    Object.keys(answers).length > 0 ||
    (!form.allowAnonymous &&
      [name, email, employeeId, department].some((x) => x.trim() !== ""));

  useEffect(() => {
    if (preview || submitted) return;
    const flushDraft = () => {
      try {
        const p = draftStateRef.current;
        const payload: StoredDraft = {
          v: 1,
          name: p.name,
          email: p.email,
          employeeId: p.employeeId,
          department: p.department,
          answers: p.answers,
        };
        localStorage.setItem(draftStorageKey(formId), JSON.stringify(payload));
      } catch {
      }
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasUnsubmittedContent) return;
      flushDraft();
      e.preventDefault();
      e.returnValue = "";
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flushDraft();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [preview, submitted, formId, hasUnsubmittedContent]);

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    setAnswers((prev) => {
      const current = (prev[questionId] as string[]) ?? [];
      const next = checked ? [...current, option] : current.filter((x) => x !== option);
      return { ...prev, [questionId]: next };
    });
    setErrTargetQuestionId((tid) => {
      if (tid === questionId) {
        setErr(null);
        return null;
      }
      return tid;
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
          setErrTargetQuestionId(q.id);
          globalThis.document.getElementById(`${q.id}-cb-0`)?.focus();
          return;
        }
      }
    }
    setErr(null);
    setErrTargetQuestionId(null);
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
      try {
        localStorage.removeItem(draftStorageKey(formId));
      } catch {
      }
    } catch (e) {
      setErrTargetQuestionId(null);
      if (e instanceof FormSubmitPausedError) {
        const custom = e.pausedMessage?.trim();
        setErr(
          custom && custom.length > 0
            ? custom
            : "Este formulário está pausado no momento."
        );
      } else {
        setErr(e instanceof Error ? e.message : "Erro ao enviar");
      }
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

      {draftHydrated && (
        <div className="mb-lg space-y-2" aria-live="polite">
          <div className="flex flex-col gap-1 text-small text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <span>
              {progress.totalReq === 0
                ? "Nenhuma pergunta obrigatória nesta etapa"
                : `Obrigatórias: ${progress.filled} de ${progress.totalReq}`}
            </span>
            <span className="truncate sm:max-w-[55%]" title={progress.sectionTitle}>
              Seção {progress.sectionIndex}/{progress.sectionTotal}: {progress.sectionTitle}
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700"
            role="progressbar"
            aria-valuenow={progress.totalReq === 0 ? 1 : progress.filled}
            aria-valuemin={0}
            aria-valuemax={progress.totalReq === 0 ? 1 : progress.totalReq}
            aria-label="Progresso das perguntas obrigatórias respondidas"
          >
            <div
              className="h-full rounded-full bg-primary-600 transition-[width] duration-300 ease-out"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
          {!preview && (
            <p className="text-small text-[var(--text-secondary)]">
              Rascunho salvo neste dispositivo. Ao sair ou fechar a aba, o navegador pode avisar se ainda não
              tiver enviado.
            </p>
          )}
        </div>
      )}

      <Card padding="lg" className="border-neutral-200 dark:border-neutral-700">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          aria-describedby={err ? "form-submit-error" : undefined}
        >
          {err && (
            <div
              id="form-submit-error"
              ref={submitErrorRef}
              tabIndex={-1}
              className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-small text-error outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[var(--background)]"
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

                      const fieldInvalid = Boolean(err && errTargetQuestionId === q.id);
                      const fieldErrorRef =
                        fieldInvalid && err ? "form-submit-error" : undefined;

                      return (
                        <fieldset
                          className="m-0 min-w-0 border-0 p-0"
                          aria-required={q.required}
                          aria-invalid={fieldInvalid}
                          aria-errormessage={fieldErrorRef}
                        >
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
                              aria-invalid={fieldInvalid}
                              aria-errormessage={fieldErrorRef}
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
                              aria-invalid={fieldInvalid}
                              aria-errormessage={fieldErrorRef}
                            />
                          )}
                          {q.type === "yes_no" && (
                            <div
                              className="mt-2 flex flex-wrap gap-4"
                              role="radiogroup"
                              aria-labelledby={legendId}
                              aria-required={q.required}
                            >
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
                              aria-invalid={fieldInvalid}
                              aria-errormessage={fieldErrorRef}
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
                              aria-invalid={fieldInvalid}
                              aria-errormessage={fieldErrorRef}
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
                                className="w-full rounded-md accent-primary-600 outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[var(--background)]"
                                required={q.required}
                                aria-labelledby={legendId}
                                aria-valuemin={q.scaleMin ?? 0}
                                aria-valuemax={q.scaleMax ?? 5}
                                aria-valuenow={(answers[q.id] as number) ?? (q.scaleMin ?? 0)}
                                aria-valuetext={`Valor ${(answers[q.id] as number) ?? (q.scaleMin ?? 0)} na escala de ${q.scaleMin ?? 0} a ${q.scaleMax ?? 5}`}
                                aria-invalid={fieldInvalid}
                                aria-errormessage={fieldErrorRef}
                              />
                              <span className="mt-1 block text-small text-[var(--text-secondary)]" aria-hidden="true">
                                {(answers[q.id] as number) ?? (q.scaleMin ?? 0)}
                              </span>
                            </div>
                          )}
                          {q.type === "multiple_choice" && (
                            <div
                              className="mt-2 space-y-2"
                              role="radiogroup"
                              aria-labelledby={legendId}
                              aria-required={q.required}
                            >
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
                              aria-invalid={fieldInvalid}
                              aria-errormessage={fieldErrorRef}
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
                            <div className="mt-2 space-y-2" role="group" aria-labelledby={legendId}>
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
