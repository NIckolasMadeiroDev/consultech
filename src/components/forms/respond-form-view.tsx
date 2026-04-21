"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { FormSubmitPausedError } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { filterVisibleResponseQuestions } from "@/modules/forms/filter-visible-response-questions";
import { SectionHeader } from "@/components/forms/section-header";
import { QuestionHelp } from "@/components/forms/question-help";
import { acceptsAnswerValue } from "@/lib/form-question-kinds";
import { TextBlockDisplay } from "@/components/forms/blocks/text-block-display";
import { MarkdownBlockDisplay } from "@/components/forms/blocks/markdown-block-display";
import { ImageBlockDisplay } from "@/components/forms/blocks/image-block-display";
import { VideoBlockDisplay } from "@/components/forms/blocks/video-block-display";
import { SeparatorDisplay } from "@/components/forms/blocks/separator-display";
import { FileDownloadDisplay } from "@/components/forms/blocks/file-download-display";
import { FileUploadAnswerField } from "@/components/forms/file-upload-answer-field";
import { FormFilePrivacyNotice } from "@/components/forms/form-file-privacy-notice";
import type { FileUploadRules } from "@/types/file-upload-rules";
import type { ResponseAttachmentInput } from "@/modules/responses/response-attachment.types";
import type { FormTheme } from "@/types/form-theme";
import { getFormSubmitButtonClassName } from "@/lib/theme-utils";
import { FormProgressBar, type FormProgressMetrics } from "@/components/forms/form-progress-bar";
import { SuccessPage } from "@/components/forms/success-page";
import { QuestionLabelIcon } from "@/components/forms/question-label-icon";
import { SafeFormattedText } from "@/components/forms/safe-formatted-text";
import type { FormResponseSettings } from "@/types/form-response-settings";
import { defaultFormResponseSettings } from "@/types/form-response-settings";
import { parseFormSectionVisibilityRules } from "@/types/form-section-visibility";
import type { Question } from "@/core/entities/question.entity";

const inputBaseClass =
  "h-10 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none transition-colors duration-150 placeholder:text-neutral-400 focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 dark:border-neutral-600 dark:focus-visible:ring-offset-[var(--background)]";
const textareaClass =
  "mt-2 w-full rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2.5 text-body text-[var(--text-primary)] outline-none transition-colors duration-150 placeholder:text-neutral-400 focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 dark:border-neutral-600 dark:focus-visible:ring-offset-[var(--background)]";
const themedTextareaClass =
  "form-theme-input mt-2 w-full px-3 py-2.5 text-body outline-none transition-colors duration-150 placeholder:text-[color-mix(in_srgb,var(--form-text-primary)_45%,transparent)]";
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
  sectionTitle?: string | null;
  sectionDescription?: string | null;
  helpText?: string | null;
  placeholder?: string | null;
  contentHtml?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  imageAlt?: string | null;
  separatorStyle?: string | null;
  fileDownloadUrl?: string | null;
  fileDownloadLabel?: string | null;
  fileDownloadMime?: string | null;
  fileUploadRules?: FileUploadRules | null;
  customIcon?: string | null;
};

function questionAnimClass(themeVisual: FormTheme | undefined): string {
  if (!themeVisual?.animations?.enabled) return "";
  const s = themeVisual.animations.style;
  if (s === "none") return "";
  return `form-q-anim form-q-anim--${s}`;
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

function validateAnswerableBlock(
  qs: RespondFormQuestion[],
  answers: Record<string, AnswerValue>,
  attachmentPayloads: Record<string, ResponseAttachmentInput[]>
): string | null {
  for (const q of qs) {
    if (!acceptsAnswerValue(q.type)) continue;
    if (q.type === "checkbox" && q.required) {
      const v = (answers[q.id] as string[]) ?? [];
      if (v.length === 0) {
        return "Marque ao menos uma opção em cada pergunta obrigatória de múltipla escolha (caixas).";
      }
    }
    if (q.required && !isRequiredFilled(q, answers, attachmentPayloads)) {
      return "Preencha todos os campos obrigatórios deste passo.";
    }
  }
  return null;
}

function isRequiredFilled(
  q: RespondFormQuestion,
  answers: Record<string, AnswerValue>,
  attachmentPayloads: Record<string, ResponseAttachmentInput[]>
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
    case "file_upload": {
      const items = attachmentPayloads[q.id];
      if (items && items.length > 0) return true;
      if (Array.isArray(v)) return v.length > 0;
      return typeof v === "string" && v.trim() !== "";
    }
    default:
      return true;
  }
}

function sectionDisplayTitle(q: RespondFormQuestion): string {
  const alt = q.sectionTitle?.trim();
  if (alt) return alt;
  return q.text?.trim() || "Geral";
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
      pendingTitle = sectionDisplayTitle(q);
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

function buildQuestionStepBlocks(
  visibleQuestions: RespondFormQuestion[]
): { title: string; questions: RespondFormQuestion[] }[] {
  const blocks: { title: string; questions: RespondFormQuestion[] }[] = [];
  let pendingTitle = "Geral";
  for (const q of visibleQuestions) {
    if (q.type === "section") {
      pendingTitle = sectionDisplayTitle(q);
      continue;
    }
    if (!acceptsAnswerValue(q.type)) continue;
    blocks.push({ title: pendingTitle, questions: [q] });
  }
  if (blocks.length === 0) {
    blocks.push({ title: pendingTitle, questions: [] });
  }
  return blocks;
}

export function RespondFormView({
  formId,
  form,
  preview = false,
  onPreviewDone,
  themeVisual,
}: {
  readonly formId: string;
  readonly form: {
    title: string;
    description?: string;
    closingMessage?: string;
    allowAnonymous?: boolean;
    responseSettings?: FormResponseSettings | null;
    sectionVisibilityRules?: unknown;
    welcomeMessage?: string;
    submitButtonText?: string;
    successMessage?: string;
    successPageHtml?: string | null;
    successRedirectUrl?: string | null;
    successRedirectDelay?: number;
    questions: RespondFormQuestion[];
  };
  readonly preview?: boolean;
  readonly onPreviewDone?: () => void;
  readonly themeVisual?: FormTheme;
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
  const [attachmentPayloads, setAttachmentPayloads] = useState<
    Record<string, ResponseAttachmentInput[]>
  >({});
  const submitErrorRef = useRef<HTMLDivElement>(null);
  const themed = Boolean(themeVisual);
  const inputThemedClass = themed
    ? "form-theme-input h-10 w-full px-3 py-2 text-body outline-none transition-colors duration-150 placeholder:text-[color-mix(in_srgb,var(--form-text-primary)_45%,transparent)]"
    : inputBaseClass;
  const textareaThemedClass = themed ? themedTextareaClass : textareaClass;
  const submitLabel =
    form.submitButtonText?.trim() && form.submitButtonText.trim().length > 0
      ? form.submitButtonText.trim()
      : "Enviar resposta";
  const thankYouBody =
    form.successMessage?.trim() ||
    form.closingMessage?.trim() ||
    "Sua resposta foi registrada.";
  const successDelay = form.successRedirectDelay ?? 0;

  const sortedQuestions = useMemo(
    () => [...(form.questions ?? [])].sort((a, b) => a.orderIndex - b.orderIndex),
    [form.questions]
  );

  const responseSettings = useMemo(
    () => form.responseSettings ?? defaultFormResponseSettings(Boolean(form.allowAnonymous)),
    [form.responseSettings, form.allowAnonymous]
  );

  const sectionRules = useMemo(
    () => parseFormSectionVisibilityRules(form.sectionVisibilityRules),
    [form.sectionVisibilityRules]
  );

  const respondentDeptContext = useMemo(() => {
    if (responseSettings.respondentIdentificationMode === "anonymous") return null;
    return { department: department.trim() || undefined };
  }, [responseSettings.respondentIdentificationMode, department]);

  const visibleQuestions = useMemo(
    () =>
      filterVisibleResponseQuestions(
        sortedQuestions as Question[],
        answers as Record<string, unknown>,
        sectionRules,
        respondentDeptContext
      ),
    [sortedQuestions, answers, sectionRules, respondentDeptContext]
  );

  const hasFileUploadQuestion = useMemo(
    () => visibleQuestions.some((q) => q.type === "file_upload"),
    [visibleQuestions]
  );

  const respondentFieldsRequired =
    responseSettings.respondentIdentificationMode === "required";

  const layoutStepBlocks = useMemo(() => {
    if (responseSettings.responseLayoutMode === "wizard_by_question") {
      return buildQuestionStepBlocks(visibleQuestions);
    }
    return buildSectionBlocks(visibleQuestions);
  }, [visibleQuestions, responseSettings.responseLayoutMode]);

  const respondentStepCount =
    responseSettings.respondentIdentificationMode === "anonymous" ? 0 : 1;
  const totalWizardSteps = respondentStepCount + layoutStepBlocks.length;
  const isWizard =
    responseSettings.responseLayoutMode !== "single_page" && totalWizardSteps > 1;
  const [wizardStep, setWizardStep] = useState(0);
  const formRootRef = useRef<HTMLFormElement>(null);
  const wizardScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isWizard) return;
    const max = Math.max(0, totalWizardSteps - 1);
    setWizardStep((s) => Math.min(s, max));
  }, [isWizard, totalWizardSteps]);

  useEffect(() => {
    if (!isWizard) return;
    wizardScrollRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [isWizard, wizardStep]);

  const questionsForList = useMemo(() => {
    if (!isWizard) return visibleQuestions;
    const bi = wizardStep - respondentStepCount;
    if (bi < 0) return [] as RespondFormQuestion[];
    return layoutStepBlocks[bi]?.questions ?? [];
  }, [isWizard, wizardStep, respondentStepCount, layoutStepBlocks, visibleQuestions]);

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
    const blocks = layoutStepBlocks;
    const answerable = visibleQuestions.filter((q) => acceptsAnswerValue(q.type));
    const requiredQs = answerable.filter((q) => q.required);
    const filled = requiredQs.filter((q) => isRequiredFilled(q, answers, attachmentPayloads)).length;
    const totalReq = requiredQs.length;
    const pct = totalReq === 0 ? 100 : Math.min(100, Math.round((100 * filled) / totalReq));
    const allReq = visibleQuestions.filter((q) => acceptsAnswerValue(q.type) && q.required);
    const allDone =
      allReq.length === 0 ||
      allReq.every((q) => isRequiredFilled(q, answers, attachmentPayloads));
    let currentIdx = 0;
    if (blocks.length > 0) {
      if (allDone) {
        currentIdx = blocks.length - 1;
      } else {
        const idx = blocks.findIndex((b) => {
          const req = b.questions.filter((q) => q.required);
          return (
            req.length > 0 &&
            req.some((q) => !isRequiredFilled(q, answers, attachmentPayloads))
          );
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
    } satisfies FormProgressMetrics;
  }, [visibleQuestions, answers, attachmentPayloads, layoutStepBlocks]);

  useEffect(() => {
    if (preview) {
      setDraftHydrated(true);
      return;
    }
    if (!responseSettings.allowSaveDraft) {
      setDraftHydrated(true);
      return;
    }
    try {
      const raw = localStorage.getItem(draftStorageKey(formId));
      if (raw) {
        const d = JSON.parse(raw) as StoredDraft;
        if (d?.v === 1 && d.answers && typeof d.answers === "object") {
          const next = { ...d.answers } as Record<string, AnswerValue>;
          for (const q of form.questions) {
            if (q.type === "file_upload") {
              delete next[q.id];
            }
          }
          setAnswers(next);
          setAttachmentPayloads({});
          if (responseSettings.respondentIdentificationMode !== "anonymous") {
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
  }, [formId, preview, form.questions, responseSettings.allowSaveDraft, responseSettings.respondentIdentificationMode]);

  useEffect(() => {
    if (preview || !draftHydrated || !responseSettings.allowSaveDraft) return;
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
  }, [name, email, employeeId, department, answers, formId, preview, draftHydrated, responseSettings.allowSaveDraft]);

  const hasUnsubmittedContent =
    Object.keys(answers).length > 0 ||
    (respondentStepCount > 0 &&
      [name, email, employeeId, department].some((x) => x.trim() !== ""));

  useEffect(() => {
    if (preview || submitted || !responseSettings.allowSaveDraft) return;
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
  }, [preview, submitted, formId, hasUnsubmittedContent, responseSettings.allowSaveDraft]);

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

  const handleWizardNext = () => {
    setErr(null);
    setErrTargetQuestionId(null);
    if (respondentStepCount > 0 && wizardStep === 0) {
      const el = formRootRef.current;
      if (el && !el.checkValidity()) {
        el.reportValidity();
        return;
      }
    } else {
      const bi = wizardStep - respondentStepCount;
      const qs = layoutStepBlocks[bi]?.questions ?? [];
      const msg = validateAnswerableBlock(qs, answers, attachmentPayloads);
      if (msg) {
        setErr(msg);
        return;
      }
    }
    setWizardStep((s) => Math.min(s + 1, totalWizardSteps - 1));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isWizard && wizardStep !== totalWizardSteps - 1) {
      return;
    }
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
      const answerable = visibleQuestions.filter((q) => acceptsAnswerValue(q.type));
      const flatAttachments = Object.values(attachmentPayloads).flat();
      const payload: {
        formId: string;
        respondent?: { name: string; email: string; employeeId?: string; department?: string };
        answers: Array<{ questionId: string; value: AnswerValue }>;
        attachments?: typeof flatAttachments;
      } = {
        formId,
        answers: answerable.map((q) => {
          if (q.type === "file_upload" && q.fileUploadRules) {
            const items = attachmentPayloads[q.id] ?? [];
            const multi = q.fileUploadRules.maxFiles > 1;
            const value: AnswerValue = multi
              ? items.map((x) => x.publicUrl)
              : (items[0]?.publicUrl ?? "");
            return { questionId: q.id, value };
          }
          return {
            questionId: q.id,
            value:
              answers[q.id] ??
              (q.type === "yes_no" ? false : q.type === "file_upload" ? "" : ""),
          };
        }),
        attachments: flatAttachments.length > 0 ? flatAttachments : undefined,
      };
      const idMode = responseSettings.respondentIdentificationMode;
      if (idMode === "required") {
        payload.respondent = {
          name,
          email,
          employeeId: employeeId || undefined,
          department: department || undefined,
        };
      } else if (idMode === "optional") {
        const nt = name.trim();
        const em = email.trim();
        if (nt || em) {
          if (!nt || !em) {
            setErr("Preencha nome e e-mail para identificar a resposta, ou deixe ambos em branco.");
            setSending(false);
            return;
          }
          payload.respondent = {
            name: nt,
            email: em,
            employeeId: employeeId || undefined,
            department: department || undefined,
          };
        }
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
      <SuccessPage
        themed={themed}
        title="Obrigado!"
        plainBody={thankYouBody}
        htmlBody={form.successPageHtml}
        redirectUrl={form.successRedirectUrl}
        redirectDelaySec={successDelay}
        preview={preview}
        onPreviewDone={onPreviewDone}
      />
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <header className="mb-lg sm:mb-xl">
        <h1
          className={
            themed
              ? "form-theme-heading text-h2 font-semibold sm:text-h1"
              : "text-h2 font-semibold text-[var(--text-primary)] sm:text-h1"
          }
        >
          {form.title}
        </h1>
        {form.description?.trim() ? (
          <SafeFormattedText
            source={form.description.trim()}
            className={
              themed
                ? "prose prose-sm mt-2 max-w-none text-body text-[color:var(--form-text-secondary)] dark:prose-invert"
                : "prose prose-sm mt-2 max-w-none text-body text-[var(--text-secondary)] dark:prose-invert"
            }
          />
        ) : null}
        {responseSettings.respondentIdentificationMode === "anonymous" && !preview ? (
          <p
            className={
              themed
                ? "mt-3 text-small text-[color:var(--form-text-secondary)]"
                : "mt-3 text-small text-[var(--text-secondary)]"
            }
            role="status"
          >
            As respostas não são associadas ao seu nome.
          </p>
        ) : null}
        {hasFileUploadQuestion && !preview ? (
          <FormFilePrivacyNotice themed={themed} />
        ) : null}
        {form.welcomeMessage?.trim() ? (
          <p
            className={
              themed
                ? "mt-4 whitespace-pre-wrap text-body text-[color:var(--form-text-primary)]"
                : "mt-4 whitespace-pre-wrap text-body text-[var(--text-primary)]"
            }
          >
            {form.welcomeMessage.trim()}
          </p>
        ) : null}
      </header>

      {draftHydrated && responseSettings.showProgressBar ? (
        <FormProgressBar
          themeVisual={themeVisual}
          metrics={progress}
          preview={preview}
          draftNote={
            !preview && responseSettings.allowSaveDraft ? (
              <p className="text-small text-[var(--text-secondary)]">
                Rascunho salvo neste dispositivo. Ao sair ou fechar a aba, o navegador pode avisar se ainda não
                tiver enviado.
              </p>
            ) : null
          }
        />
      ) : null}

      <Card
        padding="lg"
        className={
          themed
            ? "form-theme-card form-theme-surface border"
            : "border-neutral-200 dark:border-neutral-700"
        }
      >
        <form
          ref={formRootRef}
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

          {((!isWizard && respondentStepCount > 0) ||
            (isWizard && respondentStepCount > 0 && wizardStep === 0)) && (
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
                  required={respondentFieldsRequired}
                />
                <Input
                  id="respondent-email"
                  type="email"
                  label="E-mail"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required={respondentFieldsRequired}
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

          {(!isWizard || (isWizard && !(respondentStepCount > 0 && wizardStep === 0))) && (
          <section aria-labelledby="form-questions-heading">
            <h2 id="form-questions-heading" className="mb-lg text-h4 text-[var(--text-primary)]">
              Perguntas
            </h2>
            {isWizard && wizardStep >= respondentStepCount ? (
              <div className="mb-4 space-y-1">
                <p className="text-small text-[var(--text-secondary)]">
                  Passo {wizardStep + 1} de {totalWizardSteps}
                </p>
                {layoutStepBlocks[wizardStep - respondentStepCount]?.title ? (
                  <h3 className="text-body font-semibold text-[var(--text-primary)]">
                    {layoutStepBlocks[wizardStep - respondentStepCount]?.title}
                  </h3>
                ) : null}
              </div>
            ) : null}
            <ul className="space-y-4">
              {questionsForList.map((q) =>
                q.type === "section" ? (
                  <li key={q.id} className={`list-none ${questionAnimClass(themeVisual)}`}>
                    <SectionHeader
                      id={`section-heading-${q.id}`}
                      title={(q.sectionTitle?.trim() || q.text).trim() || "Seção"}
                      description={q.sectionDescription}
                    />
                  </li>
                ) : !acceptsAnswerValue(q.type) ? (
                  <li key={q.id} className={`list-none ${questionAnimClass(themeVisual)}`}>
                    {q.type === "separator" ? (
                      <SeparatorDisplay styleId={q.separatorStyle} />
                    ) : (
                      <div className="rounded-lg border border-neutral-200 bg-[var(--surface)] p-lg dark:border-neutral-700">
                        {q.text?.trim() ? (
                          <h3 className="mb-3 text-body font-semibold text-[var(--text-primary)]">
                            {q.text}
                          </h3>
                        ) : null}
                        {q.type === "text_block" && q.contentHtml ? (
                          <TextBlockDisplay html={q.contentHtml} />
                        ) : null}
                        {q.type === "markdown_block" && q.contentHtml ? (
                          <MarkdownBlockDisplay source={q.contentHtml} />
                        ) : null}
                        {q.type === "image_block" ? (
                          <ImageBlockDisplay
                            imageUrl={q.imageUrl ?? ""}
                            imageAlt={q.imageAlt}
                          />
                        ) : null}
                        {q.type === "video_block" && q.videoUrl ? (
                          <VideoBlockDisplay videoUrl={q.videoUrl} />
                        ) : null}
                        {q.type === "file_download" ? (
                          <FileDownloadDisplay
                            url={q.fileDownloadUrl ?? ""}
                            label={q.fileDownloadLabel ?? q.text}
                            mime={q.fileDownloadMime}
                          />
                        ) : null}
                      </div>
                    )}
                  </li>
                ) : (
                  <li
                    key={q.id}
                    className={`rounded-lg border border-neutral-200 bg-[var(--surface)] p-lg transition-colors duration-150 dark:border-neutral-700 ${questionAnimClass(themeVisual)}`}
                  >
                    {(() => {
                      const legendId = `q-legend-${q.id}`;
                      const requiredSuffix = q.required ? (
                        <>
                          <span aria-hidden="true"> *</span>
                          <span className="sr-only"> (obrigatório)</span>
                        </>
                      ) : null;
                      const helpText = q.helpText?.trim() ?? "";
                      const ph = q.placeholder?.trim() || undefined;
                      const legend = (
                        <legend
                          id={legendId}
                          className="mb-0 flex w-full flex-wrap items-baseline gap-x-2 px-0 text-small font-medium text-[var(--text-primary)]"
                        >
                          <span className="inline-flex flex-wrap items-center gap-2">
                            <QuestionLabelIcon
                              questionType={q.type}
                              customIcon={q.customIcon}
                              className={
                                themed
                                  ? "h-4 w-4 shrink-0 text-[color:var(--form-color-primary)]"
                                  : "h-4 w-4 shrink-0 text-primary-600"
                              }
                            />
                            <span>
                              {q.text}
                              {requiredSuffix}
                            </span>
                          </span>
                          {helpText ? (
                            <QuestionHelp helpText={helpText} labelId={legendId} />
                          ) : null}
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
                              className={`mt-2 ${inputThemedClass}`}
                              placeholder={ph}
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
                              className={textareaThemedClass}
                              rows={3}
                              placeholder={ph}
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
                              className={`mt-2 ${inputThemedClass}`}
                              placeholder={ph}
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
                              className={`mt-2 ${inputThemedClass}`}
                              placeholder={ph}
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
                              className={`mt-2 ${inputThemedClass}`}
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
                          {q.type === "file_upload" && q.fileUploadRules ? (
                            <FileUploadAnswerField
                              formId={formId}
                              questionId={q.id}
                              rules={q.fileUploadRules}
                              attachments={attachmentPayloads[q.id] ?? []}
                              onAttachmentsChange={(items) => {
                                setAttachmentPayloads((prev) => ({ ...prev, [q.id]: items }));
                                const multi = q.fileUploadRules!.maxFiles > 1;
                                setAnswers((a) => ({
                                  ...a,
                                  [q.id]: multi
                                    ? items.map((x) => x.publicUrl)
                                    : (items[0]?.publicUrl ?? ""),
                                }));
                              }}
                              required={q.required}
                              disabled={preview}
                              legendId={legendId}
                            />
                          ) : null}
                        </fieldset>
                      );
                    })()}
                  </li>
                )
              )}
            </ul>
          </section>
          )}

          {isWizard && totalWizardSteps > 1 ? (
            <div ref={wizardScrollRef} className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={wizardStep === 0}
                onClick={() => setWizardStep((s) => Math.max(0, s - 1))}
              >
                Anterior
              </Button>
              {wizardStep < totalWizardSteps - 1 ? (
                <Button type="button" variant="primary" onClick={handleWizardNext}>
                  Seguinte
                </Button>
              ) : null}
            </div>
          ) : null}

          {(!isWizard || wizardStep === totalWizardSteps - 1) && (
            <Button
              type="submit"
              variant={themed ? "ghost" : "primary"}
              size="lg"
              className={
                themed && themeVisual
                  ? getFormSubmitButtonClassName(themeVisual)
                  : "w-full"
              }
              loading={sending}
              disabled={sending}
            >
              {preview ? "Simular envio" : sending ? "Enviando..." : submitLabel}
            </Button>
          )}
        </form>
      </Card>
    </div>
  );
}
