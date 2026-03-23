import { describe, it, expect, beforeEach } from "vitest";
import { createForm } from "@/modules/forms/create-form";
import {
  InMemoryFormRepository,
  clearFormStore,
} from "@/modules/forms/infrastructure/in-memory-form.repository";
import { clearFolderStore } from "@/modules/folders/infrastructure/in-memory-folder.repository";
import {
  InMemoryQuestionRepository,
  clearQuestionStore,
} from "@/modules/forms/infrastructure/in-memory-question.repository";

describe("createForm integration", () => {
  beforeEach(() => {
    clearFormStore();
    clearFolderStore();
    clearQuestionStore();
  });

  it("deve persistir formulário e perguntas nos repositórios", async () => {
    const formRepo = new InMemoryFormRepository();
    const questionRepo = new InMemoryQuestionRepository();
    const form = await createForm(
      {
        title: "Pesquisa de Clima",
        description: "Descrição",
        initialStatus: "draft",
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

  it("persiste status active quando initialStatus é active", async () => {
    const formRepo = new InMemoryFormRepository();
    const questionRepo = new InMemoryQuestionRepository();
    const form = await createForm(
      {
        title: "Pesquisa Publicada",
        initialStatus: "active",
        questions: [{ type: "short_text", text: "P1?", required: false, orderIndex: 0 }],
      },
      "admin-1",
      formRepo,
      questionRepo
    );
    expect(form.status).toBe("active");
  });
});
