import { describe, it, expect, vi } from "vitest";
import { archiveForm } from "./archive-form";

describe("archiveForm", () => {
  it("deve lançar erro quando formulário não existe", async () => {
    const formRepo = { findById: vi.fn().mockResolvedValue(null), update: vi.fn() };
    await expect(
      archiveForm("form-1", formRepo as never)
    ).rejects.toThrow("Form not found");
    expect(formRepo.update).not.toHaveBeenCalled();
  });

  it("deve atualizar status para archived", async () => {
    const form = {
      id: "form-1",
      title: "Form",
      status: "active",
      version: 1,
      createdBy: "admin-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const archivedForm = { ...form, status: "archived" as const };
    const formRepo = {
      findById: vi.fn().mockResolvedValue(form),
      update: vi.fn().mockResolvedValue(archivedForm),
    };
    const result = await archiveForm("form-1", formRepo as never);
    expect(result.status).toBe("archived");
    expect(formRepo.update).toHaveBeenCalledWith("form-1", { status: "archived" });
  });
});
