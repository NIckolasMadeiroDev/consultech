import { describe, it, expect } from "vitest";
import { submitResponseSchema } from "./response.schema";

describe("submitResponseSchema", () => {
  it("valida payload com formId, respondent e answers", () => {
    const result = submitResponseSchema.parse({
      formId: "550e8400-e29b-41d4-a716-446655440000",
      respondent: { name: "João", email: "joao@empresa.com" },
      answers: [
        { questionId: "550e8400-e29b-41d4-a716-446655440001", value: "R1" },
      ],
    });
    expect(result.formId).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(result.respondent.name).toBe("João");
    expect(result.respondent.email).toBe("joao@empresa.com");
    expect(result.answers).toHaveLength(1);
    expect(result.answers[0].value).toBe("R1");
  });

  it("aceita respondent com employeeId e department", () => {
    const result = submitResponseSchema.parse({
      formId: "550e8400-e29b-41d4-a716-446655440000",
      respondent: {
        name: "Maria",
        email: "maria@empresa.com",
        employeeId: "E001",
        department: "TI",
      },
      answers: [
        { questionId: "550e8400-e29b-41d4-a716-446655440001", value: 5 },
      ],
    });
    expect(result.respondent.employeeId).toBe("E001");
    expect(result.respondent.department).toBe("TI");
    expect(result.answers[0].value).toBe(5);
  });

  it("rejeita formId inválido (não UUID)", () => {
    expect(() =>
      submitResponseSchema.parse({
        formId: "not-uuid",
        respondent: { name: "A", email: "a@b.com" },
        answers: [{ questionId: "550e8400-e29b-41d4-a716-446655440001", value: "x" }],
      })
    ).toThrow();
  });

  it("rejeita answers vazio", () => {
    expect(() =>
      submitResponseSchema.parse({
        formId: "550e8400-e29b-41d4-a716-446655440000",
        respondent: { name: "A", email: "a@b.com" },
        answers: [],
      })
    ).toThrow();
  });

  it("aceita payload sem respondent (respostas anônimas)", () => {
    const result = submitResponseSchema.parse({
      formId: "550e8400-e29b-41d4-a716-446655440000",
      answers: [
        { questionId: "550e8400-e29b-41d4-a716-446655440001", value: "R1" },
      ],
    });
    expect(result.formId).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(result.respondent).toBeUndefined();
    expect(result.answers).toHaveLength(1);
  });
});
