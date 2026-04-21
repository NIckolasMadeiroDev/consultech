"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, FileText, TrendingUp, PieChart } from "lucide-react";
import {
  RevenueVsExpensesChart,
  ExpensesByCategoryChart,
  GoalVsAchievedChart,
} from "@/components/finance/charts";
import { exportToFile, type ExportFormat } from "@/lib/finance/export-utils";

export default function ReportsPage() {
  const [revenueMonths, setRevenueMonths] = useState(12);
  const [categoryMonths, setCategoryMonths] = useState(6);
  const [goalMonths, setGoalMonths] = useState(6);
  const [exporting, setExporting] = useState(false);

  // Export handlers
  const handleExportTransactions = async (format: ExportFormat) => {
    setExporting(true);
    try {
      const response = await fetch("/api/finance/export/transactions");
      if (!response.ok) throw new Error("Erro ao buscar dados");
      const data = await response.json();
      exportToFile(data, `transacoes-${new Date().toISOString().slice(0, 10)}`, format);
    } catch (error) {
      alert("Erro ao exportar transações");
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportReceivables = async (format: ExportFormat) => {
    setExporting(true);
    try {
      const response = await fetch("/api/finance/export/receivables");
      if (!response.ok) throw new Error("Erro ao buscar dados");
      const data = await response.json();
      exportToFile(data, `contas-receber-${new Date().toISOString().slice(0, 10)}`, format);
    } catch (error) {
      alert("Erro ao exportar contas a receber");
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPayables = async (format: ExportFormat) => {
    setExporting(true);
    try {
      const response = await fetch("/api/finance/export/payables");
      if (!response.ok) throw new Error("Erro ao buscar dados");
      const data = await response.json();
      exportToFile(data, `contas-pagar-${new Date().toISOString().slice(0, 10)}`, format);
    } catch (error) {
      alert("Erro ao exportar contas a pagar");
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-display-sm font-semibold text-[var(--text-primary)]">
            Relatórios e Análises
          </h1>
          <p className="text-body text-[var(--text-secondary)]">
            Visualize gráficos, exporte relatórios e analise o desempenho financeiro.
          </p>
        </div>
      </div>

      {/* Gráfico: Entradas vs Saídas */}
      <Card>
        <div className="mb-md flex items-center justify-between border-b border-[var(--border)] pb-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Entradas vs Saídas
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Evolução mensal do fluxo de caixa
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-[var(--text-secondary)]">Meses:</label>
            <Input
              type="number"
              min="1"
              max="24"
              value={revenueMonths}
              onChange={(e) => setRevenueMonths(Math.max(1, Math.min(24, Number(e.target.value))))}
              className="w-20"
            />
          </div>
        </div>
        <RevenueVsExpensesChart months={revenueMonths} />
      </Card>

      {/* Gráfico: Gastos por Categoria */}
      <Card>
        <div className="mb-md flex items-center justify-between border-b border-[var(--border)] pb-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600">
              <PieChart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Top 10 Gastos por Categoria
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Maiores despesas por categoria
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-[var(--text-secondary)]">Meses:</label>
            <Input
              type="number"
              min="1"
              max="24"
              value={categoryMonths}
              onChange={(e) => setCategoryMonths(Math.max(1, Math.min(24, Number(e.target.value))))}
              className="w-20"
            />
          </div>
        </div>
        <ExpensesByCategoryChart months={categoryMonths} />
      </Card>

      {/* Gráfico: Meta vs Realizado */}
      <Card>
        <div className="mb-md flex items-center justify-between border-b border-[var(--border)] pb-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Meta de Faturamento vs Realizado
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Comparação entre metas e resultados
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-[var(--text-secondary)]">Meses:</label>
            <Input
              type="number"
              min="1"
              max="12"
              value={goalMonths}
              onChange={(e) => setGoalMonths(Math.max(1, Math.min(12, Number(e.target.value))))}
              className="w-20"
            />
          </div>
        </div>
        <GoalVsAchievedChart months={goalMonths} />
      </Card>

      {/* Exportação de Dados */}
      <Card>
        <div className="mb-md border-b border-[var(--border)] pb-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Exportação de Dados
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Exporte relatórios em diferentes formatos
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-md">
          {/* Transações */}
          <div className="rounded-lg border border-[var(--border)] p-md">
            <h3 className="mb-2 font-semibold text-[var(--text-primary)]">Movimentações</h3>
            <p className="mb-md text-sm text-[var(--text-secondary)]">
              Exportar todas as transações do sistema
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleExportTransactions("xlsx")}
                disabled={exporting}
                variant="outline"
              >
                Excel (.xlsx)
              </Button>
              <Button
                onClick={() => handleExportTransactions("csv")}
                disabled={exporting}
                variant="outline"
              >
                CSV (.csv)
              </Button>
              <Button
                onClick={() => handleExportTransactions("json")}
                disabled={exporting}
                variant="outline"
              >
                JSON (.json)
              </Button>
            </div>
          </div>

          {/* Contas a Receber */}
          <div className="rounded-lg border border-[var(--border)] p-md">
            <h3 className="mb-2 font-semibold text-[var(--text-primary)]">Contas a Receber</h3>
            <p className="mb-md text-sm text-[var(--text-secondary)]">
              Exportar todas as contas a receber
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleExportReceivables("xlsx")}
                disabled={exporting}
                variant="outline"
              >
                Excel (.xlsx)
              </Button>
              <Button
                onClick={() => handleExportReceivables("csv")}
                disabled={exporting}
                variant="outline"
              >
                CSV (.csv)
              </Button>
              <Button
                onClick={() => handleExportReceivables("json")}
                disabled={exporting}
                variant="outline"
              >
                JSON (.json)
              </Button>
            </div>
          </div>

          {/* Contas a Pagar */}
          <div className="rounded-lg border border-[var(--border)] p-md">
            <h3 className="mb-2 font-semibold text-[var(--text-primary)]">Contas a Pagar</h3>
            <p className="mb-md text-sm text-[var(--text-secondary)]">
              Exportar todas as contas a pagar
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => handleExportPayables("xlsx")}
                disabled={exporting}
                variant="outline"
              >
                Excel (.xlsx)
              </Button>
              <Button
                onClick={() => handleExportPayables("csv")}
                disabled={exporting}
                variant="outline"
              >
                CSV (.csv)
              </Button>
              <Button
                onClick={() => handleExportPayables("json")}
                disabled={exporting}
                variant="outline"
              >
                JSON (.json)
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
