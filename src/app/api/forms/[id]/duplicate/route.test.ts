import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/forms/[id]/duplicate/route";

vi.mock("@/infrastructure/database/repositories", () => ({
  getFormRepository: vi.fn(),
  getQuestionRepository: vi.fn(),
  getAuditLogRepository: vi.fn(),
  getFormRevisionRepository: vi.fn(),
}));

vi.mock("@/lib/auth-session", () => ({
  getCreatedBy: vi.fn().mockResolvedValue("admin-1"),
  getSession: vi.fn().mockResolvedValue(null),
}));

import {
  getFormRepository,
  getQuestionRepository,
  getAuditLogRepository,
  getFormRevisionRepository,
} from "@/infrastructure/database/repositories";

describe("POST /api/forms/[id]/duplicate", () => {
  beforeEach(() => {
    vi.mocked(getFormRepository).mockReturnValue({
      findById: vi.fn(),
      duplicate: vi.fn(),
    } as never);
    vi.mocked(getQuestionRepository).mockReturnValue({
      findByFormId: vi.fn(),
      createMany: vi.fn(),
      updateMany: vi.fn(),
    } as never);
    vi.mocked(getAuditLogRepository).mockReturnValue({
      create: vi.fn().mockResolvedValue({}),
    } as never);
    vi.mocked(getFormRevisionRepository).mockReturnValue({
      create: vi.fn().mockResolvedValue({}),
    } as never);
  });

  it("retorna 404 quando formulário não existe", async () => {
    vi.mocked(getFormRepository).mockReturnValue({
      findById: vi.fn().mockResolvedValue(null),
      duplicate: vi.fn(),
    } as never);
    const req = new Request("http://localhost/api/forms/f1/duplicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req, { params: { id: "f1" } });
    expect(res.status).toBe(404);
  });

  it("retorna 200 com novo form duplicado", async () => {
    const duplicated = {
      id: "f2",
      title: "Form (cópia)",
      description: undefined,
      status: "draft" as const,
      version: 1,
      createdBy: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(getFormRepository).mockReturnValue({
      findById: vi.fn().mockResolvedValue({ id: "f1", title: "Original" }),
      duplicate: vi.fn().mockResolvedValue(duplicated),
    } as never);
    vi.mocked(getQuestionRepository).mockReturnValue({
      findByFormId: vi.fn().mockResolvedValue([]),
      createMany: vi.fn().mockResolvedValue([]),
      updateMany: vi.fn(),
    } as never);
    const req = new Request("http://localhost/api/forms/f1/duplicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(req, { params: { id: "f1" } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe("f2");
    expect(json.title).toContain("cópia");
  });
});
