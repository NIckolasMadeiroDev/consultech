"use client";

import { DollarSign, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MoneyValue } from "./money-value";

type OperationalCostCardProps = {
  predicted: number;
  realized: number;
  pending: number;
  remainingBudget: number;
  status: "green" | "yellow" | "red";
  monthLabel: string;
};

const STATUS_CONFIG = {
  green: {
    bgColor: "bg-green-100 dark:bg-green-900/40",
    textColor: "text-green-800 dark:text-green-300",
    label: "No Verde",
    icon: null,
  },
  yellow: {
    bgColor: "bg-yellow-100 dark:bg-yellow-900/40",
    textColor: "text-yellow-800 dark:text-yellow-300",
    label: "Atenção",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  red: {
    bgColor: "bg-red-100 dark:bg-red-900/40",
    textColor: "text-red-800 dark:text-red-300",
    label: "Crítico",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
};

export function OperationalCostCard({
  predicted,
  realized,
  pending,
  remainingBudget,
  status,
  monthLabel,
}: OperationalCostCardProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Card padding="lg">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
            <DollarSign className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h3 className="text-h5 font-semibold text-[var(--text-primary)]">
              Custo Operacional
            </h3>
            <p className="text-small text-[var(--text-secondary)]">{monthLabel}</p>
          </div>
        </div>
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${config.bgColor} ${config.textColor}`}
        >
          {config.icon}
          {config.label}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-small text-[var(--text-secondary)]">Previsto</span>
          <MoneyValue value={predicted} variant="neutral" size="table" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-small text-[var(--text-secondary)]">Realizado</span>
          <MoneyValue value={realized} variant="exit" size="table" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-small text-[var(--text-secondary)]">Pendente</span>
          <MoneyValue value={pending} variant="exit" size="table" />
        </div>

        <div className="border-t border-neutral-200 pt-3 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <span className="text-small font-medium text-[var(--text-secondary)]">
              Orçamento Restante
            </span>
            <MoneyValue
              value={remainingBudget}
              variant={remainingBudget >= 0 ? "entry" : "balance-negative"}
              size="table"
            />
          </div>
          {remainingBudget < 0 && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
              Saldo insuficiente para cobrir gastos previstos
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
