import { describe, it, expect, vi } from "vitest";
import { createForm } from "./create-form";

describe("createForm", () => {
  it("deve lançar erro quando título está vazio", async () => {
    const repo = {
      create: vi.fn(),
    };
    await expect(
      createForm(
        {
          title: "",
          description: "Desc",
          questions: [
            { type: "short_text", text: "P1", required: true, orderIndex: 0 },
          ],
        },
        "admin-1",
        repo as never
      )
    ).rejects.toThrow("Title required");
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("deve lançar erro quando não há perguntas respondíveis", async () => {
    const repo = { create: vi.fn() };
    await expect(
      createForm(
        {
          title: "Form 1",
          description: "Desc",
          questions: [],
        },
        "admin-1",
        repo as never
      )
    ).rejects.toThrow("At least one question required");
    expect(repo.create).not.toHaveBeenCalled();
    await expect(
      createForm(
        {
          title: "Form 1",
          description: "Desc",
          questions: [{ type: "section", text: "A", required: false, orderIndex: 0 }],
        },
        "admin-1",
        repo as never
      )
    ).rejects.toThrow("At least one question required");
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("deve criar formulário com dados válidos", async () => {
    const createdForm = {
      id: "form-1",
      title: "Form 1",
      description: "Desc",
      status: "draft",
      version: 1,
      createdBy: "admin-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const formRepo = {
      create: vi.fn().mockResolvedValue(createdForm),
    };
    const questionRepo = {
      createMany: vi.fn().mockResolvedValue([
        {
          id: "q1",
          formId: "form-1",
          type: "short_text",
          text: "P1",
          required: true,
          orderIndex: 0,
        },
      ]),
    };
    const result = await createForm(
      {
        title: "Form 1",
        description: "Desc",
        questions: [
          { type: "short_text", text: "P1", required: true, orderIndex: 0 },
        ],
      },
      "admin-1",
      formRepo as never,
      questionRepo as never
    );
    expect(result).toEqual(createdForm);
    expect(formRepo.create).toHaveBeenCalledWith({
      title: "Form 1",
      description: "Desc",
      closingMessage: undefined,
      folderId: undefined,
      isTemplate: false,
      createdBy: "admin-1",
      slug: undefined,
      allowAnonymous: false,
      status: "draft",
    });
    expect(questionRepo.createMany).toHaveBeenCalled();
  });
});
