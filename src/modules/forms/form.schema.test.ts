import { describe, it, expect } from "vitest";
import { createFormSchema } from "./form.schema";

describe("createFormSchema", () => {
  it("valida payload mínimo com título e uma pergunta", () => {
    const result = createFormSchema.parse({
      title: "Form 1",
      questions: [
        { type: "short_text", text: "P1?", required: true, orderIndex: 0 },
      ],
    });
    expect(result.title).toBe("Form 1");
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].type).toBe("short_text");
    expect(result.questions[0].text).toBe("P1?");
    expect(result.questions[0].required).toBe(true);
    expect(result.questions[0].orderIndex).toBe(0);
  });

  it("aceita description opcional", () => {
    const result = createFormSchema.parse({
      title: "Form",
      description: "Desc",
      questions: [
        { type: "yes_no", text: "Ok?", required: false, orderIndex: 0 },
      ],
    });
    expect(result.description).toBe("Desc");
  });

  it("rejeita título com menos de 3 caracteres", () => {
    expect(() =>
      createFormSchema.parse({
        title: "ab",
        questions: [
          { type: "short_text", text: "P1", required: true, orderIndex: 0 },
        ],
      })
    ).toThrow();
  });

  it("rejeita questions vazio", () => {
    expect(() =>
      createFormSchema.parse({
        title: "Form",
        questions: [],
      })
    ).toThrow();
  });

  it("aceita scale com scaleMin e scaleMax", () => {
    const result = createFormSchema.parse({
      title: "Form",
      questions: [
        {
          type: "scale",
          text: "Nota?",
          required: true,
          orderIndex: 0,
          scaleMin: 1,
          scaleMax: 5,
        },
      ],
    });
    expect(result.questions[0].scaleMin).toBe(1);
    expect(result.questions[0].scaleMax).toBe(5);
  });

  it("aceita multiple_choice com options", () => {
    const result = createFormSchema.parse({
      title: "Form",
      questions: [
        {
          type: "multiple_choice",
          text: "Escolha uma opção",
          required: true,
          orderIndex: 0,
          options: ["Opção A", "Opção B", "Opção C"],
        },
      ],
    });
    expect(result.questions[0].type).toBe("multiple_choice");
    expect(result.questions[0].options).toEqual(["Opção A", "Opção B", "Opção C"]);
  });

  it("aceita checkbox com options", () => {
    const result = createFormSchema.parse({
      title: "Form",
      questions: [
        {
          type: "checkbox",
          text: "Marque as opções",
          required: false,
          orderIndex: 0,
          options: ["Item 1", "Item 2"],
        },
      ],
    });
    expect(result.questions[0].type).toBe("checkbox");
    expect(result.questions[0].options).toEqual(["Item 1", "Item 2"]);
  });

  it("aceita slug e allowAnonymous no create", () => {
    const result = createFormSchema.parse({
      title: "Form",
      slug: "pesquisa-2025",
      allowAnonymous: true,
      questions: [{ type: "short_text", text: "P1", required: false, orderIndex: 0 }],
    });
    expect(result.slug).toBe("pesquisa-2025");
    expect(result.allowAnonymous).toBe(true);
  });
});
