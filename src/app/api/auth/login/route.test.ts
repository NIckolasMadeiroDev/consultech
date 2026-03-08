import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/auth/login/route";

vi.mock("bcryptjs", () => ({
  compare: vi.fn().mockResolvedValue(true),
  hash: vi.fn().mockResolvedValue("hashed"),
}));

vi.mock("@/infrastructure/database/prisma", () => ({
  prisma: {
    admin: {
      findUnique: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

vi.mock("@/lib/auth-session", () => ({
  createSession: vi.fn().mockResolvedValue("token-123"),
  getSessionCookieName: vi.fn().mockReturnValue("session"),
  getSessionCookieOptions: vi.fn().mockReturnValue({ httpOnly: true, path: "/" }),
}));

import { prisma } from "@/infrastructure/database/prisma";

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    const { compare } = await import("bcryptjs");
    vi.mocked(compare).mockResolvedValue(true);
    vi.mocked(prisma.admin.findUnique).mockResolvedValue({
      id: "admin-1",
      email: "admin@test.com",
      name: "Admin",
      passwordHash: "$2a$10$existing",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it("retorna 400 quando email está vazio", async () => {
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "", password: "senha123" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("obrigatórios");
  });

  it("retorna 400 quando password está vazio", async () => {
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@test.com", password: "" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("retorna 401 quando admin não existe", async () => {
    vi.mocked(prisma.admin.findUnique).mockResolvedValue(null);
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "naoexiste@test.com", password: "senha" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toContain("Credenciais inválidas");
  });

  it("retorna 401 quando senha não confere", async () => {
    const { compare } = await import("bcryptjs");
    vi.mocked(compare).mockResolvedValue(false);
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@test.com", password: "senhaerrada" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toContain("Credenciais inválidas");
  });

  it("retorna 200 com user e seta cookie quando credenciais válidas", async () => {
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@test.com", password: "senha123" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.user).toEqual({ id: "admin-1", email: "admin@test.com", name: "Admin" });
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain("session=");
  });
});
