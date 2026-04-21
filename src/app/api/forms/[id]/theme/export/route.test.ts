import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/forms/[id]/theme/export/route";

vi.mock("@/infrastructure/database/repositories", () => ({
  getFormRepository: vi.fn(),
}));

vi.mock("@/lib/auth-session", () => ({
  getSession: vi.fn(),
}));

import { getFormRepository } from "@/infrastructure/database/repositories";
import { getSession } from "@/lib/auth-session";
import { DEFAULT_FORM_THEME } from "@/types/form-theme-defaults";

describe("GET /api/forms/[id]/theme/export", () => {
  beforeEach(() => {
    vi.mocked(getSession).mockResolvedValue({ id: "admin-1" } as never);
  });

  it("401 sem sessão", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);
    const res = await GET(new Request("http://localhost/api/forms/f1/theme/export"), {
      params: { id: "f1" },
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("200 com attachment json", async () => {
    vi.mocked(getFormRepository).mockReturnValue({
      findById: vi.fn().mockResolvedValue({
        id: "f1",
        theme: DEFAULT_FORM_THEME,
      }),
    } as never);
    const res = await GET(new Request("http://localhost/api/forms/f1/theme/export"), {
      params: { id: "f1" },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Disposition")).toContain("attachment");
    const body = await res.json();
    expect(body.version).toBe(1);
    expect(body.theme).toBeDefined();
  });
});
