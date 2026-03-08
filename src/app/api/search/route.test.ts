import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/search/route";

vi.mock("@/infrastructure/database/prisma", () => ({
  prisma: {
    form: { findMany: vi.fn() },
    respondent: { findMany: vi.fn() },
    $queryRaw: vi.fn(),
  },
}));

import { prisma } from "@/infrastructure/database/prisma";

describe("GET /api/search", () => {
  beforeEach(() => {
    vi.mocked(prisma.form.findMany).mockResolvedValue([]);
    vi.mocked(prisma.respondent.findMany).mockResolvedValue([]);
    vi.mocked(prisma.$queryRaw).mockResolvedValue([]);
  });

  it("retorna listas vazias quando q está vazio", async () => {
    const req = new Request("http://localhost/api/search");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.forms).toEqual([]);
    expect(json.respondents).toEqual([]);
    expect(json.answerMatches).toEqual([]);
  });

  it("retorna resultados de formulários, respondentes e respostas quando q é informado", async () => {
    vi.mocked(prisma.form.findMany).mockResolvedValue([
      { id: "f1", title: "Pesquisa", status: "draft", createdAt: new Date() },
    ]);
    vi.mocked(prisma.respondent.findMany).mockResolvedValue([
      { id: "r1", name: "Maria", email: "maria@x.com" },
    ]);
    vi.mocked(prisma.$queryRaw).mockResolvedValue([
      {
        id: "a1",
        response_id: "resp1",
        form_id: "f1",
        form_title: "Pesquisa",
        respondent_name: "Maria",
        value: "texto encontrado",
      },
    ]);
    const req = new Request("http://localhost/api/search?q=texto");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.forms).toHaveLength(1);
    expect(json.forms[0].title).toBe("Pesquisa");
    expect(json.respondents).toHaveLength(1);
    expect(json.respondents[0].name).toBe("Maria");
    expect(json.answerMatches).toHaveLength(1);
    expect(json.answerMatches[0].formTitle).toBe("Pesquisa");
    expect(json.answerMatches[0].snippet).toContain("texto encontrado");
  });
});
