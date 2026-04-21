"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock, DollarSign, AlertCircle } from "lucide-react";

type EventFeasibilityCalculatorProps = {
  totalCost: number;
  currentBalance: number;
  averageMonthlyRevenue: number;
  goalValue?: number | null;
};

export function EventFeasibilityCalculator({
  totalCost,
  currentBalance,
  averageMonthlyRevenue,
  goalValue,
}: EventFeasibilityCalculatorProps) {
  const difference = currentBalance - totalCost;
  const isFeasible = difference >= 0;

  let monthsNeeded = 0;
  let canAfford = true;

  if (!isFeasible) {
    const amountNeeded = Math.abs(difference);
    if (averageMonthlyRevenue > 0) {
      monthsNeeded = Math.ceil(amountNeeded / averageMonthlyRevenue);
    } else {
      canAfford = false;
    }
  }

  const impactOnGoal = goalValue ? ((totalCost / goalValue) * 100).toFixed(1) : null;

  return (
    <Card padding="lg">
      <div className="mb-md flex items-center gap-3 border-b border-[var(--border)] pb-md">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            isFeasible
              ? "bg-green-100 text-green-600"
              : "bg-yellow-100 text-yellow-600"
          }`}
        >
          {isFeasible ? (
            <TrendingUp className="h-5 w-5" />
          ) : (
            <TrendingDown className="h-5 w-5" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Análise de Viabilidade
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            {isFeasible
              ? "Evento viável com o saldo atual"
              : "Planejamento financeiro necessário"}
          </p>
        </div>
      </div>

      <div className="space-y-md">
        {/* Custo Total */}
        <div className="flex items-center justify-between rounded-lg bg-neutral-100 p-md dark:bg-neutral-800">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[var(--text-secondary)]" />
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              Custo Total do Evento
            </span>
          </div>
          <span className="text-lg font-semibold text-[var(--text-primary)]">
            R$ {totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Saldo Atual */}
        <div className="flex items-center justify-between rounded-lg bg-neutral-100 p-md dark:bg-neutral-800">
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            Saldo Disponível
          </span>
          <span className="text-lg font-semibold text-[var(--text-primary)]">
            R$ {currentBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Resultado */}
        <div
          className={`flex items-center justify-between rounded-lg p-md ${
            isFeasible
              ? "bg-green-50 dark:bg-green-900/20"
              : "bg-yellow-50 dark:bg-yellow-900/20"
          }`}
        >
          <span
            className={`text-sm font-medium ${
              isFeasible ? "text-green-700 dark:text-green-400" : "text-yellow-700 dark:text-yellow-400"
            }`}
          >
            {isFeasible ? "Sobra após o evento" : "Falta para realizar o evento"}
          </span>
          <span
            className={`text-lg font-bold ${
              isFeasible ? "text-green-700 dark:text-green-400" : "text-yellow-700 dark:text-yellow-400"
            }`}
          >
            R$ {Math.abs(difference).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Prazo necessário */}
        {!isFeasible && canAfford && (
          <div className="flex items-center gap-3 rounded-lg border-2 border-yellow-300 bg-yellow-50 p-md dark:border-yellow-700 dark:bg-yellow-900/20">
            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                Tempo estimado para juntar o valor
              </p>
              <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                {monthsNeeded} {monthsNeeded === 1 ? "mês" : "meses"}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-500">
                Baseado na receita média mensal de R${" "}
                {averageMonthlyRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}

        {/* Sem receita média */}
        {!isFeasible && !canAfford && (
          <div className="flex items-center gap-3 rounded-lg border-2 border-red-300 bg-red-50 p-md dark:border-red-700 dark:bg-red-900/20">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                Não é possível calcular o prazo
              </p>
              <p className="text-xs text-red-600 dark:text-red-500">
                Receita média mensal insuficiente ou zero
              </p>
            </div>
          </div>
        )}

        {/* Impacto na meta */}
        {impactOnGoal && (
          <div className="rounded-lg bg-blue-50 p-md dark:bg-blue-900/20">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              <strong>Impacto na meta de faturamento:</strong> {impactOnGoal}% da meta mensal
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
