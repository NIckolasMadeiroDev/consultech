import { chatCompletion } from "./chat-completion";
import type { IChatCompletionService } from "./chat-completion.service.interface";
import {
  suggestFormCopyResponseSchema,
  type SuggestFormCopyKind,
  type SuggestFormCopyRequest,
} from "./suggest-form-copy.schema";

const MAX_OUT: Record<SuggestFormCopyKind, number> = {
  form_description: 2000,
  closing_message: 1500,
  paused_message: 900,
  share_invite: 700,
};

const SYSTEM: Record<SuggestFormCopyKind, string> = {
  form_description:
    "Você escreve descrições curtas de formulários em português (Brasil), tom profissional e claro. Responda apenas com o texto da descrição, sem título, sem aspas envolvendo o bloco, sem markdown.",
  closing_message:
    "Você escreve mensagens de agradecimento após envio de formulário em português, calorosas e breves. Responda só com o texto final, sem markdown.",
  paused_message:
    "Você escreve mensagens curtas explicando que o formulário está temporariamente indisponível, em português, tom educado. Responda só com o texto, sem markdown.",
  share_invite:
    "Você escreve convites curtos para pessoas responderem um formulário (WhatsApp, e-mail, intranet), em português. Pode incluir o link se for fornecido. Sem hashtags excessivas. Responda só com o texto, sem markdown.",
};

function buildUserPayload(input: SuggestFormCopyRequest): string {
  const t = input.title?.trim() || "";
  const d = input.description?.trim() || "";
  const lines: string[] = [];
  if (t) lines.push(`Título do formulário: ${t}`);
  else lines.push("Título do formulário: (ainda não definido — use linguagem genérica).");
  if (d) lines.push(`Descrição atual (pode reescrever ou complementar o pedido): ${d}`);
  if (input.shareLink?.trim()) lines.push(`Link completo para resposta: ${input.shareLink.trim()}`);
  if (input.shortLink?.trim()) lines.push(`Link curto: ${input.shortLink.trim()}`);
  return lines.join("\n");
}

function cleanModelText(raw: string): string {
  let s = raw.trim();
  s = s.replace(/^```[\w]*\s*/i, "").replace(/\s*```$/i, "").trim();
  s = s.replace(/^["'\u201c\u201d]+|["'\u201c\u201d]+$/g, "").trim();
  return s.replace(/\s+/g, " ").trim();
}

export async function suggestFormCopy(
  input: SuggestFormCopyRequest,
  service: IChatCompletionService
): Promise<string> {
  const max = MAX_OUT[input.kind];
  const user = `${buildUserPayload(input)}\n\nLimite aproximado: até ${max} caracteres.`;
  const result = await chatCompletion(
    {
      messages: [
        { role: "system", content: SYSTEM[input.kind] },
        { role: "user", content: user },
      ],
      temperature: 0.35,
      max_tokens: 600,
    },
    service
  );
  const cleaned = cleanModelText(result.content ?? "");
  if (!cleaned) throw new Error("Resposta vazia do modelo");
  const truncated = cleaned.length > max ? cleaned.slice(0, max).trim() : cleaned;
  const parsed = suggestFormCopyResponseSchema.safeParse({ text: truncated });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Texto inválido");
  }
  return parsed.data.text;
}
