const getBaseUrl = (): string => {
  if (globalThis.window === undefined) {
    return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  }
  return globalThis.window.location.origin;
};

function getHeaders(userId?: string): HeadersInit {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (userId) {
    headers["x-user-id"] = userId;
  }
  return headers;
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
  data: { title: string; description?: string; slug?: string; allowAnonymous?: boolean; questions: Array<Record<string, unknown>> },
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

export async function updateForm(
  id: string,
  data: { title?: string; description?: string; status?: string; slug?: string | null; allowAnonymous?: boolean; questions?: Array<Record<string, unknown>> },
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

export async function fetchFormResponses(formId: string, userId?: string) {
  const res = await fetch(`${getBaseUrl()}/api/forms/${formId}/responses`, {
    headers: getHeaders(userId),
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error("Form not found");
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to fetch responses");
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
  userId?: string
): Promise<void> {
  const url = `${getBaseUrl()}/api/forms/${formId}/responses/export?format=${format}`;
  const res = await fetch(url, { headers: getHeaders(userId) });
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
}) {
  const res = await fetch(`${getBaseUrl()}/api/responses/submit`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to submit response");
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
