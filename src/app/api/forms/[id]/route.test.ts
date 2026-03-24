import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "@/app/api/forms/[id]/route";

vi.mock("@/infrastructure/database/repositories", () => ({
  getFormRepository: vi.fn(),
  getQuestionRepository: vi.fn(),
  getAuditLogRepository: vi.fn(),
  getFormRevisionRepository: vi.fn(),
}));

vi.mock("@/lib/auth-session", () => ({
  getSession: vi.fn().mockResolvedValue(null),
}));

import {
  getFormRepository,
  getQuestionRepository,
  getAuditLogRepository,
  getFormRevisionRepository,
} from "@/infrastructure/database/repositories";

const fullForm = (over: Partial<Record<string, unknown>> = {}) => ({
  id: "f1",
  title: "Form 1",
  description: "Desc",
  closingMessage: undefined,
  folderId: undefined,
  isTemplate: false,
  status: "draft" as const,
  version: 1,
  slug: undefined,
  allowAnonymous: false,
  createdBy: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...over,
});

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
    const form = fullForm();
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
    vi.mocked(getAuditLogRepository).mockReturnValue({
      create: vi.fn().mockResolvedValue({}),
    } as never);
    vi.mocked(getFormRevisionRepository).mockReturnValue({
      create: vi.fn().mockResolvedValue({}),
      findByFormId: vi.fn(),
    } as never);
    vi.mocked(getQuestionRepository).mockReturnValue({
      findByFormId: vi.fn().mockResolvedValue([]),
      updateMany: vi.fn(),
      createMany: vi.fn(),
      deleteManyIds: vi.fn(),
    } as never);
  });

  it("retorna 404 quando formulário não existe", async () => {
    vi.mocked(getFormRepository).mockReturnValue({
      findById: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
      setVersion: vi.fn(),
    } as never);
    const req = new Request("http://localhost/api/forms/f1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Novo" }),
    });
    const res = await PATCH(req, { params: { id: "f1" } });
    expect(res.status).toBe(404);
  });

  it("retorna 200 com form atualizado e registra revisão quando há mudança", async () => {
    const before = fullForm({ title: "Velho" });
    const afterUpdate = fullForm({ title: "Novo título" });
    const afterVersion = fullForm({ title: "Novo título", version: 2 });
    let findCount = 0;
    vi.mocked(getFormRepository).mockReturnValue({
      findById: vi.fn(async () => {
        findCount += 1;
        if (findCount === 1) return before;
        if (findCount === 2) return afterUpdate;
        return afterVersion;
      }),
      update: vi.fn().mockResolvedValue(afterUpdate),
      setVersion: vi.fn().mockResolvedValue(afterVersion),
    } as never);
    const revisionCreate = vi.fn().mockResolvedValue({});
    vi.mocked(getFormRevisionRepository).mockReturnValue({
      create: revisionCreate,
      findByFormId: vi.fn(),
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
    expect(revisionCreate).toHaveBeenCalled();
  });
});
