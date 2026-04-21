import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/forms/[id]/theme/import/route";

vi.mock("@/infrastructure/database/repositories", () => ({
  getFormRepository: vi.fn(),
  getAuditLogRepository: vi.fn(),
}));

vi.mock("@/lib/auth-session", () => ({
  getSession: vi.fn(),
}));

vi.mock("@/modules/forms/update-form", () => ({
  updateForm: vi.fn(),
}));

import { getAuditLogRepository } from "@/infrastructure/database/repositories";
import { getSession } from "@/lib/auth-session";
import { updateForm } from "@/modules/forms/update-form";
import { DEFAULT_FORM_THEME } from "@/types/form-theme-defaults";

describe("POST /api/forms/[id]/theme/import", () => {
  beforeEach(() => {
    vi.mocked(getSession).mockResolvedValue({ id: "admin-1" } as never);
    vi.mocked(getAuditLogRepository).mockReturnValue({
      create: vi.fn(),
    } as never);
  });

  it("401 sem sessão", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);
    const res = await POST(
      new Request("http://localhost/api/forms/f1/theme/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: {} }),
      }),
      { params: { id: "f1" } }
    );
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("200 atualiza tema", async () => {
    vi.mocked(updateForm).mockResolvedValue({
      id: "f1",
      title: "T",
      description: undefined,
      status: "draft",
      version: 1,
      slug: undefined,
      allowAnonymous: false,
      theme: DEFAULT_FORM_THEME,
      submitButtonText: "Enviar",
      createdBy: "admin-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    const res = await POST(
      new Request("http://localhost/api/forms/f1/theme/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: { colors: { primary: "#111111" } } }),
      }),
      { params: { id: "f1" } }
    );
    expect(res.status).toBe(200);
    expect(updateForm).toHaveBeenCalled();
  });
});
