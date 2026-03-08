import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/dashboards/route";
import { GET as getOne, PATCH, DELETE } from "@/app/api/dashboards/[id]/route";

vi.mock("@/infrastructure/database/repositories", () => ({
  getDashboardRepository: vi.fn(),
}));

import { getDashboardRepository } from "@/infrastructure/database/repositories";

describe("GET /api/dashboards", () => {
  beforeEach(() => {
    vi.mocked(getDashboardRepository).mockReturnValue({
      findByCreatedBy: vi.fn().mockResolvedValue([]),
    } as never);
  });

  it("retorna 200 com lista de dashboards", async () => {
    const list = [
      {
        id: "d1",
        title: "Clima",
        createdBy: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        formIds: ["f1"],
      },
    ];
    const repo = {
      findByCreatedBy: vi.fn().mockResolvedValue(list),
    };
    vi.mocked(getDashboardRepository).mockReturnValue(repo as never);
    const req = new Request("http://localhost/api/dashboards");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0].title).toBe("Clima");
  });
});

describe("POST /api/dashboards", () => {
  it("retorna 200 com dashboard criado", async () => {
    const created = {
      id: "d1",
      title: "Novo",
      createdBy: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      formIds: ["550e8400-e29b-41d4-a716-446655440000"],
    };
    vi.mocked(getDashboardRepository).mockReturnValue({
      create: vi.fn().mockResolvedValue(created),
    } as never);
    const req = new Request("http://localhost/api/dashboards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Novo",
        formIds: ["550e8400-e29b-41d4-a716-446655440000"],
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe("d1");
    expect(json.title).toBe("Novo");
  });
});

describe("GET /api/dashboards/[id]", () => {
  it("retorna 404 quando dashboard não existe", async () => {
    vi.mocked(getDashboardRepository).mockReturnValue({
      findById: vi.fn().mockResolvedValue(null),
    } as never);
    const req = new Request("http://localhost/api/dashboards/d1");
    const res = await getOne(req, { params: { id: "d1" } });
    expect(res.status).toBe(404);
  });

  it("retorna 200 com dashboard", async () => {
    const dash = {
      id: "d1",
      title: "Clima",
      createdBy: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      formIds: ["f1", "f2"],
    };
    vi.mocked(getDashboardRepository).mockReturnValue({
      findById: vi.fn().mockResolvedValue(dash),
    } as never);
    const req = new Request("http://localhost/api/dashboards/d1");
    const res = await getOne(req, { params: { id: "d1" } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.title).toBe("Clima");
    expect(json.formIds).toEqual(["f1", "f2"]);
  });
});

describe("PATCH /api/dashboards/[id]", () => {
  it("retorna 404 quando dashboard não existe", async () => {
    vi.mocked(getDashboardRepository).mockReturnValue({
      update: vi.fn().mockResolvedValue(null),
    } as never);
    const req = new Request("http://localhost/api/dashboards/d1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Novo" }),
    });
    const res = await PATCH(req, { params: { id: "d1" } });
    expect(res.status).toBe(404);
  });

  it("retorna 200 com dashboard atualizado", async () => {
    const updated = {
      id: "d1",
      title: "Novo título",
      createdBy: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      formIds: ["f1"],
    };
    vi.mocked(getDashboardRepository).mockReturnValue({
      update: vi.fn().mockResolvedValue(updated),
    } as never);
    const req = new Request("http://localhost/api/dashboards/d1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Novo título" }),
    });
    const res = await PATCH(req, { params: { id: "d1" } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.title).toBe("Novo título");
  });
});

describe("DELETE /api/dashboards/[id]", () => {
  it("retorna 404 quando dashboard não existe", async () => {
    vi.mocked(getDashboardRepository).mockReturnValue({
      delete: vi.fn().mockResolvedValue(false),
    } as never);
    const req = new Request("http://localhost/api/dashboards/d1", { method: "DELETE" });
    const res = await DELETE(req, { params: { id: "d1" } });
    expect(res.status).toBe(404);
  });

  it("retorna 204 quando dashboard é excluído", async () => {
    vi.mocked(getDashboardRepository).mockReturnValue({
      delete: vi.fn().mockResolvedValue(true),
    } as never);
    const req = new Request("http://localhost/api/dashboards/d1", { method: "DELETE" });
    const res = await DELETE(req, { params: { id: "d1" } });
    expect(res.status).toBe(204);
  });
});
