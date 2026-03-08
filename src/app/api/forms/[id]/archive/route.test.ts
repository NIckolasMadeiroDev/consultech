import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as archivePost } from "@/app/api/forms/[id]/archive/route";

vi.mock("@/infrastructure/database/repositories", () => ({
  getFormRepository: vi.fn(),
  getQuestionRepository: vi.fn(),
  getAuditLogRepository: vi.fn(),
}));

import { getFormRepository, getAuditLogRepository } from "@/infrastructure/database/repositories";

describe("POST /api/forms/[id]/archive", () => {
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
    const req = new Request("http://localhost/api/forms/f1/archive", {
      method: "POST",
    });
    const res = await archivePost(req, { params: { id: "f1" } });
    expect(res.status).toBe(404);
  });

  it("retorna 200 com form arquivado", async () => {
    const archived = {
      id: "f1",
      title: "F",
      description: undefined,
      status: "archived" as const,
      version: 1,
      createdBy: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(getFormRepository).mockReturnValue({
      findById: vi.fn().mockResolvedValue({ id: "f1" }),
      update: vi.fn().mockResolvedValue(archived),
    } as never);
    const req = new Request("http://localhost/api/forms/f1/archive", {
      method: "POST",
    });
    const res = await archivePost(req, { params: { id: "f1" } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("archived");
  });
});
