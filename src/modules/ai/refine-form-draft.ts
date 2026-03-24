import { chatCompletion } from "./chat-completion";
import type { IChatCompletionService } from "./chat-completion.service.interface";
import { extractJsonObject } from "./generate-form-draft";
import {
  aiFormRefineFromModelSchema,
  type AiFormRefineFromModel,
  type RefineFormRequestInput,
} from "./refine-form-draft.schema";

const SYSTEM = `Você edita formulários do sistema Consultech. O usuário envia o estado atual em JSON e um pedido em português. Você devolve o formulário COMPLETO já atualizado, em um único objeto JSON válido, sem markdown e sem texto fora do JSON.

Campos do objeto de saída:
- title, description (opcional), closingMessage (opcional), pausedMessage (opcional, texto quando o formulário está pausado).
- questions: array na ordem final (de cima para baixo).

Cada pergunta:
- id: string UUID somente se a pergunta já existia no JSON atual — copie o id exatamente ao manter ou mover a pergunta. Para perguntas novas, omita id.
- type: section | short_text | long_text | multiple_choice | dropdown | checkbox | scale | yes_no | date | number
- text, required (sections sempre false)
- options: obrigatório com ≥2 strings para multiple_choice, dropdown, checkbox
- scaleMin, scaleMax: inteiros se type for scale

Regras: preserve ids ao renomear ou reordenar; remova do array o que o usuário pedir para excluir; agrupe com section quando pedido; torne obrigatório ou não conforme o pedido. Se responseCount no contexto for > 0, evite mudar o sentido das perguntas existentes sem o pedido explícito do usuário.`;

function ensureTitle(s: string): string {
  const x = s.trim();
  if (x.length >= 3) return x;
  const pad = "Formulário";
  return (x + " " + pad).trim().slice(0, 120) || "Formulário";
}

function normalizeRefineQuestion(
  q: AiFormRefineFromModel["questions"][number],
  allowedIds: ReadonlySet<string>
): AiFormRefineFromModel["questions"][number] {
  const text = q.text.trim();
  const id = q.id && allowedIds.has(q.id) ? q.id : undefined;
  if (q.type === "section") {
    return { ...(id ? { id } : {}), type: "section", text, required: false };
  }
  const required = Boolean(q.required);
  if (q.type === "multiple_choice" || q.type === "dropdown" || q.type === "checkbox") {
    const opts = (q.options ?? []).map((o) => o.trim()).filter((o) => o.length > 0);
    const options = opts.length >= 2 ? opts : ["Opção A", "Opção B"];
    return { ...(id ? { id } : {}), type: q.type, text, required, options };
  }
  if (q.type === "scale") {
    let min = typeof q.scaleMin === "number" ? q.scaleMin : 0;
    let max = typeof q.scaleMax === "number" ? q.scaleMax : 5;
    if (min >= max) {
      min = 0;
      max = 5;
    }
    return { ...(id ? { id } : {}), type: "scale", text, required, scaleMin: min, scaleMax: max };
  }
  return { ...(id ? { id } : {}), type: q.type, text, required };
}

function normalizeRefineDraft(
  parsed: AiFormRefineFromModel,
  allowedIds: ReadonlySet<string>
): AiFormRefineFromModel {
  const questions = parsed.questions.map((q) => normalizeRefineQuestion(q, allowedIds));
  return {
    title: ensureTitle(parsed.title),
    description: parsed.description?.trim() || undefined,
    closingMessage: parsed.closingMessage?.trim() || undefined,
    pausedMessage: parsed.pausedMessage?.trim() || undefined,
    questions: questions as AiFormRefineFromModel["questions"],
  };
}

export async function refineFormDraftFromPrompt(
  input: RefineFormRequestInput,
  service: IChatCompletionService
): Promise<AiFormRefineFromModel> {
  const allowedIds = new Set(
    input.current.questions.map((q) => q.id).filter((x): x is string => Boolean(x))
  );
  const payload = {
    title: input.current.title,
    description: input.current.description ?? "",
    closingMessage: input.current.closingMessage ?? "",
    pausedMessage: input.current.pausedMessage ?? "",
    responseCount: input.current.responseCount ?? 0,
    questions: input.current.questions.map((q) => ({
      id: q.id,
      type: q.type,
      text: q.text,
      required: q.required,
      options: q.options,
      scaleMin: q.scaleMin,
      scaleMax: q.scaleMax,
    })),
  };
  const result = await chatCompletion(
    {
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Estado atual (JSON):\n${JSON.stringify(payload)}\n\nPedido de alteração:\n${input.prompt}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 8192,
    },
    service
  );
  const raw = result.content?.trim() ?? "";
  if (!raw) throw new Error("Resposta vazia do modelo");
  let json: unknown;
  try {
    json = JSON.parse(extractJsonObject(raw));
  } catch {
    throw new Error("O modelo não retornou JSON válido. Tente de novo com instruções mais objetivas.");
  }
  const parsed = aiFormRefineFromModelSchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e) => e.message).join("; ");
    throw new Error(msg || "Estrutura do formulário inválida");
  }
  return normalizeRefineDraft(parsed.data, allowedIds);
}
