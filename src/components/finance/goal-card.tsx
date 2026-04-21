"use client";

import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MoneyValue } from "./money-value";

type GoalCardProps = {
  goal: number;
  achieved: number;
  percentage: number | null;
  status: "green" | "yellow" | "red" | null;
  monthLabel: string;
};

const STATUS_CONFIG = {
  green: {
    bgColor: "bg-green-100 dark:bg-green-900/40",
    textColor: "text-green-800 dark:text-green-300",
    barColor: "bg-green-600",
    label: "Meta Atingida",
  },
  yellow: {
    bgColor: "bg-yellow-100 dark:bg-yellow-900/40",
    textColor: "text-yellow-800 dark:text-yellow-300",
    barColor: "bg-yellow-600",
    label: "Próximo da Meta",
  },
  red: {
    bgColor: "bg-red-100 dark:bg-red-900/40",
    textColor: "text-red-800 dark:text-red-300",
    barColor: "bg-red-600",
    label: "Abaixo da Meta",
  },
};

export function GoalCard({ goal, achieved, percentage, status, monthLabel }: GoalCardProps) {
  const config = status ? STATUS_CONFIG[status] : null;

  return (
    <Card padding="lg">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
            <TrendingUp className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h3 className="text-h5 font-semibold text-[var(--text-primary)]">
              Meta de Faturamento
            </h3>
            <p className="text-small text-[var(--text-secondary)]">{monthLabel}</p>
          </div>
        </div>
        {config && (
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${config.bgColor} ${config.textColor}`}
          >
            {config.label}
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-small text-[var(--text-secondary)]">Meta</span>
          <MoneyValue value={goal} variant="neutral" size="table" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-small text-[var(--text-secondary)]">Realizado</span>
          <MoneyValue value={achieved} variant="entry" size="table" />
        </div>

        {percentage !== null && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-small text-[var(--text-secondary)]">Progresso</span>
              <span className="text-h4 font-semibold text-[var(--text-primary)]">
                {Math.round(percentage)}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
              <div
                className={`h-full transition-all ${config?.barColor || "bg-primary-600"}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
