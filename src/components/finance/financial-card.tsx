"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { MoneyValue } from "./money-value";

type FinancialCardProps = Readonly<{
  title: string;
  value: number;
  variant: "entry" | "exit" | "neutral";
  comparison?: string;
  icon?: ReactNode;
  className?: string;
}>;

function getIconWrapperClass(variant: "entry" | "exit" | "neutral"): string {
  if (variant === "entry") return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400";
  if (variant === "exit") return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
  return "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300";
}

export function FinancialCard({
  title,
  value,
  variant,
  comparison,
  icon,
  className = "",
}: FinancialCardProps) {
  return (
    <Card padding="lg" className={`transition-shadow duration-150 ease-out hover:shadow-md ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-caption font-medium uppercase tracking-wide text-[var(--text-secondary)]">
            {title}
          </p>
          <MoneyValue value={value} variant={variant} size="dashboard" className="mt-1 block" />
          {comparison && (
            <p className="mt-1 text-finance-aux text-[var(--text-secondary)]">{comparison}</p>
          )}
        </div>
        {icon && (
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getIconWrapperClass(variant)}`}>
            {icon}
          </span>
        )}
      </div>
    </Card>
  );
}
