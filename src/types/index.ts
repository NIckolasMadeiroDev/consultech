export type FormStatus = "draft" | "active" | "archived" | "paused";

export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "checkbox"
  | "scale"
  | "yes_no"
  | "date"
  | "number";

export type LinkStatus = "active" | "paused" | "expired";

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ResponseFilters {
  formId?: string;
  startDate?: Date;
  endDate?: Date;
  respondentId?: string;
  department?: string;
  questionId?: string;
  answerValue?: string;
}
