import { chatCompletion } from "./chat-completion";
import type { IChatCompletionService } from "./chat-completion.service.interface";
import {
  aiFormDraftFromModelSchema,
  type AiFormDraftFromModel,
} from "./generate-form-draft.schema";

const SYSTEM = `Você gera rascunhos de formulários para o sistema Consultech. Responda somente com JSON válido (um objeto), sem markdown, sem texto fora do JSON.

Campos do objeto:
- title: string, título curto em português, mínimo 3 caracteres.
- description: string opcional, contexto para quem responde.
- closingMessage: string opcional, agradecimento após envio.
- questions: array ordenado (fluxo de cima para baixo).

Cada item de questions:
- type: exatamente um destes valores: section, short_text, long_text, multiple_choice, dropdown, checkbox, scale, yes_no, date, number.
- text: enunciado ou título da seção.
- required: boolean (para section use sempre false).
- options: array de strings com pelo menos 2 itens não vazios quando type for multiple_choice, dropdown ou checkbox.
- scaleMin e scaleMax: inteiros apenas quando type for scale (padrão sugerido 0 e 5 se não houver escala clara).

Use seções (section) para agrupar blocos. Prefira tipos adequados ao dado (ex.: email como short_text, datas como date). Não inclua IDs.`;

export function extractJsonObject(raw: string): string {
  const t = raw.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/im.exec(t);
  if (fence?.[1]) return fence[1].trim();
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) return t.slice(start, end + 1);
  return t;
}

function ensureTitle(s: string): string {
  const x = s.trim();
  if (x.length >= 3) return x;
  const pad = "Formulário";
  return (x + " " + pad).trim().slice(0, 120) || "Novo formulário";
}

function normalizeDraft(parsed: AiFormDraftFromModel): AiFormDraftFromModel {
  const questions = parsed.questions.map((q) => {
    const text = q.text.trim();
    if (q.type === "section") {
      return { type: "section" as const, text, required: false };
    }
    const required = Boolean(q.required);
    if (q.type === "multiple_choice" || q.type === "dropdown" || q.type === "checkbox") {
      const opts = (q.options ?? []).map((o) => o.trim()).filter((o) => o.length > 0);
      const options = opts.length >= 2 ? opts : ["Opção A", "Opção B"];
      return { type: q.type, text, required, options };
    }
    if (q.type === "scale") {
      let min = typeof q.scaleMin === "number" ? q.scaleMin : 0;
      let max = typeof q.scaleMax === "number" ? q.scaleMax : 5;
      if (min >= max) {
        min = 0;
        max = 5;
      }
      return { type: "scale", text, required, scaleMin: min, scaleMax: max };
    }
    return { type: q.type, text, required };
  });
  return {
    title: ensureTitle(parsed.title),
    description: parsed.description?.trim() || undefined,
    closingMessage: parsed.closingMessage?.trim() || undefined,
    questions: questions as AiFormDraftFromModel["questions"],
  };
}

export async function generateFormDraftFromPrompt(
  userPrompt: string,
  service: IChatCompletionService
): Promise<AiFormDraftFromModel> {
  const result = await chatCompletion(
    {
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Pedido do usuário (português):\n${userPrompt}`,
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
  const parsed = aiFormDraftFromModelSchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e) => e.message).join("; ");
    throw new Error(msg || "Estrutura do formulário inválida");
  }
  return normalizeDraft(parsed.data);
}
