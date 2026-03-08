import { describe, it, expect, beforeEach } from "vitest";
import { createForm } from "@/modules/forms/create-form";
import {
  InMemoryFormRepository,
  clearFormStore,
} from "@/modules/forms/infrastructure/in-memory-form.repository";
import {
  InMemoryQuestionRepository,
  clearQuestionStore,
} from "@/modules/forms/infrastructure/in-memory-question.repository";

describe("createForm integration", () => {
  beforeEach(() => {
    clearFormStore();
    clearQuestionStore();
  });

  it("deve persistir formulário e perguntas nos repositórios", async () => {
    const formRepo = new InMemoryFormRepository();
    const questionRepo = new InMemoryQuestionRepository();
    const form = await createForm(
      {
        title: "Pesquisa de Clima",
        description: "Descrição",
        questions: [
          { type: "short_text", text: "Nome?", required: true, orderIndex: 0 },
          { type: "scale", text: "Nota 1-5?", required: true, orderIndex: 1, scaleMin: 1, scaleMax: 5 },
        ],
      },
      "admin-1",
      formRepo,
      questionRepo
    );
    expect(form.id).toBeDefined();
    expect(form.title).toBe("Pesquisa de Clima");
    expect(form.status).toBe("draft");
    const questions = await questionRepo.findByFormId(form.id);
    expect(questions).toHaveLength(2);
    expect(questions[0].text).toBe("Nome?");
    expect(questions[1].scaleMin).toBe(1);
    expect(questions[1].scaleMax).toBe(5);
  });
});
