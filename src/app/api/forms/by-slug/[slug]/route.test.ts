import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/forms/by-slug/[slug]/route";

vi.mock("@/infrastructure/database/repositories", () => ({
  getFormRepository: vi.fn(),
  getQuestionRepository: vi.fn(),
}));

import { getFormRepository, getQuestionRepository } from "@/infrastructure/database/repositories";

describe("GET /api/forms/by-slug/[slug]", () => {
  beforeEach(() => {
    vi.mocked(getFormRepository).mockReturnValue({
      findBySlug: vi.fn(),
    } as never);
    vi.mocked(getQuestionRepository).mockReturnValue({
      findByFormId: vi.fn().mockResolvedValue([]),
    } as never);
  });

  it("retorna 404 quando slug não existe", async () => {
    vi.mocked(getFormRepository).mockReturnValue({
      findBySlug: vi.fn().mockResolvedValue(null),
    } as never);
    const req = new Request("http://localhost/api/forms/by-slug/inexistente");
    const res = await GET(req, { params: { slug: "inexistente" } });
    expect(res.status).toBe(404);
  });

  it("retorna 200 com form e questions quando slug existe", async () => {
    const form = {
      id: "f1",
      title: "Pesquisa",
      description: "Desc",
      status: "active",
      version: 1,
      slug: "pesquisa",
      allowAnonymous: false,
      createdBy: "u1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const questions = [
      {
        id: "q1",
        formId: "f1",
        type: "short_text",
        text: "P1",
        required: true,
        orderIndex: 0,
        options: null,
        scaleMin: null,
        scaleMax: null,
        conditionQuestionId: null,
        conditionOperator: null,
        conditionValue: null,
      },
    ];
    vi.mocked(getFormRepository).mockReturnValue({
      findBySlug: vi.fn().mockResolvedValue(form),
    } as never);
    vi.mocked(getQuestionRepository).mockReturnValue({
      findByFormId: vi.fn().mockResolvedValue(questions),
    } as never);
    const req = new Request("http://localhost/api/forms/by-slug/pesquisa");
    const res = await GET(req, { params: { slug: "pesquisa" } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe("f1");
    expect(json.title).toBe("Pesquisa");
    expect(json.questions).toHaveLength(1);
    expect(json.questions[0].text).toBe("P1");
  });
});
