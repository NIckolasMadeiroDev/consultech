import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "@/app/api/forms/[id]/route";

vi.mock("@/infrastructure/database/repositories", () => ({
  getFormRepository: vi.fn(),
  getQuestionRepository: vi.fn(),
  getAuditLogRepository: vi.fn(),
}));

import {
  getFormRepository,
  getQuestionRepository,
  getAuditLogRepository,
} from "@/infrastructure/database/repositories";

describe("GET /api/forms/[id]", () => {
  beforeEach(() => {
    vi.mocked(getFormRepository).mockReturnValue({
      findById: vi.fn(),
    } as never);
    vi.mocked(getQuestionRepository).mockReturnValue({
      findByFormId: vi.fn(),
    } as never);
  });

  it("retorna 404 quando formulário não existe", async () => {
    vi.mocked(getFormRepository).mockReturnValue({
      findById: vi.fn().mockResolvedValue(null),
    } as never);
    const req = new Request("http://localhost/api/forms/f1");
    const res = await GET(req, { params: { id: "f1" } });
    expect(res.status).toBe(404);
  });

  it("retorna 200 com form e questions ordenados por orderIndex", async () => {
    const form = {
      id: "f1",
      title: "Form 1",
      description: "Desc",
      status: "draft" as const,
      version: 1,
      createdBy: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const questions = [
      {
        id: "q2",
        formId: "f1",
        type: "short_text" as const,
        text: "P2",
        required: false,
        orderIndex: 1,
      },
      {
        id: "q1",
        formId: "f1",
        type: "yes_no" as const,
        text: "P1",
        required: true,
        orderIndex: 0,
      },
    ];
    vi.mocked(getFormRepository).mockReturnValue({
      findById: vi.fn().mockResolvedValue(form),
    } as never);
    vi.mocked(getQuestionRepository).mockReturnValue({
      findByFormId: vi.fn().mockResolvedValue(questions),
    } as never);
    const req = new Request("http://localhost/api/forms/f1");
    const res = await GET(req, { params: { id: "f1" } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe("f1");
    expect(json.title).toBe("Form 1");
    expect(json.questions).toHaveLength(2);
    expect(json.questions[0].orderIndex).toBe(0);
    expect(json.questions[1].orderIndex).toBe(1);
  });
});

describe("PATCH /api/forms/[id]", () => {
  beforeEach(() => {
    vi.mocked(getFormRepository).mockReturnValue({
      findById: vi.fn(),
      update: vi.fn(),
    } as never);
    vi.mocked(getAuditLogRepository).mockReturnValue({
      create: vi.fn().mockResolvedValue({}),
    } as never);
  });

  it("retorna 404 quando formulário não existe", async () => {
    vi.mocked(getFormRepository).mockReturnValue({
      findById: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
    } as never);
    const req = new Request("http://localhost/api/forms/f1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Novo" }),
    });
    const res = await PATCH(req, { params: { id: "f1" } });
    expect(res.status).toBe(404);
  });

  it("retorna 200 com form atualizado", async () => {
    const updated = {
      id: "f1",
      title: "Novo título",
      description: "Desc",
      status: "draft" as const,
      version: 1,
      createdBy: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(getFormRepository).mockReturnValue({
      findById: vi.fn().mockResolvedValue({ id: "f1" }),
      update: vi.fn().mockResolvedValue(updated),
    } as never);
    const req = new Request("http://localhost/api/forms/f1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Novo título" }),
    });
    const res = await PATCH(req, { params: { id: "f1" } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.title).toBe("Novo título");
  });
});
