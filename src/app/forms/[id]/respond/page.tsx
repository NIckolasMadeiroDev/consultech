"use client";

import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import { useForm } from "@/hooks/useForm";
import Link from "next/link";
import { ChevronLeft, CheckCircle } from "lucide-react";
import { ThemeToggle } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const inputBaseClass =
  "h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none transition-colors duration-150 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600";
const textareaClass =
  "mt-2 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2.5 text-body text-[var(--text-primary)] outline-none transition-colors duration-150 placeholder:text-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600";
const radioCheckClass =
  "h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-neutral-600";

type AnswerValue = string | number | boolean | string[];

type QuestionWithCondition = {
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

function isQuestionVisible(
  q: QuestionWithCondition,
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

export default function RespondFormPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: form, loading, error } = useForm(id);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col bg-[var(--background)]">
        <header className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-3 sm:px-6 dark:border-neutral-700">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-small text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Voltar
          </Link>
          <ThemeToggle />
        </header>
        <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
          <p className="text-body text-[var(--text-secondary)]">Carregando...</p>
        </div>
      </main>
    );
  }
  if (error || !form) {
    return (
      <main className="flex min-h-screen flex-col bg-[var(--background)]">
        <header className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-3 sm:px-6 dark:border-neutral-700">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-small text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Voltar
          </Link>
          <ThemeToggle />
        </header>
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center p-4 sm:p-6">
          <Card className="w-full text-center" padding="lg">
            <p className="text-body text-[var(--text-secondary)]" role="alert">
              {error ?? "Formulário não encontrado."}
            </p>
            <Link href="/" className="mt-6 inline-block">
              <Button variant="primary">Voltar ao início</Button>
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  if (form.status !== "active") {
    return (
      <main className="flex min-h-screen flex-col bg-[var(--background)]">
        <header className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-3 sm:px-6 dark:border-neutral-700">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-small text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Voltar
          </Link>
          <ThemeToggle />
        </header>
        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center p-4 sm:p-6">
          <Card className="w-full text-center" padding="lg">
            <p className="text-body text-[var(--text-secondary)]">
              Este formulário não está disponível para respostas no momento.
            </p>
            <Link href="/" className="mt-6 inline-block">
              <Button variant="primary">Voltar ao início</Button>
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-neutral-200 bg-[var(--background)]/95 px-4 py-3 backdrop-blur sm:px-6 dark:border-neutral-700">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-small font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Voltar ao início
        </Link>
        <ThemeToggle />
      </header>
      <div className="mx-auto max-w-content px-4 py-6 sm:px-6 sm:py-8 md:px-8">
        <RespondFormView formId={form.id} form={form} />
      </div>
    </main>
  );
}

function RespondFormView({
  formId,
  form,
}: {
  readonly formId: string;
  readonly form: {
    title: string;
    description?: string;
    allowAnonymous?: boolean;
    questions: QuestionWithCondition[];
  };
}) {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSending(true);
    try {
      const { submitResponse } = await import("@/lib/api");
      const payload: {
        formId: string;
        respondent?: { name: string; email: string; employeeId?: string; department?: string };
        answers: Array<{ questionId: string; value: AnswerValue }>;
      } = {
        formId,
        answers: visibleQuestions.map((q) => ({
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
          <p className="mt-4 text-body-lg font-medium text-[var(--text-primary)]">
            Obrigado! Sua resposta foi registrada.
          </p>
          <p className="mt-1 text-small text-[var(--text-secondary)]">
            Você pode fechar esta página ou voltar ao início.
          </p>
          <Link href="/" className="mt-6 inline-block">
            <Button variant="primary">Voltar ao início</Button>
          </Link>
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
            <p
              className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-small text-error"
              role="alert"
            >
              {err}
            </p>
          )}

          {!form.allowAnonymous && (
            <section>
              <h2 className="mb-lg text-h4 text-[var(--text-primary)]">Seus dados</h2>
              <div className="grid gap-4 sm:grid-cols-1">
                <Input
                  id="respondent-name"
                  type="text"
                  label="Nome"
                  placeholder="Nome *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  id="respondent-email"
                  type="email"
                  label="E-mail"
                  placeholder="E-mail *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  id="respondent-employeeId"
                  type="text"
                  label="Matrícula"
                  placeholder="Matrícula"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
                <Input
                  id="respondent-department"
                  type="text"
                  label="Departamento"
                  placeholder="Departamento"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-lg text-h4 text-[var(--text-primary)]">Perguntas</h2>
            <ul className="space-y-4">
              {visibleQuestions.map((q) => (
                <li
                  key={q.id}
                  className="rounded-lg border border-neutral-200 bg-[var(--surface)] p-lg transition-colors duration-150 dark:border-neutral-700"
                >
                  <label className="block text-small font-medium text-[var(--text-primary)]">
                    {q.text}
                    {q.required && " *"}
                  </label>

                  {q.type === "short_text" && (
                    <input
                      type="text"
                      value={(answers[q.id] as string) ?? ""}
                      onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                      className={`mt-2 ${inputBaseClass}`}
                      required={q.required}
                    />
                  )}
                  {q.type === "long_text" && (
                    <textarea
                      value={(answers[q.id] as string) ?? ""}
                      onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                      className={textareaClass}
                      rows={3}
                      required={q.required}
                    />
                  )}
                  {q.type === "yes_no" && (
                    <div className="mt-2 flex flex-wrap gap-4">
                      <label className="flex cursor-pointer items-center gap-2 text-body text-[var(--text-primary)]">
                        <input
                          type="radio"
                          name={q.id}
                          checked={answers[q.id] === true}
                          onChange={() => setAnswers((a) => ({ ...a, [q.id]: true }))}
                          className={radioCheckClass}
                        />
                        <span>Sim</span>
                      </label>
                      <label className="flex cursor-pointer items-center gap-2 text-body text-[var(--text-primary)]">
                        <input
                          type="radio"
                          name={q.id}
                          checked={answers[q.id] === false}
                          onChange={() => setAnswers((a) => ({ ...a, [q.id]: false }))}
                          className={radioCheckClass}
                        />
                        <span>Não</span>
                      </label>
                    </div>
                  )}
                  {q.type === "number" && (
                    <input
                      type="number"
                      value={(answers[q.id] as number) ?? ""}
                      onChange={(e) =>
                        setAnswers((a) => ({
                          ...a,
                          [q.id]: e.target.value ? Number(e.target.value) : "",
                        }))
                      }
                      className={`mt-2 ${inputBaseClass}`}
                      required={q.required}
                    />
                  )}
                  {q.type === "date" && (
                    <input
                      type="date"
                      value={(answers[q.id] as string) ?? ""}
                      onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                      className={`mt-2 ${inputBaseClass}`}
                      required={q.required}
                    />
                  )}
                  {q.type === "scale" && (
                    <div className="mt-2">
                      <input
                        type="range"
                        min={q.scaleMin ?? 0}
                        max={q.scaleMax ?? 5}
                        value={(answers[q.id] as number) ?? (q.scaleMin ?? 0)}
                        onChange={(e) =>
                          setAnswers((a) => ({ ...a, [q.id]: Number(e.target.value) }))
                        }
                        className="w-full accent-primary-600"
                        required={q.required}
                      />
                      <span className="mt-1 block text-small text-[var(--text-secondary)]">
                        {(answers[q.id] as number) ?? (q.scaleMin ?? 0)}
                      </span>
                    </div>
                  )}
                  {q.type === "multiple_choice" && (
                    <div className="mt-2 space-y-2">
                      {(q.options ?? []).map((opt) => (
                        <label
                          key={opt}
                          className="flex cursor-pointer items-center gap-2 text-body text-[var(--text-primary)]"
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={() => handleMultipleChoiceSelect(q.id, opt)}
                            className={radioCheckClass}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  )}
                  {q.type === "checkbox" && (
                    <div className="mt-2 space-y-2">
                      {(q.options ?? []).map((opt) => (
                        <label
                          key={opt}
                          className="flex cursor-pointer items-center gap-2 text-body text-[var(--text-primary)]"
                        >
                          <input
                            type="checkbox"
                            checked={((answers[q.id] as string[]) ?? []).includes(opt)}
                            onChange={(e) => handleCheckboxChange(q.id, opt, e.target.checked)}
                            className={radioCheckClass}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  )}
                </li>
              ))}
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
            {sending ? "Enviando..." : "Enviar resposta"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
