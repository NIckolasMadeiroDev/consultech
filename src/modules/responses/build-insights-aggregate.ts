import type { Question } from "@/core/entities/question.entity";
import type { QuestionType } from "@/types";

export type ResponseAnswersOnly = {
  answers: Array<{ questionId: string; value: unknown }>;
};

const DEFAULT_SNIPPET_LEN = 96;
const DEFAULT_MAX_SNIPPETS = 12;
const LABEL_TRUNC = 88;
const OPTION_KEY_MAX = 72;

export function redactAndTruncate(text: string, maxLen: number): string {
  let s = String(text).replace(/\s+/g, " ").trim();
  s = s.replace(/\b[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/gi, "[email]");
  s = s.replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, "[doc]");
  s = s.replace(/\b(?:\+?55\s?)?\(?\d{2}\)?\s?\d{4,5}-?\d{4}\b/g, "[fone]");
  s = s.replace(/\b\d{11,}\b/g, "[numero]");
  if (s.length > maxLen) {
    return `${s.slice(0, maxLen)}…`;
  }
  return s;
}

function truncateLabel(s: string, max: number): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

function distKey(label: string): string {
  return truncateLabel(label, OPTION_KEY_MAX);
}

function labelsForStructuredQuestion(type: QuestionType, value: unknown): string[] {
  if (isEmptyValue(value)) return [];
  if (type === "checkbox" && Array.isArray(value)) {
    return value
      .map((x) => distKey(String(x)))
      .filter((x) => x.length > 0)
      .slice(0, 24);
  }
  if (type === "yes_no") {
    if (typeof value === "boolean") {
      return [value ? "Sim" : "Não"];
    }
    const s = String(value).trim().toLowerCase();
    if (s === "sim" || s === "s" || s === "true" || s === "1") return ["Sim"];
    if (s === "não" || s === "nao" || s === "n" || s === "false" || s === "0") return ["Não"];
    return [distKey(String(value))];
  }
  if (type === "multiple_choice" || type === "dropdown") {
    return [distKey(String(value))];
  }
  if (type === "date") {
    const raw = String(value).trim();
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      return [d.toISOString().slice(0, 10)];
    }
    return [distKey(raw)];
  }
  return [];
}

function collectNumericSamples(type: QuestionType, value: unknown): number | null {
  if (type !== "scale" && type !== "number") return null;
  if (isEmptyValue(value)) return null;
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  if (!Number.isFinite(n)) return null;
  return n;
}

function collectTextSnippet(type: QuestionType, value: unknown, snippetMaxLen: number): string | null {
  if (type !== "short_text" && type !== "long_text") return null;
  if (isEmptyValue(value)) return null;
  const raw = typeof value === "string" ? value : String(value);
  const redacted = redactAndTruncate(raw, snippetMaxLen);
  return redacted.length > 0 ? redacted : null;
}

export type InsightsAggregate = {
  formTitle: string;
  totalMatchingResponses: number;
  sampleSize: number;
  sampleIsPartial: boolean;
  questions: Array<Record<string, unknown>>;
};

export function buildInsightsAggregate(
  formTitle: string,
  questions: Question[],
  responses: ResponseAnswersOnly[],
  totalMatchingResponses: number,
  opts?: { maxSnippetsPerQuestion?: number; snippetMaxLen?: number }
): InsightsAggregate {
  const maxSnippets = Math.min(20, Math.max(4, opts?.maxSnippetsPerQuestion ?? DEFAULT_MAX_SNIPPETS));
  const snippetMaxLen = Math.min(200, Math.max(40, opts?.snippetMaxLen ?? DEFAULT_SNIPPET_LEN));
  const ordered = [...questions].filter((q) => q.type !== "section").sort((a, b) => a.orderIndex - b.orderIndex);
  const sampleSize = responses.length;
  const sampleIsPartial = totalMatchingResponses > sampleSize;

  const out: Array<Record<string, unknown>> = [];
  let qi = 0;
  for (const q of ordered) {
    qi += 1;
    const key = `Q${qi}`;
    const label = truncateLabel(q.text, LABEL_TRUNC);
    const base = { key, type: q.type, label };

    let answered = 0;
    for (const r of responses) {
      const a = r.answers.find((x) => x.questionId === q.id);
      if (!isEmptyValue(a?.value)) answered += 1;
    }

    if (q.type === "short_text" || q.type === "long_text") {
      const seen = new Set<string>();
      const snippets: string[] = [];
      const step = responses.length <= maxSnippets ? 1 : Math.ceil(responses.length / maxSnippets);
      for (let i = 0; i < responses.length && snippets.length < maxSnippets; i += step) {
        const r = responses[i];
        const a = r?.answers.find((x) => x.questionId === q.id);
        const sn = collectTextSnippet(q.type, a?.value, snippetMaxLen);
        if (!sn) continue;
        const norm = sn.toLowerCase();
        if (seen.has(norm)) continue;
        seen.add(norm);
        snippets.push(sn);
      }
      out.push({
        ...base,
        answered,
        nonEmpty: answered,
        sampleSnippets: snippets,
      });
      continue;
    }

    if (q.type === "scale" || q.type === "number") {
      const nums: number[] = [];
      for (const r of responses) {
        const a = r.answers.find((x) => x.questionId === q.id);
        const n = collectNumericSamples(q.type, a?.value);
        if (n !== null) nums.push(n);
      }
      if (nums.length === 0) {
        out.push({ ...base, answered, numeric: null });
      } else {
        const min = Math.min(...nums);
        const max = Math.max(...nums);
        const avg = nums.reduce((s, x) => s + x, 0) / nums.length;
        out.push({
          ...base,
          answered,
          numeric: {
            min,
            max,
            avg: Math.round(avg * 1000) / 1000,
            n: nums.length,
          },
        });
      }
      continue;
    }

    const distribution: Record<string, number> = {};
    for (const r of responses) {
      const a = r.answers.find((x) => x.questionId === q.id);
      const labs = labelsForStructuredQuestion(q.type, a?.value);
      for (const lab of labs) {
        if (!lab) continue;
        distribution[lab] = (distribution[lab] ?? 0) + 1;
      }
    }
    out.push({
      ...base,
      answered,
      distribution,
    });
  }

  return {
    formTitle: truncateLabel(formTitle, 120),
    totalMatchingResponses,
    sampleSize,
    sampleIsPartial,
    questions: out,
  };
}
