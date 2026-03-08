import { describe, it, expect, vi } from "vitest";
import { duplicateForm } from "./duplicate-form";

describe("duplicateForm", () => {
  it("deve lançar erro quando formulário não existe", async () => {
    const formRepo = {
      findById: vi.fn().mockResolvedValue(null),
      duplicate: vi.fn(),
    };
    const questionRepo = { findByFormId: vi.fn(), createMany: vi.fn() };
    await expect(
      duplicateForm("form-1", "admin-1", formRepo as never, questionRepo as never)
    ).rejects.toThrow("Form not found");
    expect(formRepo.duplicate).not.toHaveBeenCalled();
  });

  it("deve duplicar formulário e perguntas", async () => {
    const originalForm = {
      id: "form-1",
      title: "Form Original",
      description: "Desc",
      status: "active",
      version: 1,
      createdBy: "admin-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const duplicatedForm = {
      id: "form-2",
      title: "Form Original (cópia)",
      description: "Desc",
      status: "draft",
      version: 1,
      createdBy: "admin-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const questions = [
      {
        id: "q1",
        formId: "form-1",
        type: "short_text" as const,
        text: "P1",
        required: true,
        orderIndex: 0,
      },
    ];
    const formRepo = {
      findById: vi.fn().mockResolvedValue(originalForm),
      duplicate: vi.fn().mockResolvedValue(duplicatedForm),
    };
    const questionRepo = {
      findByFormId: vi.fn().mockResolvedValue(questions),
      createMany: vi.fn().mockResolvedValue([]),
    };
    const result = await duplicateForm(
      "form-1",
      "admin-1",
      formRepo as never,
      questionRepo as never
    );
    expect(result).toEqual(duplicatedForm);
    expect(formRepo.duplicate).toHaveBeenCalledWith("form-1", "admin-1");
    expect(questionRepo.findByFormId).toHaveBeenCalledWith("form-1");
    expect(questionRepo.createMany).toHaveBeenCalled();
  });
});
