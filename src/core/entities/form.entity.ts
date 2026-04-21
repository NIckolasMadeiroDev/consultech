import type { FormStatus } from "@/types";
import type { FormTheme } from "@/types/form-theme";
import type { FormResponseSettings } from "@/types/form-response-settings";
import type { SectionVisibilityRule } from "@/types/form-section-visibility";

export interface Form {
  id: string;
  title: string;
  description?: string;
  closingMessage?: string;
  pausedMessage?: string;
  folderId?: string;
  folder?: string;
  isTemplate?: boolean;
  status: FormStatus;
  version: number;
  slug?: string;
  allowAnonymous: boolean;
  responseSettings: FormResponseSettings;
  sectionVisibilityRules: SectionVisibilityRule[];
  theme: FormTheme;
  headerImage?: string;
  logoImage?: string;
  backgroundImage?: string;
  welcomeMessage?: string;
  submitButtonText: string;
  successMessage?: string;
  successPageHtml?: string;
  successRedirectUrl?: string;
  successRedirectDelay?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  linkStatus?: string;
}
