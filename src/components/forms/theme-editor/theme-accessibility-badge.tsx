"use client";

import { useMemo } from "react";
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import type { FormTheme } from "@/types/form-theme";
import { validateAccessibility } from "@/lib/accessibility-validator";

type ThemeAccessibilityBadgeProps = {
  readonly theme: FormTheme;
};

export function ThemeAccessibilityBadge({ theme }: ThemeAccessibilityBadgeProps) {
  const report = useMemo(() => validateAccessibility(theme), [theme]);
  const summary = [
    ...report.issues.map((t) => `• ${t}`),
    ...report.warnings.map((t) => `• ${t} (aviso)`),
  ].join("\n");

  const icon =
    report.issues.length > 0 ? (
      <AlertCircle className="h-4 w-4 text-red-600" aria-hidden />
    ) : report.warnings.length > 0 ? (
      <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />
    ) : (
      <CheckCircle className="h-4 w-4 text-emerald-600" aria-hidden />
    );

  const label =
    report.issues.length > 0
      ? "Acessibilidade: problemas"
      : report.warnings.length > 0
        ? "Acessibilidade: avisos"
        : "Acessibilidade: OK";

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 text-small text-[var(--text-secondary)] dark:border-neutral-600 dark:bg-neutral-900/50"
      title={summary || "Sem problemas detetados."}
    >
      {icon}
      <span className="text-[var(--text-primary)]">{label}</span>
    </span>
  );
}
