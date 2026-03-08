import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/forms/[id]/responses/summary/route";

vi.mock("@/infrastructure/database/repositories", () => ({
  getFormRepository: vi.fn(),
  getResponseRepository: vi.fn(),
}));

import { getFormRepository, getResponseRepository } from "@/infrastructure/database/repositories";

describe("GET /api/forms/[id]/responses/summary", () => {
  beforeEach(() => {
    vi.mocked(getFormRepository).mockReturnValue({ findById: vi.fn() } as never);
    vi.mocked(getResponseRepository).mockReturnValue({
      getSummaryByFormId: vi.fn(),
    } as never);
  });

  it("retorna 404 quando formulário não existe", async () => {
    vi.mocked(getFormRepository).mockReturnValue({
      findById: vi.fn().mockResolvedValue(null),
    } as never);
    const req = new Request("http://localhost/api/forms/f1/responses/summary");
    const res = await GET(req, { params: { id: "f1" } });
    expect(res.status).toBe(404);
  });

  it("retorna 200 com count e lastSubmittedAt", async () => {
    vi.mocked(getFormRepository).mockReturnValue({
      findById: vi.fn().mockResolvedValue({ id: "f1" }),
    } as never);
    const lastDate = new Date("2025-03-01T12:00:00.000Z");
    vi.mocked(getResponseRepository).mockReturnValue({
      getSummaryByFormId: vi.fn().mockResolvedValue({ count: 42, lastSubmittedAt: lastDate }),
    } as never);
    const req = new Request("http://localhost/api/forms/f1/responses/summary");
    const res = await GET(req, { params: { id: "f1" } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.count).toBe(42);
    expect(json.lastSubmittedAt).toBe("2025-03-01T12:00:00.000Z");
  });

  it("retorna lastSubmittedAt null quando não há respostas", async () => {
    vi.mocked(getFormRepository).mockReturnValue({
      findById: vi.fn().mockResolvedValue({ id: "f1" }),
    } as never);
    vi.mocked(getResponseRepository).mockReturnValue({
      getSummaryByFormId: vi.fn().mockResolvedValue({ count: 0, lastSubmittedAt: null }),
    } as never);
    const req = new Request("http://localhost/api/forms/f1/responses/summary");
    const res = await GET(req, { params: { id: "f1" } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.count).toBe(0);
    expect(json.lastSubmittedAt).toBeNull();
  });

  it("passa startDate e endDate para getSummaryByFormId quando informados na query", async () => {
    vi.mocked(getFormRepository).mockReturnValue({
      findById: vi.fn().mockResolvedValue({ id: "f1" }),
    } as never);
    const getSummary = vi.fn().mockResolvedValue({ count: 2, lastSubmittedAt: new Date("2025-03-01") });
    vi.mocked(getResponseRepository).mockReturnValue({
      getSummaryByFormId: getSummary,
    } as never);
    const req = new Request(
      "http://localhost/api/forms/f1/responses/summary?startDate=2025-01-01T00:00:00.000Z&endDate=2025-03-01T23:59:59.999Z"
    );
    const res = await GET(req, { params: { id: "f1" } });
    expect(res.status).toBe(200);
    expect(getSummary).toHaveBeenCalledWith("f1", {
      startDate: new Date("2025-01-01T00:00:00.000Z"),
      endDate: new Date("2025-03-01T23:59:59.999Z"),
    });
  });
});
