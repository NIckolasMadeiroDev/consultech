import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/forms/[id]/responses/route";

vi.mock("@/infrastructure/database/repositories", () => ({
  getFormRepository: vi.fn(),
  getResponseRepository: vi.fn(),
  getRespondentRepository: vi.fn(),
}));

import {
  getFormRepository,
  getResponseRepository,
  getRespondentRepository,
} from "@/infrastructure/database/repositories";

describe("GET /api/forms/[id]/responses", () => {
  beforeEach(() => {
    vi.mocked(getFormRepository).mockReturnValue({ findById: vi.fn() } as never);
    vi.mocked(getResponseRepository).mockReturnValue({
      findByFormId: vi.fn(),
      getAnswersByResponseId: vi.fn(),
    } as never);
    vi.mocked(getRespondentRepository).mockReturnValue({
      findById: vi.fn(),
    } as never);
  });

  it("retorna 404 quando formulário não existe", async () => {
    vi.mocked(getFormRepository).mockReturnValue({
      findById: vi.fn().mockResolvedValue(null),
    } as never);
    const req = new Request("http://localhost/api/forms/f1/responses");
    const res = await GET(req, { params: { id: "f1" } });
    expect(res.status).toBe(404);
  });

  it("retorna 200 com lista de respostas", async () => {
    vi.mocked(getFormRepository).mockReturnValue({
      findById: vi.fn().mockResolvedValue({ id: "f1" }),
    } as never);
    const responses = [
      {
        id: "r1",
        formId: "f1",
        respondentId: "resp1",
        submittedAt: new Date(),
      },
    ];
    vi.mocked(getResponseRepository).mockReturnValue({
      findByFormId: vi.fn().mockResolvedValue(responses),
      getAnswersByResponseId: vi.fn().mockResolvedValue([{ questionId: "q1", value: "R1" }]),
    } as never);
    vi.mocked(getRespondentRepository).mockReturnValue({
      findById: vi.fn().mockResolvedValue({
        id: "resp1",
        name: "João",
        email: "joao@e.com",
        createdAt: new Date(),
      }),
    } as never);
    const req = new Request("http://localhost/api/forms/f1/responses");
    const res = await GET(req, { params: { id: "f1" } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0].respondent?.name).toBe("João");
    expect(json[0].answers).toHaveLength(1);
  });
});
