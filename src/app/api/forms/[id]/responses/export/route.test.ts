import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/forms/[id]/responses/export/route";

vi.mock("@/infrastructure/database/repositories", () => ({
  getFormRepository: vi.fn(),
  getQuestionRepository: vi.fn(),
  getResponseRepository: vi.fn(),
  getRespondentRepository: vi.fn(),
  getAuditLogRepository: vi.fn(),
}));

import {
  getFormRepository,
  getQuestionRepository,
  getResponseRepository,
  getRespondentRepository,
  getAuditLogRepository,
} from "@/infrastructure/database/repositories";

describe("GET /api/forms/[id]/responses/export", () => {
  beforeEach(() => {
    vi.mocked(getFormRepository).mockReturnValue({
      findById: vi.fn().mockResolvedValue({ id: "f1", title: "Form 1" }),
    } as never);
    vi.mocked(getQuestionRepository).mockReturnValue({
      findByFormId: vi.fn().mockResolvedValue([{ id: "q1", text: "P1", orderIndex: 0 }]),
    } as never);
    vi.mocked(getResponseRepository).mockReturnValue({
      findByFormId: vi.fn().mockResolvedValue([
        { id: "r1", formId: "f1", respondentId: "resp1", submittedAt: new Date("2025-01-01") },
      ]),
      getAnswersByResponseId: vi.fn().mockResolvedValue([{ questionId: "q1", value: "Resposta" }]),
      getAttachmentsByResponseId: vi.fn().mockResolvedValue([]),
    } as never);
    vi.mocked(getRespondentRepository).mockReturnValue({
      findById: vi.fn().mockResolvedValue({ name: "João", email: "j@x.com", department: "TI" }),
    } as never);
    vi.mocked(getAuditLogRepository).mockReturnValue({
      create: vi.fn().mockResolvedValue({}),
    } as never);
  });

  it("retorna 404 quando formulário não existe", async () => {
    vi.mocked(getFormRepository).mockReturnValue({
      findById: vi.fn().mockResolvedValue(null),
    } as never);
    const req = new Request("http://localhost/api/forms/f1/responses/export?format=json");
    const res = await GET(req, { params: { id: "f1" } });
    expect(res.status).toBe(404);
  });

  it("retorna 400 para format inválido", async () => {
    const req = new Request("http://localhost/api/forms/f1/responses/export?format=pdf");
    const res = await GET(req, { params: { id: "f1" } });
    expect(res.status).toBe(400);
  });

  it("retorna 200 com JSON e Content-Disposition attachment", async () => {
    const req = new Request("http://localhost/api/forms/f1/responses/export?format=json");
    const res = await GET(req, { params: { id: "f1" } });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/json");
    expect(res.headers.get("Content-Disposition")).toContain("attachment");
    expect(res.headers.get("X-Export-Row-Count")).toBe("1");
    expect(res.headers.get("X-Export-Truncated")).toBeNull();
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json[0]).toHaveProperty("respondent");
    expect(json[0]).toHaveProperty("answers");
  });

  it("aplica limite e indica truncagem no header", async () => {
    vi.mocked(getResponseRepository).mockReturnValue({
      findByFormId: vi.fn().mockResolvedValue([
        { id: "r1", formId: "f1", respondentId: "resp1", submittedAt: new Date("2025-01-01") },
        { id: "r2", formId: "f1", respondentId: "resp1", submittedAt: new Date("2025-01-02") },
      ]),
      getAnswersByResponseId: vi.fn().mockResolvedValue([{ questionId: "q1", value: "x" }]),
      getAttachmentsByResponseId: vi.fn().mockResolvedValue([]),
    } as never);
    const req = new Request("http://localhost/api/forms/f1/responses/export?format=json&limit=1");
    const res = await GET(req, { params: { id: "f1" } });
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Export-Truncated")).toBe("true");
    const json = await res.json();
    expect(json.length).toBe(1);
  });

  it("retorna 200 com CSV e Content-Type text/csv", async () => {
    const req = new Request("http://localhost/api/forms/f1/responses/export?format=csv");
    const res = await GET(req, { params: { id: "f1" } });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(res.headers.get("Content-Disposition")).toContain("attachment");
    const text = await res.text();
    expect(text).toContain("Data envio");
    expect(text).toContain("Nome");
  });

  it("retorna 200 com XLSX e Content-Type spreadsheet", async () => {
    const req = new Request("http://localhost/api/forms/f1/responses/export?format=xlsx");
    const res = await GET(req, { params: { id: "f1" } });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("spreadsheetml");
    expect(res.headers.get("Content-Disposition")).toContain("attachment");
    const buf = await res.arrayBuffer();
    expect(buf.byteLength).toBeGreaterThan(0);
  });
});
