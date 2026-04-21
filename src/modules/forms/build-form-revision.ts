import type { Form, Question } from "@/core/entities";
import { parseFormResponseSettings } from "@/types/form-response-settings";
import { parseFormSectionVisibilityRules } from "@/types/form-section-visibility";

export type FormRevisionDetailItem = {
  field: string;
  before?: string;
  after?: string;
};

type QuestionSnap = {
  id: string;
  type: string;
  text: string;
  required: boolean;
  orderIndex: number;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  conditionQuestionId: string;
  conditionOperator: string;
  conditionValue: unknown;
  sectionTitle: string;
  sectionDescription: string;
  helpText: string;
  placeholder: string;
  contentHtml: string;
  imageUrl: string;
  videoUrl: string;
  imageAlt: string;
  separatorStyle: string;
  fileDownloadUrl: string;
  fileDownloadLabel: string;
  fileDownloadMime: string;
  fileUploadRules: string;
};

export type FormSnapshot = {
  title: string;
  description: string;
  closingMessage: string;
  pausedMessage: string;
  folderId: string;
  isTemplate: boolean;
  status: string;
  slug: string;
  allowAnonymous: boolean;
  respondentIdentificationMode: string;
  responseLayoutMode: string;
  sectionVisibilityRules: string;
  questions: QuestionSnap[];
};

export function snapshotFormState(form: Form, questions: Question[]): FormSnapshot {
  const qs = [...questions].sort(
    (a, b) => a.orderIndex - b.orderIndex || a.id.localeCompare(b.id)
  );
  const rs = parseFormResponseSettings(
    (form as { responseSettings?: unknown }).responseSettings,
    form.allowAnonymous
  );
  const sv = JSON.stringify(parseFormSectionVisibilityRules(form.sectionVisibilityRules));
  return {
    title: form.title,
    description: form.description ?? "",
    closingMessage: form.closingMessage ?? "",
    pausedMessage: form.pausedMessage ?? "",
    folderId: form.folderId ?? "",
    isTemplate: form.isTemplate ?? false,
    status: form.status,
    slug: form.slug ?? "",
    allowAnonymous: form.allowAnonymous,
    respondentIdentificationMode: rs.respondentIdentificationMode,
    responseLayoutMode: rs.responseLayoutMode,
    sectionVisibilityRules: sv,
    questions: qs.map((q) => ({
      id: q.id,
      type: q.type,
      text: q.text,
      required: q.required,
      orderIndex: q.orderIndex,
      options: q.options,
      scaleMin: q.scaleMin,
      scaleMax: q.scaleMax,
      conditionQuestionId: q.conditionQuestionId ?? "",
      conditionOperator: q.conditionOperator ?? "",
      conditionValue: q.conditionValue,
      sectionTitle: q.sectionTitle ?? "",
      sectionDescription: q.sectionDescription ?? "",
      helpText: q.helpText ?? "",
      placeholder: q.placeholder ?? "",
      contentHtml: q.contentHtml ?? "",
      imageUrl: q.imageUrl ?? "",
      videoUrl: q.videoUrl ?? "",
      imageAlt: q.imageAlt ?? "",
      separatorStyle: q.separatorStyle ?? "",
      fileDownloadUrl: q.fileDownloadUrl ?? "",
      fileDownloadLabel: q.fileDownloadLabel ?? "",
      fileDownloadMime: q.fileDownloadMime ?? "",
      fileUploadRules: q.fileUploadRules
        ? JSON.stringify(q.fileUploadRules)
        : "",
    })),
  };
}

export function diffFormSnapshots(
  before: FormSnapshot,
  after: FormSnapshot
): { changed: boolean; summary: string; details: { changes: FormRevisionDetailItem[] } } {
  const changes: FormRevisionDetailItem[] = [];
  const ser = (x: unknown) => (x === undefined ? "undefined" : JSON.stringify(x));
  const add = (field: string, b: unknown, a: unknown) => {
    const bs = ser(b);
    const as = ser(a);
    if (bs !== as) {
      changes.push({
        field,
        before: truncate(bs),
        after: truncate(as),
      });
    }
  };
  add("title", before.title, after.title);
  add("description", before.description, after.description);
  add("closingMessage", before.closingMessage, after.closingMessage);
  add("pausedMessage", before.pausedMessage, after.pausedMessage);
  add("folderId", before.folderId, after.folderId);
  add("isTemplate", before.isTemplate, after.isTemplate);
  add("status", before.status, after.status);
  add("slug", before.slug, after.slug);
  add("allowAnonymous", before.allowAnonymous, after.allowAnonymous);
  add("respondentIdentificationMode", before.respondentIdentificationMode, after.respondentIdentificationMode);
  add("responseLayoutMode", before.responseLayoutMode, after.responseLayoutMode);
  add("sectionVisibilityRules", before.sectionVisibilityRules, after.sectionVisibilityRules);
  add("questions", before.questions, after.questions);
  const labels: Record<string, string> = {
    title: "título",
    description: "descrição",
    closingMessage: "mensagem final",
    pausedMessage: "mensagem de pausa",
    folderId: "pasta",
    isTemplate: "modelo",
    status: "status",
    slug: "slug",
    allowAnonymous: "anônimo",
    respondentIdentificationMode: "identificação",
    responseLayoutMode: "layout de resposta",
    sectionVisibilityRules: "visibilidade por secção",
    questions: "perguntas e seções",
  };
  const summary =
    changes.length === 0 ? "" : changes.map((c) => labels[c.field] ?? c.field).join(", ");
  return {
    changed: changes.length > 0,
    summary,
    details: { changes },
  };
}

function truncate(s: string, max = 400): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}
