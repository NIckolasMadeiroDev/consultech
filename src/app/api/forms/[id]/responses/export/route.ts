import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getFormRepository, getQuestionRepository, getResponseRepository, getRespondentRepository, getAuditLogRepository } from "@/infrastructure/database/repositories";
import { getSession } from "@/lib/auth-session";

type ResponseRow = {
  id: string;
  formId: string;
  respondentId: string;
  submittedAt: string;
  respondent: { name: string; email: string; employeeId?: string; department?: string } | null;
  answers: Array<{ questionId: string; value: unknown }>;
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
        const [respondent, answers] = await Promise.all([
          respondentRepo.findById(r.respondentId),
          responseRepo.getAnswersByResponseId(r.id),
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
        };
      })
    );
    const userId = (await getSession(req))?.id ?? null;
    const auditRepo = getAuditLogRepository();
    await auditRepo.create({
      action: "form.responses_exported",
      entityType: "form",
      entityId: formId,
      userId,
      metadata: { format, count: rows.length },
    });
    const questionOrder = [...questions].sort((a, b) => a.orderIndex - b.orderIndex);
    const questionHeaders = questionOrder.map((q) => `Q: ${q.text.slice(0, 50)}${q.text.length > 50 ? "…" : ""}`);
    if (format === "json") {
      const body = JSON.stringify(rows, null, 2);
      return new NextResponse(body, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="responses-${formId.slice(0, 8)}.json"`,
        },
      });
    }
    if (format === "csv") {
      const header = ["Data envio", "Nome", "Email", "Departamento", ...questionHeaders];
      const csvRows = rows.map((r) => {
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
        },
      });
    }
    const header = ["Data envio", "Nome", "Email", "Departamento", ...questionHeaders];
    const sheetData = [
      header,
      ...rows.map((r) => {
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
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
