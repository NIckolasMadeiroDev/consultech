import { describe, it, expect, vi } from "vitest";
import { submitResponse } from "./submit-response";

describe("submitResponse", () => {
  it("deve lançar erro quando formulário não existe", async () => {
    const formRepo = { findById: vi.fn().mockResolvedValue(null) };
    const respondentRepo = { create: vi.fn() };
    const responseRepo = { create: vi.fn() };
    await expect(
      submitResponse(
        {
          formId: "form-1",
          respondent: { name: "João", email: "joao@empresa.com" },
          answers: [{ questionId: "q1", value: "R1" }],
        },
        formRepo as never,
        respondentRepo as never,
        responseRepo as never
      )
    ).rejects.toThrow("Form not found");
  });

  it("deve lançar erro quando formulário está arquivado", async () => {
    const formRepo = {
      findById: vi.fn().mockResolvedValue({
        id: "form-1",
        status: "archived",
      }),
    };
    await expect(
      submitResponse(
        {
          formId: "form-1",
          respondent: { name: "João", email: "joao@empresa.com" },
          answers: [{ questionId: "q1", value: "R1" }],
        },
        formRepo as never,
        {} as never,
        {} as never
      )
    ).rejects.toThrow("Form does not accept responses");
  });

  it("deve criar respondente e resposta quando dados válidos", async () => {
    const formRepo = {
      findById: vi.fn().mockResolvedValue({
        id: "form-1",
        status: "active",
      }),
    };
    const respondent = {
      id: "resp-1",
      name: "João",
      email: "joao@empresa.com",
      createdAt: new Date(),
    };
    const response = {
      id: "r1",
      formId: "form-1",
      respondentId: "resp-1",
      submittedAt: new Date(),
    };
    const respondentRepo = {
      create: vi.fn().mockResolvedValue(respondent),
    };
    const responseRepo = {
      create: vi.fn().mockResolvedValue(response),
    };
    const result = await submitResponse(
      {
        formId: "form-1",
        respondent: { name: "João", email: "joao@empresa.com" },
        answers: [{ questionId: "q1", value: "R1" }],
      },
      formRepo as never,
      respondentRepo as never,
      responseRepo as never
    );
    expect(result).toEqual(response);
    expect(respondentRepo.create).toHaveBeenCalledWith({
      name: "João",
      email: "joao@empresa.com",
    });
    expect(responseRepo.create).toHaveBeenCalledWith({
      formId: "form-1",
      respondentId: "resp-1",
      answers: [{ questionId: "q1", value: "R1" }],
    });
  });

  it("deve criar respondente anônimo quando allowAnonymous e sem respondent", async () => {
    const formRepo = {
      findById: vi.fn().mockResolvedValue({
        id: "form-1",
        status: "active",
        allowAnonymous: true,
      }),
    };
    const respondent = {
      id: "anon-1",
      name: "Anônimo",
      email: expect.stringMatching(/^anonymous-[a-f0-9-]+@anonymous\.local$/),
      createdAt: new Date(),
    };
    const response = {
      id: "r1",
      formId: "form-1",
      respondentId: "anon-1",
      submittedAt: new Date(),
    };
    const respondentRepo = { create: vi.fn().mockResolvedValue(respondent) };
    const responseRepo = { create: vi.fn().mockResolvedValue(response) };
    const result = await submitResponse(
      {
        formId: "form-1",
        answers: [{ questionId: "q1", value: "R1" }],
      },
      formRepo as never,
      respondentRepo as never,
      responseRepo as never
    );
    expect(result).toEqual(response);
    expect(respondentRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Anônimo",
        email: expect.stringMatching(/^anonymous-[a-f0-9-]+@anonymous\.local$/),
      })
    );
  });

  it("deve lançar erro quando sem respondent e form não permite anônimo", async () => {
    const formRepo = {
      findById: vi.fn().mockResolvedValue({
        id: "form-1",
        status: "active",
        allowAnonymous: false,
      }),
    };
    await expect(
      submitResponse(
        {
          formId: "form-1",
          answers: [{ questionId: "q1", value: "R1" }],
        },
        formRepo as never,
        {} as never,
        {} as never
      )
    ).rejects.toThrow("Respondent data is required");
  });
});
