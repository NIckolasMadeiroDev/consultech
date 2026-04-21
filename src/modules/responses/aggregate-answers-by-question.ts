import type { Question } from "@/core/entities/question.entity";
import { acceptsAnswerValue } from "@/lib/form-question-kinds";
import type { QuestionType } from "@/types";

export type QuestionAggregate = {
  questionId: string;
  text: string;
  type: QuestionType;
  total: number;
  empty: number;
  optionCounts?: Record<string, number>;
  numericSamples?: number[];
  textSamples?: string[];
};

function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

export function labelsForAnswerValue(type: QuestionType, value: unknown): string[] {
  if (isEmptyValue(value)) return [];
  if (type === "checkbox" && Array.isArray(value)) {
    return value.map((x) => String(x).slice(0, 200)).filter(Boolean);
  }
  if (type === "yes_no") {
    if (typeof value === "boolean") return [value ? "Sim" : "Não"];
    const s = String(value).trim().toLowerCase();
    if (s === "sim" || s === "true" || s === "1") return ["Sim"];
    if (s === "não" || s === "nao" || s === "false" || s === "0") return ["Não"];
    return [String(value).slice(0, 200)];
  }
  if (type === "multiple_choice" || type === "dropdown") {
    return [String(value).slice(0, 200)];
  }
  if (type === "date") {
    const raw = String(value).trim();
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return [d.toISOString().slice(0, 10)];
    return [raw.slice(0, 200)];
  }
  return [];
}

const MAX_TEXT_SAMPLES = 80;
const MAX_NUM_SAMPLES = 500;

export function aggregateAnswersByQuestion(
  questions: Question[],
  rows: Array<{ answers: Array<{ questionId: string; value: unknown }> }>
): QuestionAggregate[] {
  const sorted = [...questions].sort((a, b) => a.orderIndex - b.orderIndex);
  const answerable = sorted.filter((q) => acceptsAnswerValue(q.type));
  const out: QuestionAggregate[] = [];

  for (const q of answerable) {
    const optionCounts: Record<string, number> = {};
    const numericSamples: number[] = [];
    const textSamples: string[] = [];
    let empty = 0;
    let total = 0;

    for (const row of rows) {
      const a = row.answers.find((x) => x.questionId === q.id);
      const value = a?.value;
      total += 1;
      if (isEmptyValue(value)) {
        empty += 1;
        continue;
      }
      if (
        q.type === "multiple_choice" ||
        q.type === "dropdown" ||
        q.type === "checkbox" ||
        q.type === "yes_no" ||
        q.type === "date"
      ) {
        for (const lab of labelsForAnswerValue(q.type, value)) {
          optionCounts[lab] = (optionCounts[lab] ?? 0) + 1;
        }
      } else if (q.type === "scale" || q.type === "number") {
        const n = typeof value === "number" ? value : Number.parseFloat(String(value));
        if (Number.isFinite(n) && numericSamples.length < MAX_NUM_SAMPLES) {
          numericSamples.push(n);
        }
      } else {
        const s = String(value).replace(/\s+/g, " ").trim().slice(0, 500);
        if (s && textSamples.length < MAX_TEXT_SAMPLES) {
          textSamples.push(s);
        }
      }
    }

    const agg: QuestionAggregate = {
      questionId: q.id,
      text: q.text,
      type: q.type,
      total,
      empty,
    };
    if (Object.keys(optionCounts).length > 0) agg.optionCounts = optionCounts;
    if (numericSamples.length > 0) agg.numericSamples = numericSamples;
    if (textSamples.length > 0) agg.textSamples = textSamples;
    out.push(agg);
  }
  return out;
}

export function distributionLabelsForChart(type: QuestionType, value: unknown): string[] {
  const labs = labelsForAnswerValue(type, value);
  if (labs.length > 0) return labs;
  if (isEmptyValue(value)) return [];
  if (type === "scale" || type === "number") {
    const n = typeof value === "number" ? value : Number.parseFloat(String(value));
    if (Number.isFinite(n)) return [String(n)];
    return [];
  }
  const s = String(value).replace(/\s+/g, " ").trim().slice(0, 120);
  return s ? [s] : [];
}
