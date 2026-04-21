import type { Form, Question } from "@/core/entities";
import type { CreateFormInput } from "./form.schema";

export function formDTO(form: Form) {
  return {
    id: form.id,
    title: form.title,
    description: form.description,
    closingMessage: form.closingMessage,
    pausedMessage: form.pausedMessage,
    folderId: form.folderId,
    folder: form.folder,
    isTemplate: form.isTemplate ?? false,
    status: form.status,
    version: form.version,
    slug: form.slug,
    allowAnonymous: form.allowAnonymous,
    responseSettings: form.responseSettings,
    sectionVisibilityRules: form.sectionVisibilityRules,
    theme: form.theme,
    headerImage: form.headerImage,
    logoImage: form.logoImage,
    backgroundImage: form.backgroundImage,
    welcomeMessage: form.welcomeMessage,
    submitButtonText: form.submitButtonText,
    successMessage: form.successMessage,
    successPageHtml: form.successPageHtml,
    successRedirectUrl: form.successRedirectUrl,
    successRedirectDelay: form.successRedirectDelay,
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
    sectionTitle: question.sectionTitle,
    sectionDescription: question.sectionDescription,
    helpText: question.helpText,
    placeholder: question.placeholder,
    contentHtml: question.contentHtml,
    imageUrl: question.imageUrl,
    videoUrl: question.videoUrl,
    imageAlt: question.imageAlt,
    separatorStyle: question.separatorStyle,
    fileDownloadUrl: question.fileDownloadUrl,
    fileDownloadLabel: question.fileDownloadLabel,
    fileDownloadMime: question.fileDownloadMime,
    fileUploadRules: question.fileUploadRules,
    customIcon: question.customIcon,
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
    folderId: form.folderId,
    folder: form.folder,
    isTemplate: form.isTemplate ?? false,
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
