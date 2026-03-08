import type { Form, Question } from "@/core/entities";
import type { CreateFormInput } from "./form.schema";

export function formDTO(form: Form) {
  return {
    id: form.id,
    title: form.title,
    description: form.description,
    status: form.status,
    version: form.version,
    slug: form.slug,
    allowAnonymous: form.allowAnonymous,
    createdBy: form.createdBy,
    createdAt: form.createdAt,
    updatedAt: form.updatedAt,
  };
}

export function questionDTO(question: Question) {
  return {
    id: question.id,
    formId: question.formId,
    type: question.type,
    text: question.text,
    required: question.required,
    orderIndex: question.orderIndex,
    options: question.options,
    scaleMin: question.scaleMin,
    scaleMax: question.scaleMax,
    conditionQuestionId: question.conditionQuestionId,
    conditionOperator: question.conditionOperator,
    conditionValue: question.conditionValue,
  };
}

export function formWithQuestionsDTO(form: Form, questions: Question[]) {
  return {
    ...formDTO(form),
    questions: questions.map(questionDTO).sort((a, b) => a.orderIndex - b.orderIndex),
  };
}

export function formListDTO(form: Form) {
  return {
    id: form.id,
    title: form.title,
    status: form.status,
    slug: form.slug,
    createdAt: form.createdAt,
  };
}

export function toFormEntity(data: CreateFormInput & { id: string; createdBy: string; createdAt: Date; updatedAt: Date; version: number }) {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    status: "draft" as const,
    version: data.version,
    createdBy: data.createdBy,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export type FormDTO = ReturnType<typeof formDTO>;
export type FormListDTO = ReturnType<typeof formListDTO>;
export type QuestionDTO = ReturnType<typeof questionDTO>;
export type FormWithQuestionsDTO = ReturnType<typeof formWithQuestionsDTO>;
