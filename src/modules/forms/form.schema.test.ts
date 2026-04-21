import { describe, it, expect } from "vitest";
import { createFormSchema, updateFormSchema } from "./form.schema";

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

  it("aceita dropdown com options", () => {
    const result = createFormSchema.parse({
      title: "Form",
      questions: [
        {
          type: "dropdown",
          text: "Escolha",
          required: true,
          orderIndex: 0,
          options: ["A", "B"],
        },
      ],
    });
    expect(result.questions[0].type).toBe("dropdown");
    expect(result.questions[0].options).toEqual(["A", "B"]);
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

  it("aceita seção junto com pergunta respondível", () => {
    const result = createFormSchema.parse({
      title: "Form",
      questions: [
        { type: "section", text: "Bloco A", required: false, orderIndex: 0 },
        { type: "short_text", text: "Nome?", required: true, orderIndex: 1 },
      ],
    });
    expect(result.questions[0].type).toBe("section");
    expect(result.questions[1].type).toBe("short_text");
  });

  it("rejeita apenas seções sem pergunta", () => {
    expect(() =>
      createFormSchema.parse({
        title: "Form",
        questions: [{ type: "section", text: "Só seção", required: false, orderIndex: 0 }],
      })
    ).toThrow();
  });

  it("aceita closingMessage opcional", () => {
    const result = createFormSchema.parse({
      title: "Form",
      closingMessage: "Valeu!",
      questions: [{ type: "short_text", text: "P1", required: false, orderIndex: 0 }],
    });
    expect(result.closingMessage).toBe("Valeu!");
  });

  it("default initialStatus é draft", () => {
    const result = createFormSchema.parse({
      title: "Form",
      questions: [{ type: "short_text", text: "P1", required: false, orderIndex: 0 }],
    });
    expect(result.initialStatus).toBe("draft");
  });

  it("aceita initialStatus active", () => {
    const result = createFormSchema.parse({
      title: "Form",
      initialStatus: "active",
      questions: [{ type: "short_text", text: "P1", required: false, orderIndex: 0 }],
    });
    expect(result.initialStatus).toBe("active");
  });

  it("aceita bloco de texto formatado com HTML", () => {
    const result = createFormSchema.parse({
      title: "Form",
      questions: [
        {
          type: "text_block",
          text: "Nota",
          required: false,
          orderIndex: 0,
          contentHtml: "<p>Olá <strong>mundo</strong></p>",
        },
        { type: "short_text", text: "Nome?", required: true, orderIndex: 1 },
      ],
    });
    expect(result.questions[0].type).toBe("text_block");
    expect(result.questions[0].contentHtml).toContain("<p>");
  });

  it("rejeita formulário só com blocos sem pergunta respondível", () => {
    expect(() =>
      createFormSchema.parse({
        title: "Form",
        questions: [
          {
            type: "text_block",
            text: "A",
            required: false,
            orderIndex: 0,
            contentHtml: "<p>x</p>",
          },
        ],
      })
    ).toThrow();
  });

  it("aceita campos de descrição e ajuda nas perguntas", () => {
    const result = createFormSchema.parse({
      title: "Form",
      questions: [
        {
          type: "section",
          text: "Bloco",
          required: false,
          orderIndex: 0,
          sectionTitle: "Título visível",
          sectionDescription: "Texto da secção.",
        },
        {
          type: "short_text",
          text: "Nome?",
          required: true,
          orderIndex: 1,
          helpText: "Como no documento.",
          placeholder: "Ex.: Maria Silva",
        },
      ],
    });
    expect(result.questions[0].sectionTitle).toBe("Título visível");
    expect(result.questions[0].sectionDescription).toBe("Texto da secção.");
    expect(result.questions[1].helpText).toBe("Como no documento.");
    expect(result.questions[1].placeholder).toBe("Ex.: Maria Silva");
  });
});

describe("updateFormSchema", () => {
  it("aceita questions com campos opcionais de descrição", () => {
    const result = updateFormSchema.parse({
      title: "Form upd",
      questions: [
        {
          id: "00000000-0000-4000-8000-000000000001",
          type: "short_text",
          text: "P1",
          required: false,
          orderIndex: 0,
          sectionTitle: null,
          sectionDescription: null,
          helpText: "Ajuda",
          placeholder: null,
        },
      ],
    });
    expect(result.questions?.[0].helpText).toBe("Ajuda");
  });

  it("rejeita helpText acima do limite", () => {
    const long = "x".repeat(2001);
    expect(() =>
      updateFormSchema.parse({
        title: "Form upd",
        questions: [
          {
            type: "short_text",
            text: "P1",
            required: false,
            orderIndex: 0,
            helpText: long,
          },
        ],
      })
    ).toThrow();
  });
});
