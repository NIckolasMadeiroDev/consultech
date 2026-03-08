import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/forms/route";

vi.mock("@/infrastructure/database/repositories", () => ({
  getFormRepository: vi.fn(),
  getQuestionRepository: vi.fn(),
  getAuditLogRepository: vi.fn(),
}));

vi.mock("@/lib/auth-session", () => ({
  getCreatedBy: vi.fn().mockResolvedValue("user-1"),
  getSession: vi.fn().mockResolvedValue({ id: "user-1" }),
}));

import {
  getFormRepository,
  getQuestionRepository,
  getAuditLogRepository,
} from "@/infrastructure/database/repositories";

describe("GET /api/forms", () => {
  beforeEach(() => {
    vi.mocked(getFormRepository).mockReturnValue({
      findByCreatedBy: vi.fn().mockResolvedValue([]),
    } as never);
  });

  it("retorna 200 com lista vazia quando não há formulários", async () => {
    const req = new Request("http://localhost/api/forms");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json).toHaveLength(0);
  });

  it("retorna 200 com lista de formulários do createdBy", async () => {
    const forms = [
      {
        id: "f1",
        title: "Form 1",
        status: "draft",
        slug: null,
        createdAt: new Date().toISOString(),
      },
    ];
    vi.mocked(getFormRepository).mockReturnValue({
      findByCreatedBy: vi.fn().mockResolvedValue(forms),
    } as never);
    const req = new Request("http://localhost/api/forms");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0].id).toBe("f1");
    expect(json[0].title).toBe("Form 1");
  });
});

describe("POST /api/forms", () => {
  beforeEach(() => {
    vi.mocked(getFormRepository).mockReturnValue({
      create: vi.fn().mockResolvedValue({
        id: "f-new",
        title: "Novo Form",
        description: "Desc",
        status: "draft",
        version: 1,
        createdBy: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    } as never);
    vi.mocked(getQuestionRepository).mockReturnValue({
      createMany: vi.fn().mockResolvedValue([
        { id: "q1", formId: "f-new", type: "short_text", text: "P1", required: true, orderIndex: 0 },
      ]),
    } as never);
    vi.mocked(getAuditLogRepository).mockReturnValue({
      create: vi.fn().mockResolvedValue({}),
    } as never);
  });

  it("retorna 200 e cria formulário com payload mínimo", async () => {
    const req = new Request("http://localhost/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Novo Form",
        questions: [{ type: "short_text", text: "P1", required: true, orderIndex: 0 }],
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe("f-new");
    expect(json.title).toBe("Novo Form");
  });

  it("retorna 400 quando título tem menos de 3 caracteres", async () => {
    const req = new Request("http://localhost/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "ab",
        questions: [{ type: "short_text", text: "P1", required: true, orderIndex: 0 }],
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("retorna 200 e cria formulário com perguntas multiple_choice e scale", async () => {
    const createSpy = vi.fn().mockResolvedValue({
      id: "f-new",
      title: "Pesquisa",
      description: "Desc",
      status: "draft",
      version: 1,
      createdBy: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const createManySpy = vi.fn().mockResolvedValue([
      { id: "q1", formId: "f-new", type: "multiple_choice", text: "Escolha", required: true, orderIndex: 0, options: ["A", "B"] },
      { id: "q2", formId: "f-new", type: "scale", text: "Nota", required: true, orderIndex: 1, scaleMin: 0, scaleMax: 5 },
    ]);
    vi.mocked(getFormRepository).mockReturnValue({ create: createSpy } as never);
    vi.mocked(getQuestionRepository).mockReturnValue({ createMany: createManySpy } as never);
    const req = new Request("http://localhost/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Pesquisa",
        description: "Desc",
        slug: "pesquisa-2025",
        allowAnonymous: true,
        questions: [
          { type: "multiple_choice", text: "Escolha", required: true, orderIndex: 0, options: ["A", "B"] },
          { type: "scale", text: "Nota", required: true, orderIndex: 1, scaleMin: 0, scaleMax: 5 },
        ],
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe("f-new");
    expect(createManySpy).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ type: "multiple_choice", options: ["A", "B"] }),
        expect.objectContaining({ type: "scale", scaleMin: 0, scaleMax: 5 }),
      ])
    );
  });
});
