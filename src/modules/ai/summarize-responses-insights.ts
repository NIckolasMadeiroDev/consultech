import type { ResponseFilters } from "@/types";
import { chatCompletion } from "./chat-completion";
import type { IChatCompletionService } from "./chat-completion.service.interface";
import type { InsightsAggregate } from "@/modules/responses/build-insights-aggregate";
import type { SummarizeResponsesInsightsBody } from "./summarize-responses-insights.schema";

const SYSTEM_SUMMARY = `Você interpreta estatísticas agregadas de respostas a um formulário. Os dados já foram anonimizados (sem nomes, e-mails ou identificadores de respondentes). Trechos de texto aberto estão truncados e com dados sensíveis mascarados.

Regras: responda só em português; use parágrafos curtos; cite apenas números e padrões presentes no JSON; não invente percentuais ou citações; não peça dados pessoais; se a amostra for parcial, mencione que os totais vêm do conjunto filtrado e que a análise usa até 500 respostas mais recentes.

Produza: visão geral do volume; destaques por pergunta (escolhas, escalas, datas); menção breve a temas dos textos abertos quando houver amostras.`;

const SYSTEM_INSIGHTS = `Você interpreta estatísticas agregadas de respostas a um formulário. Os dados estão anonimizados e truncados conforme o JSON.

Regras: responda só em português; formato em lista com traço (-), 5 a 12 itens; cada item uma observação acionável ou padrão; use só o que está no JSON; não invente; se houver sampleIsPartial true, indique que a leitura é sobre a amostra recente; para textos abertos, infira temas a partir dos trechos de amostra sem reproduzir frases longas.`;

export function responseFiltersFromInsightsBody(
  body: SummarizeResponsesInsightsBody
): ResponseFilters | undefined {
  const f: ResponseFilters = {};
  if (body.startDate?.trim()) {
    const d = new Date(body.startDate.trim());
    if (!Number.isNaN(d.getTime())) f.startDate = d;
  }
  if (body.endDate?.trim()) {
    const d = new Date(body.endDate.trim());
    if (!Number.isNaN(d.getTime())) f.endDate = d;
  }
  const rs = body.respondentSearch?.trim();
  if (rs) f.respondentSearch = rs;
  const av = body.answerSearch?.trim();
  if (av) f.answerValue = av;
  const dept = body.department?.trim();
  if (dept) f.department = dept;
  return Object.keys(f).length > 0 ? f : undefined;
}

export async function summarizeResponsesInsights(
  aggregate: InsightsAggregate,
  mode: SummarizeResponsesInsightsBody["mode"],
  service: IChatCompletionService
): Promise<string> {
  const system = mode === "summary" ? SYSTEM_SUMMARY : SYSTEM_INSIGHTS;
  const user = `Dados agregados (JSON). totalMatchingResponses = respostas que batem com o filtro; sampleSize = quantas entram na análise (máx. 500, mais recentes primeiro).\n${JSON.stringify(aggregate)}`;
  const result = await chatCompletion(
    {
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.25,
      max_tokens: mode === "summary" ? 1800 : 2200,
    },
    service
  );
  const text = result.content?.trim() ?? "";
  if (!text) throw new Error("Resposta vazia do modelo");
  return text;
}
