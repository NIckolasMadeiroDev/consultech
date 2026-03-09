"use client";

import { MoneyValue } from "./money-value";
import { AlertTriangle } from "lucide-react";

type BalanceIndicatorProps = Readonly<{
  balance: number;
  label?: string;
  showAlertWhenNegative?: boolean;
  className?: string;
}>;

export function BalanceIndicator({
  balance,
  label = "Saldo atual",
  showAlertWhenNegative = true,
  className = "",
}: BalanceIndicatorProps) {
  const isNegative = balance < 0;

  return (
    <div className={`rounded-lg border border-neutral-200 bg-[var(--surface)] p-lg dark:border-neutral-700 ${className}`}>
      <p className="text-caption font-medium uppercase tracking-wide text-[var(--text-secondary)]">
        {label}
      </p>
      <div className="mt-1 flex items-center gap-2">
        <MoneyValue
          value={balance}
          variant={isNegative ? "balance-negative" : "neutral"}
          size="balance"
        />
        {showAlertWhenNegative && isNegative && (
          <span
            className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-small font-medium text-red-800 dark:bg-red-900/50 dark:text-red-200"
            role="alert"
          >
            <AlertTriangle className="h-4 w-4" aria-hidden />
            Caixa negativo
          </span>
        )}
      </div>
    </div>
  );
}
