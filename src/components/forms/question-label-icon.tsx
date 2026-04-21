"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlignLeft,
  BookOpen,
  Building2,
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Download,
  Hash,
  Image,
  Layers,
  ListChecks,
  Mail,
  Minus,
  PenLine,
  Sparkles,
  Star,
  ToggleLeft,
  Type,
  Upload,
  User,
  Video,
} from "lucide-react";
import {
  defaultQuestionIconForType,
  type FormQuestionIconName,
  FORM_QUESTION_ICON_NAMES,
} from "@/lib/form-question-icon-options";

const ICON_MAP: Record<FormQuestionIconName, LucideIcon> = {
  CircleHelp,
  Type,
  AlignLeft,
  ListChecks,
  CheckSquare,
  ChevronDown,
  Calendar,
  Hash,
  ToggleLeft,
  Image,
  Video,
  Minus,
  Download,
  Upload,
  BookOpen,
  Layers,
  Sparkles,
  Mail,
  User,
  Building2,
  Star,
  ClipboardList,
  PenLine,
};

function resolveName(
  custom: string | null | undefined,
  questionType: string
): FormQuestionIconName {
  if (custom && FORM_QUESTION_ICON_NAMES.includes(custom as FormQuestionIconName)) {
    return custom as FormQuestionIconName;
  }
  return defaultQuestionIconForType(questionType);
}

type QuestionLabelIconProps = {
  readonly questionType: string;
  readonly customIcon?: string | null;
  readonly className?: string;
};

export function QuestionLabelIcon({ questionType, customIcon, className }: QuestionLabelIconProps) {
  const name = resolveName(customIcon, questionType);
  const Icon = ICON_MAP[name];
  return <Icon className={className} aria-hidden />;
}
