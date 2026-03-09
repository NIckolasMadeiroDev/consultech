"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MoneyValue } from "@/components/finance";

type CashflowMonth = { month: string; entries: number; exits: number; balance: number };
type CategoryRow = { categoryId: string; categoryName: string; type: string; total: number };

export default function FinanceRelatoriosPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [cashflow, setCashflow] = useState<CashflowMonth[]>([]);
  const [byCategory, setByCategory] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const to = new Date();
    const from = new Date(to.getFullYear(), to.getMonth(), 1);
    setDateFrom(from.toISOString().slice(0, 10));
    setDateTo(to.toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    if (!dateFrom || !dateTo) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/finance/reports/cashflow?dateFrom=${dateFrom}&dateTo=${dateTo}`).then((r) => r.json()),
      fetch(`/api/finance/reports/by-category?dateFrom=${dateFrom}&dateTo=${dateTo}`).then((r) => r.json()),
    ])
      .then(([cf, cat]) => {
        setCashflow(cf.months ?? []);
        setByCategory(cat.categories ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Erro"))
      .finally(() => setLoading(false));
  }, [dateFrom, dateTo]);

  const formatMonth = (ym: string) => {
    const [y, m] = ym.split("-");
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  return (
    <div>
      <div className="mb-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-semibold text-[var(--text-primary)]">Relatórios</h1>
          <p className="mt-1 text-body text-[var(--text-secondary)]">
            Fluxo de caixa e receitas/despesas por categoria.
          </p>
        </div>
      </div>

      <Card padding="md" className="mb-lg">
        <p className="mb-2 text-small font-medium text-[var(--text-primary)]">Período</p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 dark:border-neutral-600"
          />
          <span className="text-[var(--text-secondary)]">até</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-10 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 dark:border-neutral-600"
          />
        </div>
      </Card>

      {loading && (
        <Card padding="lg">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
        </Card>
      )}

      {error && (
        <Card padding="lg" className="border-red-200 dark:border-red-800">
          <p className="text-body text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      {!loading && !error && (
        <>
          <Card padding="lg" className="mb-lg">
            <h2 className="mb-4 flex items-center gap-2 text-h4 font-semibold text-[var(--text-primary)]">
              <BarChart3 className="h-5 w-5" /> Fluxo de caixa por mês
            </h2>
            {cashflow.length === 0 ? (
              <p className="text-body text-[var(--text-secondary)]">Nenhuma movimentação no período.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-small">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <th className="p-lg font-medium text-[var(--text-primary)]">Mês</th>
                      <th className="p-lg text-right font-medium text-[var(--text-primary)]">Entradas</th>
                      <th className="p-lg text-right font-medium text-[var(--text-primary)]">Saídas</th>
                      <th className="p-lg text-right font-medium text-[var(--text-primary)]">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashflow.map((row) => (
                      <tr key={row.month} className="border-b border-neutral-100 dark:border-neutral-800">
                        <td className="p-lg font-medium text-[var(--text-primary)]">{formatMonth(row.month)}</td>
                        <td className="p-lg text-right font-mono"><MoneyValue value={row.entries} variant="entry" size="table" /></td>
                        <td className="p-lg text-right font-mono"><MoneyValue value={row.exits} variant="exit" size="table" /></td>
                        <td className="p-lg text-right font-mono"><MoneyValue value={row.balance} variant={row.balance >= 0 ? "neutral" : "balance-negative"} size="table" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card padding="lg">
            <h2 className="mb-4 text-h4 font-semibold text-[var(--text-primary)]">Por categoria</h2>
            {byCategory.length === 0 ? (
              <p className="text-body text-[var(--text-secondary)]">Nenhuma movimentação com categoria no período.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-small">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <th className="p-lg font-medium text-[var(--text-primary)]">Categoria</th>
                      <th className="p-lg font-medium text-[var(--text-primary)]">Tipo</th>
                      <th className="p-lg text-right font-medium text-[var(--text-primary)]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byCategory.map((row) => (
                      <tr key={row.categoryId} className="border-b border-neutral-100 dark:border-neutral-800">
                        <td className="p-lg font-medium text-[var(--text-primary)]">{row.categoryName}</td>
                        <td className="p-lg text-[var(--text-secondary)]">{row.type === "entry" ? "Receita" : "Despesa"}</td>
                        <td className="p-lg text-right font-mono">
                          <MoneyValue value={row.total} variant={row.total >= 0 ? "entry" : "exit"} size="table" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
