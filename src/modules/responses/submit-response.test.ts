import { describe, it, expect, vi } from "vitest";
import { submitResponse } from "./submit-response";
import { FormPausedError } from "./form-paused-error";
import { defaultFormResponseSettings } from "@/types/form-response-settings";

const mockQuestionShortText = {
  id: "q1",
  formId: "form-1",
  type: "short_text" as const,
  text: "Pergunta 1",
  required: true,
  orderIndex: 0,
};

const questionsRepo = {
  findByFormId: vi.fn().mockResolvedValue([mockQuestionShortText]),
};

const rs = {
  required: defaultFormResponseSettings(false),
  anonymous: defaultFormResponseSettings(true),
  optional: {
    ...defaultFormResponseSettings(false),
    respondentIdentificationMode: "optional" as const,
  },
};

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
        responseRepo as never,
        questionsRepo as never
      )
    ).rejects.toThrow("Form not found");
  });

  it("deve lançar FormPausedError quando formulário está pausado", async () => {
    const formRepo = {
      findById: vi.fn().mockResolvedValue({
        id: "form-1",
        status: "paused",
        pausedMessage: "Voltamos segunda",
        responseSettings: rs.required,
      }),
    };
    let err: unknown;
    try {
      await submitResponse(
        {
          formId: "form-1",
          respondent: { name: "João", email: "joao@empresa.com" },
          answers: [{ questionId: "q1", value: "R1" }],
        },
        formRepo as never,
        {} as never,
        {} as never,
        questionsRepo as never
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(FormPausedError);
    expect((err as FormPausedError).pausedMessage).toBe("Voltamos segunda");
  });

  it("deve lançar erro quando formulário está arquivado", async () => {
    const formRepo = {
      findById: vi.fn().mockResolvedValue({
        id: "form-1",
        status: "archived",
        responseSettings: rs.required,
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
        {} as never,
        questionsRepo as never
      )
    ).rejects.toThrow("Form does not accept responses");
  });

  it("deve criar respondente e resposta quando dados válidos", async () => {
    const formRepo = {
      findById: vi.fn().mockResolvedValue({
        id: "form-1",
        status: "active",
        responseSettings: rs.required,
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
      responseRepo as never,
      questionsRepo as never
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
      attachments: undefined,
      submissionMetadata: { respondentIdentificationMode: "required" },
    });
  });

  it("deve gravar resposta sem respondente em modo anónimo", async () => {
    const formRepo = {
      findById: vi.fn().mockResolvedValue({
        id: "form-1",
        status: "active",
        allowAnonymous: true,
        responseSettings: rs.anonymous,
      }),
    };
    const response = {
      id: "r1",
      formId: "form-1",
      respondentId: null,
      submittedAt: new Date(),
    };
    const respondentRepo = { create: vi.fn() };
    const responseRepo = { create: vi.fn().mockResolvedValue(response) };
    const result = await submitResponse(
      {
        formId: "form-1",
        answers: [{ questionId: "q1", value: "R1" }],
      },
      formRepo as never,
      respondentRepo as never,
      responseRepo as never,
      questionsRepo as never
    );
    expect(result).toEqual(response);
    expect(respondentRepo.create).not.toHaveBeenCalled();
    expect(responseRepo.create).toHaveBeenCalledWith({
      formId: "form-1",
      respondentId: null,
      answers: [{ questionId: "q1", value: "R1" }],
      attachments: undefined,
      submissionMetadata: { respondentIdentificationMode: "anonymous" },
    });
  });

  it("deve lançar erro quando sem respondent e form não permite anônimo", async () => {
    const formRepo = {
      findById: vi.fn().mockResolvedValue({
        id: "form-1",
        status: "active",
        allowAnonymous: false,
        responseSettings: rs.required,
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
        {} as never,
        questionsRepo as never
      )
    ).rejects.toThrow("Respondent data is required");
  });
});
