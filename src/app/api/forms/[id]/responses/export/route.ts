import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getFormRepository, getQuestionRepository, getResponseRepository, getRespondentRepository, getAuditLogRepository } from "@/infrastructure/database/repositories";
import { getSession } from "@/lib/auth-session";
import {
  RESPONSE_EXPORT_DEFAULT_LIMIT,
  RESPONSE_EXPORT_MAX_LIMIT,
} from "@/lib/response-export-limits";

type ResponseRow = {
  id: string;
  formId: string;
  respondentId: string | null;
  submittedAt: string;
  respondent: { name: string; email: string; employeeId?: string; department?: string } | null;
  answers: Array<{ questionId: string; value: unknown }>;
  attachments: Array<{
    questionId: string;
    storagePath: string;
    publicUrl: string;
    mimeType: string;
    sizeBytes: number;
    originalFilename: string;
  }>;
};

function escapeCsvCell(value: string): string {
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replaceAll('"', '""')}"`;
  }
  return s;
}

function answerToCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(String).join("; ");
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function parseExportLimit(raw: string | null): number {
  if (!raw) return RESPONSE_EXPORT_DEFAULT_LIMIT;
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 1) return RESPONSE_EXPORT_DEFAULT_LIMIT;
  return Math.min(n, RESPONSE_EXPORT_MAX_LIMIT);
}

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id: formId } = context.params;
    const url = new URL(req.url);
    const format = (url.searchParams.get("format") ?? "json").toLowerCase();
    if (!["csv", "json", "xlsx"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Use csv, json or xlsx" },
        { status: 400 }
      );
    }
    const formRepo = getFormRepository();
    const form = await formRepo.findById(formId);
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }
    const questionRepo = getQuestionRepository();
    const questions = await questionRepo.findByFormId(formId);
    const responseRepo = getResponseRepository();
    const respondentRepo = getRespondentRepository();
    const responses = await responseRepo.findByFormId(formId);
    const rows: ResponseRow[] = await Promise.all(
      responses.map(async (r) => {
        const [respondent, answers, attachments] = await Promise.all([
          r.respondentId ? respondentRepo.findById(r.respondentId) : Promise.resolve(null),
          responseRepo.getAnswersByResponseId(r.id),
          responseRepo.getAttachmentsByResponseId(r.id),
        ]);
        return {
          id: r.id,
          formId: r.formId,
          respondentId: r.respondentId,
          submittedAt: r.submittedAt.toISOString(),
          respondent: respondent
            ? {
                name: respondent.name,
                email: respondent.email,
                employeeId: respondent.employeeId ?? undefined,
                department: respondent.department ?? undefined,
              }
            : null,
          answers: answers.map((a) => ({ questionId: a.questionId, value: a.value })),
          attachments,
        };
      })
    );

    const startParam = url.searchParams.get("startDate");
    const endParam = url.searchParams.get("endDate");
    const limit = parseExportLimit(url.searchParams.get("limit"));
    let filtered = rows;
    if (startParam || endParam) {
      const startT = startParam ? new Date(startParam).getTime() : null;
      const endT = endParam ? new Date(endParam).getTime() : null;
      filtered = rows.filter((r) => {
        const t = new Date(r.submittedAt).getTime();
        if (startT !== null && !Number.isNaN(startT) && t < startT) return false;
        if (endT !== null && !Number.isNaN(endT) && t > endT) return false;
        return true;
      });
    }
    const totalMatched = filtered.length;
    const truncated = filtered.length > limit;
    const exportRows = filtered.slice(0, limit);

    const userId = (await getSession(req))?.id ?? null;
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "form.responses_exported",
      entityType: "form",
      entityId: formId,
      userId,
      metadata: {
        format,
        count: exportRows.length,
        totalMatched,
        truncated,
        startDate: startParam ?? undefined,
        endDate: endParam ?? undefined,
      },
    });
    const questionOrder = [...questions].sort((a, b) => a.orderIndex - b.orderIndex);
    const questionHeaders = questionOrder.map((q) => q.text.replace(/\s+/g, " ").trim());
    const exportHeaders = {
      "X-Export-Row-Count": String(exportRows.length),
      "X-Export-Total-Matched": String(totalMatched),
      ...(truncated ? { "X-Export-Truncated": "true" } : {}),
    };
    if (format === "json") {
      const body = JSON.stringify(exportRows, null, 2);
      return new NextResponse(body, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="responses-${formId.slice(0, 8)}.json"`,
          ...exportHeaders,
        },
      });
    }
    if (format === "csv") {
      const header = ["Data envio", "Nome", "Email", "Departamento", ...questionHeaders];
      const csvRows = exportRows.map((r) => {
        const base = [
          r.submittedAt,
          r.respondent?.name ?? "",
          r.respondent?.email ?? "",
          r.respondent?.department ?? "",
        ];
        const answerMap = new Map(r.answers.map((a) => [a.questionId, a.value]));
        const answerCells = questionOrder.map((q) => answerToCell(answerMap.get(q.id)));
        return [...base, ...answerCells];
      });
      const lines = [header.map(escapeCsvCell).join(","), ...csvRows.map((row) => row.map(escapeCsvCell).join(","))];
      const csv = lines.join("\r\n");
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="responses-${formId.slice(0, 8)}.csv"`,
          ...exportHeaders,
        },
      });
    }
    const header = ["Data envio", "Nome", "Email", "Departamento", ...questionHeaders];
    const sheetData = [
      header,
      ...exportRows.map((r) => {
        const base = [
          r.submittedAt,
          r.respondent?.name ?? "",
          r.respondent?.email ?? "",
          r.respondent?.department ?? "",
        ];
        const answerMap = new Map(r.answers.map((a) => [a.questionId, a.value]));
        const answerCells = questionOrder.map((q) => answerToCell(answerMap.get(q.id)));
        return [...base, ...answerCells];
      }),
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, "Respostas");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="responses-${formId.slice(0, 8)}.xlsx"`,
        ...exportHeaders,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
