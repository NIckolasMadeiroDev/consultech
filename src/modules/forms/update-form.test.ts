import { describe, it, expect, vi } from "vitest";
import { updateForm } from "./update-form";

describe("updateForm", () => {
  it("deve lançar erro quando formulário não existe", async () => {
    const formRepo = {
      findById: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
    };
    await expect(
      updateForm(
        "form-1",
        { title: "Novo título" },
        formRepo as never
      )
    ).rejects.toThrow("Form not found");
    expect(formRepo.update).not.toHaveBeenCalled();
  });

  it("deve lançar erro quando título está vazio", async () => {
    const formRepo = {
      findById: vi.fn().mockResolvedValue({
        id: "form-1",
        title: "Form",
        status: "draft",
      }),
      update: vi.fn(),
    };
    await expect(
      updateForm("form-1", { title: "" }, formRepo as never)
    ).rejects.toThrow("Title cannot be empty");
    expect(formRepo.update).not.toHaveBeenCalled();
  });

  it("deve atualizar formulário com dados válidos", async () => {
    const existingForm = {
      id: "form-1",
      title: "Form",
      description: "Desc",
      status: "draft",
      version: 1,
      createdBy: "admin-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedForm = { ...existingForm, title: "Novo título", updatedAt: new Date() };
    const formRepo = {
      findById: vi.fn().mockResolvedValue(existingForm),
      update: vi.fn().mockResolvedValue(updatedForm),
    };
    const result = await updateForm(
      "form-1",
      { title: "Novo título" },
      formRepo as never
    );
    expect(result).toEqual(updatedForm);
    expect(formRepo.update).toHaveBeenCalledWith("form-1", { title: "Novo título" });
  });
});
