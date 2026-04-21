import type { ResponseFileUploadApiResult } from "@/lib/map-response-file-upload";

const getBaseUrl = (): string => {
  if (globalThis.window === undefined) {
    return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  }
  return globalThis.window.location.origin;
};

export class FormSubmitPausedError extends Error {
  readonly pausedMessage: string | null;

  constructor(message: string, pausedMessage: string | null) {
    super(message);
    this.name = "FormSubmitPausedError";
    this.pausedMessage = pausedMessage;
  }
}

function getHeaders(userId?: string): HeadersInit {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (userId) {
    headers["x-user-id"] = userId;
  }
  return headers;
}

export async function fetchFormFolders(userId?: string) {
  const res = await fetch(`${getBaseUrl()}/api/form-folders`, { headers: getHeaders(userId) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to fetch folders");
  }
  return res.json() as Promise<Array<{ id: string; name: string; createdBy: string | null; createdAt: string }>>;
}

export async function createFormFolder(name: string, userId?: string) {
  const res = await fetch(`${getBaseUrl()}/api/form-folders`, {
    method: "POST",
    headers: getHeaders(userId),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to create folder");
  }
  return res.json() as Promise<{ id: string; name: string }>;
}

export async function fetchForms(createdBy?: string, userId?: string) {
  const url = new URL(`${getBaseUrl()}/api/forms`);
  if (createdBy) url.searchParams.set("createdBy", createdBy);
  const res = await fetch(url.toString(), { headers: getHeaders(userId) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to fetch forms");
  }
  return res.json();
}

export async function fetchForm(id: string) {
  const res = await fetch(`${getBaseUrl()}/api/forms/${id}`, { headers: getHeaders() });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Form not found");
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to fetch form");
  }
  return res.json();
}

export async function fetchFormRevisions(formId: string, userId?: string) {
  const res = await fetch(`${getBaseUrl()}/api/forms/${formId}/revisions`, {
    headers: getHeaders(userId),
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Form not found");
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to fetch revisions");
  }
  return res.json() as Promise<
    Array<{
      id: string;
      version: number;
      summary: string;
      details: unknown;
      createdAt: string;
      editedByName: string | null;
    }>
  >;
}

export async function fetchFormBySlug(slug: string) {
  const res = await fetch(`${getBaseUrl()}/api/forms/by-slug/${encodeURIComponent(slug)}`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Form not found");
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to fetch form");
  }
  return res.json();
}

export async function createForm(
  data: {
    title: string;
    description?: string;
    closingMessage?: string;
    pausedMessage?: string;
    folderId?: string | null;
    isTemplate?: boolean;
    slug?: string;
    allowAnonymous?: boolean;
    initialStatus?: "draft" | "active";
    questions: Array<Record<string, unknown>>;
  },
  userId?: string
) {
  const res = await fetch(`${getBaseUrl()}/api/forms`, {
    method: "POST",
    headers: getHeaders(userId),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to create form");
  }
  return res.json();
}

export async function patchFormTheme(
  id: string,
  data: {
    theme?: unknown;
    headerImage?: string | null;
    logoImage?: string | null;
    backgroundImage?: string | null;
    welcomeMessage?: string | null;
    submitButtonText?: string;
    successMessage?: string | null;
    successPageHtml?: string | null;
    successRedirectUrl?: string | null;
    successRedirectDelay?: number | null;
  },
  userId?: string
) {
  const res = await fetch(`${getBaseUrl()}/api/forms/${id}/theme`, {
    method: "PATCH",
    headers: getHeaders(userId),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to save theme");
  }
  return res.json();
}

export async function exportFormThemeJson(id: string, userId?: string): Promise<Blob> {
  const res = await fetch(`${getBaseUrl()}/api/forms/${id}/theme/export`, {
    headers: getHeaders(userId),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to export theme");
  }
  return res.blob();
}

export async function importFormThemeJson(
  id: string,
  payload: { version?: number; theme: unknown },
  userId?: string
) {
  const res = await fetch(`${getBaseUrl()}/api/forms/${id}/theme/import`, {
    method: "POST",
    headers: getHeaders(userId),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to import theme");
  }
  return res.json();
}

export async function updateForm(
  id: string,
  data: {
    title?: string;
    description?: string;
    closingMessage?: string | null;
    pausedMessage?: string | null;
    folderId?: string | null;
    isTemplate?: boolean;
    status?: string;
    slug?: string | null;
    allowAnonymous?: boolean;
    responseSettings?: {
      respondentIdentificationMode?: "required" | "optional" | "anonymous";
      responseLayoutMode?: "single_page" | "wizard_by_section" | "wizard_by_question";
      showProgressBar?: boolean;
      allowSaveDraft?: boolean;
    };
    questions?: Array<Record<string, unknown>>;
    theme?: unknown;
    headerImage?: string | null;
    logoImage?: string | null;
    backgroundImage?: string | null;
    welcomeMessage?: string | null;
    submitButtonText?: string;
    successMessage?: string | null;
    sectionVisibilityRules?: Array<Record<string, unknown>>;
  },
  userId?: string
) {
  const res = await fetch(`${getBaseUrl()}/api/forms/${id}`, {
    method: "PATCH",
    headers: getHeaders(userId),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Form not found");
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to update form");
  }
  return res.json();
}

export async function archiveForm(id: string, userId?: string) {
  const res = await fetch(`${getBaseUrl()}/api/forms/${id}/archive`, {
    method: "POST",
    headers: getHeaders(userId),
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Form not found");
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to archive form");
  }
  return res.json();
}

export async function duplicateForm(id: string, userId?: string) {
  const res = await fetch(`${getBaseUrl()}/api/forms/${id}/duplicate`, {
    method: "POST",
    headers: getHeaders(userId),
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Form not found");
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to duplicate form");
  }
  return res.json();
}

export async function uploadAdminFormImage(
  file: File,
  options?: { scope?: "blocks" | "branding" }
): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  if (options?.scope) {
    fd.append("scope", options.scope);
  }
  const res = await fetch(`${getBaseUrl()}/api/upload/image`, {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Falha no envio da imagem");
  }
  const j = (await res.json()) as { url?: string };
  if (!j.url) throw new Error("Falha no envio da imagem");
  return j.url;
}

export type { ResponseFileUploadApiResult } from "@/lib/map-response-file-upload";

export async function uploadResponseFile(
  formId: string,
  questionId: string,
  file: File
): Promise<ResponseFileUploadApiResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("questionId", questionId);
  const res = await fetch(`${getBaseUrl()}/api/forms/${formId}/response-file`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Falha no envio do ficheiro");
  }
  const j = (await res.json()) as ResponseFileUploadApiResult;
  if (!j.publicUrl || !j.storagePath) throw new Error("Falha no envio do ficheiro");
  return j;
}

export async function uploadFormStaticAsset(
  formId: string,
  file: File,
  options?: { label?: string },
  userId?: string
): Promise<{ id: string; publicUrl: string; storagePath: string; mimeType: string; sizeBytes: number }> {
  const fd = new FormData();
  fd.append("file", file);
  if (options?.label?.trim()) {
    fd.append("label", options.label.trim());
  }
  const headers: Record<string, string> = {};
  if (userId) {
    headers["x-user-id"] = userId;
  }
  const res = await fetch(`${getBaseUrl()}/api/forms/${formId}/assets`, {
    method: "POST",
    headers,
    credentials: "include",
    body: fd,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Falha no envio do recurso");
  }
  return res.json();
}

export async function fetchFormResponses(
  formId: string,
  userId?: string,
  params?: {
    startDate?: string;
    endDate?: string;
    respondentSearch?: string;
    answerSearch?: string;
    department?: string;
  }
) {
  const url = new URL(`${getBaseUrl()}/api/forms/${formId}/responses`);
  if (params?.startDate) url.searchParams.set("startDate", params.startDate);
  if (params?.endDate) url.searchParams.set("endDate", params.endDate);
  if (params?.respondentSearch?.trim()) {
    url.searchParams.set("respondentSearch", params.respondentSearch.trim());
  }
  if (params?.answerSearch?.trim()) {
    url.searchParams.set("answerSearch", params.answerSearch.trim());
  }
  if (params?.department?.trim()) {
    url.searchParams.set("department", params.department.trim());
  }
  const res = await fetch(url.toString(), {
    headers: getHeaders(userId),
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Form not found");
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to fetch responses");
  }
  return res.json();
}

export async function fetchFormResponsesPage(
  formId: string,
  userId?: string,
  params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }
): Promise<{
  data: Array<{
    id: string;
    submittedAt: string;
    respondent: {
      id: string;
      name: string;
      email: string;
      employeeId?: string | null;
      department?: string | null;
    } | null;
    answers: Array<{ questionId: string; value: unknown }>;
  }>;
  total: number;
  page: number;
  limit: number;
}> {
  const url = new URL(`${getBaseUrl()}/api/forms/${formId}/responses`);
  url.searchParams.set("page", String(params?.page ?? 1));
  url.searchParams.set("limit", String(Math.min(params?.limit ?? 25, 100)));
  if (params?.startDate) url.searchParams.set("startDate", params.startDate);
  if (params?.endDate) url.searchParams.set("endDate", params.endDate);
  const res = await fetch(url.toString(), { headers: getHeaders(userId) });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Form not found");
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to fetch responses");
  }
  return res.json();
}

export type FormResponseAggregate = {
  questionId: string;
  text: string;
  type: string;
  total: number;
  empty: number;
  optionCounts?: Record<string, number>;
  numericSamples?: number[];
  textSamples?: string[];
};

export async function fetchFormResponsesAggregate(
  formId: string,
  userId?: string,
  params?: {
    startDate?: string;
    endDate?: string;
    respondentSearch?: string;
    answerSearch?: string;
    department?: string;
  }
): Promise<{ aggregates: FormResponseAggregate[] }> {
  const url = new URL(`${getBaseUrl()}/api/forms/${formId}/responses/aggregate`);
  if (params?.startDate) url.searchParams.set("startDate", params.startDate);
  if (params?.endDate) url.searchParams.set("endDate", params.endDate);
  if (params?.respondentSearch?.trim()) {
    url.searchParams.set("respondentSearch", params.respondentSearch.trim());
  }
  if (params?.answerSearch?.trim()) {
    url.searchParams.set("answerSearch", params.answerSearch.trim());
  }
  if (params?.department?.trim()) {
    url.searchParams.set("department", params.department.trim());
  }
  const res = await fetch(url.toString(), { headers: getHeaders(userId) });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Form not found");
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to fetch aggregate");
  }
  return res.json();
}

export async function fetchFormResponsesSummary(
  formId: string,
  userId?: string,
  params?: { startDate?: string; endDate?: string }
): Promise<{ count: number; lastSubmittedAt: string | null }> {
  const url = new URL(`${getBaseUrl()}/api/forms/${formId}/responses/summary`);
  if (params?.startDate) url.searchParams.set("startDate", params.startDate);
  if (params?.endDate) url.searchParams.set("endDate", params.endDate);
  const res = await fetch(url.toString(), { headers: getHeaders(userId) });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Form not found");
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to fetch summary");
  }
  return res.json();
}

export async function downloadFormResponsesExport(
  formId: string,
  format: "csv" | "json" | "xlsx",
  userId?: string,
  params?: { startDate?: string; endDate?: string; limit?: number }
): Promise<void> {
  const url = new URL(`${getBaseUrl()}/api/forms/${formId}/responses/export`);
  url.searchParams.set("format", format);
  if (params?.startDate) url.searchParams.set("startDate", params.startDate);
  if (params?.endDate) url.searchParams.set("endDate", params.endDate);
  if (params?.limit != null) url.searchParams.set("limit", String(params.limit));
  const res = await fetch(url.toString(), { headers: getHeaders(userId) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to export");
  }
  const blob = await res.blob();
  const contentDisposition = res.headers.get("Content-Disposition");
  const match = contentDisposition?.match(/filename="?([^";]+)"?/);
  const filename = match?.[1] ?? `responses.${format}`;
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(objectUrl);
}

export type FormResponsesInsightsMeta = {
  mode: string;
  totalMatchingResponses: number;
  sampleSize: number;
  sampleIsPartial: boolean;
};

export async function requestFormResponsesInsights(
  formId: string,
  body: {
    mode: "summary" | "insights";
    startDate?: string;
    endDate?: string;
    respondentSearch?: string;
    answerSearch?: string;
    department?: string;
  },
  userId?: string
): Promise<{ content: string; meta: FormResponsesInsightsMeta }> {
  const res = await fetch(`${getBaseUrl()}/api/forms/${formId}/responses/insights`, {
    method: "POST",
    headers: getHeaders(userId),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Falha ao gerar análise");
  }
  return res.json();
}

export async function fetchDashboards(createdBy?: string, userId?: string) {
  const url = new URL(`${getBaseUrl()}/api/dashboards`);
  if (createdBy) url.searchParams.set("createdBy", createdBy);
  const res = await fetch(url.toString(), { headers: getHeaders(userId) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to fetch dashboards");
  }
  return res.json();
}

export async function fetchDashboard(id: string) {
  const res = await fetch(`${getBaseUrl()}/api/dashboards/${id}`, { headers: getHeaders() });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Dashboard not found");
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to fetch dashboard");
  }
  return res.json();
}

export async function fetchDashboardSummary(
  id: string,
  userId?: string,
  params?: { startDate?: string; endDate?: string }
): Promise<{
  formIds: string[];
  forms: Array<{ formId: string; title: string; count: number; lastSubmittedAt: string | null }>;
  totalResponses: number;
}> {
  const url = new URL(`${getBaseUrl()}/api/dashboards/${id}/summary`);
  if (params?.startDate) url.searchParams.set("startDate", params.startDate);
  if (params?.endDate) url.searchParams.set("endDate", params.endDate);
  const res = await fetch(url.toString(), { headers: getHeaders(userId) });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    if (res.status === 404) throw new Error("Dashboard not found");
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to fetch dashboard summary");
  }
  return res.json();
}

export async function fetchDashboardAnalytics(
  id: string,
  userId?: string,
  params?: { startDate?: string; endDate?: string }
): Promise<{
  avgCompletionRate: number | null;
  byForm: Array<{
    formId: string;
    title: string;
    responseCount: number;
    avgCompletionRate: number | null;
  }>;
  abandonmentByQuestion: Array<{
    formId: string;
    formTitle: string;
    questionId: string;
    questionText: string;
    orderIndex: number;
    eligibleResponses: number;
    answeredCount: number;
    responseRatePercent: number;
    abandonmentEstimatePercent: number;
  }>;
  avgTimePerResponseSeconds: null;
  avgTimeHint: string;
  hideAbandonmentByDefault: boolean;
  responseContentByForm: Array<{
    formId: string;
    title: string;
    responseCount: number;
    allAnswerableRequired: boolean;
    aggregates: FormResponseAggregate[];
  }>;
}> {
  const url = new URL(`${getBaseUrl()}/api/dashboards/${id}/analytics`);
  if (params?.startDate) url.searchParams.set("startDate", params.startDate);
  if (params?.endDate) url.searchParams.set("endDate", params.endDate);
  const res = await fetch(url.toString(), { headers: getHeaders(userId) });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    if (res.status === 404) throw new Error("Dashboard not found");
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to fetch analytics");
  }
  return res.json();
}

export async function search(query: string): Promise<{
  forms: Array<{ id: string; title: string; status: string; createdAt: string }>;
  respondents: Array<{ id: string; name: string; email: string }>;
  answerMatches: Array<{
    answerId: string;
    responseId: string;
    formId: string;
    formTitle: string;
    respondentName: string;
    snippet: string;
  }>;
}> {
  const url = new URL(`${getBaseUrl()}/api/search`);
  url.searchParams.set("q", query);
  const res = await fetch(url.toString(), { headers: getHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Search failed");
  }
  return res.json();
}

export async function createDashboard(
  data: { title: string; formIds: string[] },
  userId?: string
) {
  const res = await fetch(`${getBaseUrl()}/api/dashboards`, {
    method: "POST",
    headers: getHeaders(userId),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to create dashboard");
  }
  return res.json();
}

export async function updateDashboard(
  id: string,
  data: { title?: string; formIds?: string[] },
  userId?: string
) {
  const res = await fetch(`${getBaseUrl()}/api/dashboards/${id}`, {
    method: "PATCH",
    headers: getHeaders(userId),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Dashboard not found");
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to update dashboard");
  }
  return res.json();
}

export async function deleteDashboard(id: string, userId?: string): Promise<void> {
  const res = await fetch(`${getBaseUrl()}/api/dashboards/${id}`, {
    method: "DELETE",
    headers: getHeaders(userId),
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Dashboard not found");
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to delete dashboard");
  }
}

export async function submitResponse(data: {
  formId: string;
  respondent?: { name: string; email: string; employeeId?: string; department?: string };
  answers: Array<{ questionId: string; value: string | number | boolean | string[] }>;
  attachments?: Array<{
    questionId: string;
    storagePath: string;
    publicUrl: string;
    sizeBytes: number;
    mimeType: string;
    originalFilename: string;
  }>;
}) {
  const res = await fetch(`${getBaseUrl()}/api/responses/submit`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const body = err as { error?: string; pausedMessage?: string | null };
    if (res.status === 403 && body.error === "Form is paused") {
      throw new FormSubmitPausedError(body.error, body.pausedMessage ?? null);
    }
    throw new Error(body.error ?? "Failed to submit response");
  }
  return res.json();
}

export async function chatCompletion(data: {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}) {
  const res = await fetch(`${getBaseUrl()}/api/ai/chat`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to get completion");
  }
  return res.json();
}

export type GenerateFormDraftResult = {
  title: string;
  description?: string;
  closingMessage?: string;
  questions: Array<{
    type: string;
    text: string;
    required: boolean;
    options?: string[];
    scaleMin?: number;
    scaleMax?: number;
  }>;
};

export async function generateFormDraft(
  prompt: string,
  userId?: string
): Promise<GenerateFormDraftResult> {
  const res = await fetch(`${getBaseUrl()}/api/ai/generate-form`, {
    method: "POST",
    headers: getHeaders(userId),
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Falha ao gerar rascunho");
  }
  return res.json();
}

export type RefineFormCurrentSnapshot = {
  title: string;
  description?: string;
  closingMessage?: string;
  pausedMessage?: string;
  responseCount?: number;
  questions: Array<{
    id?: string;
    type: string;
    text: string;
    required: boolean;
    options?: string[];
    scaleMin?: number;
    scaleMax?: number;
  }>;
};

export type RefineFormDraftResult = {
  title: string;
  description?: string;
  closingMessage?: string;
  pausedMessage?: string;
  questions: Array<{
    id?: string;
    type: string;
    text: string;
    required: boolean;
    options?: string[];
    scaleMin?: number;
    scaleMax?: number;
  }>;
};

export async function refineFormDraft(
  prompt: string,
  current: RefineFormCurrentSnapshot,
  userId?: string
): Promise<RefineFormDraftResult> {
  const res = await fetch(`${getBaseUrl()}/api/ai/refine-form`, {
    method: "POST",
    headers: getHeaders(userId),
    body: JSON.stringify({ prompt, current }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Falha ao refinar com IA");
  }
  return res.json();
}

export type { SuggestFormCopyKind } from "@/modules/ai/suggest-form-copy.schema";

export async function suggestFormCopy(
  body: {
    kind: import("@/modules/ai/suggest-form-copy.schema").SuggestFormCopyKind;
    title?: string;
    description?: string;
    shareLink?: string | null;
    shortLink?: string | null;
  },
  userId?: string
): Promise<{ text: string }> {
  const res = await fetch(`${getBaseUrl()}/api/ai/suggest-form-copy`, {
    method: "POST",
    headers: getHeaders(userId),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Falha ao sugerir texto");
  }
  return res.json();
}
