"use client";

import { useEffect, useState } from "react";
import { Save, TrendingUp, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Goal = { id: string; year: number; month: number; goalValue: number; description: string | null };
type Cost = { id: string; year: number; month: number; predictedCost: number; description: string | null };

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function FinanceMetasPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [annualGoal, setAnnualGoal] = useState("");
  const [annualCost, setAnnualCost] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [year]);

  function loadData() {
    setLoading(true);
    Promise.all([
      fetch(`/api/finance/revenue-goals?year=${year}`).then((r) => r.json()),
      fetch(`/api/finance/operational-costs?year=${year}`).then((r) => r.json()),
    ])
      .then(([g, c]) => {
        setGoals(Array.isArray(g) ? g : []);
        setCosts(Array.isArray(c) ? c : []);
      })
      .catch(() => {
        setGoals([]);
        setCosts([]);
      })
      .finally(() => setLoading(false));
  }

  async function handleDistributeGoals() {
    const value = Number.parseFloat(annualGoal.replaceAll(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      setError("Informe uma meta anual válida.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/finance/revenue-goals/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, annualGoal: value }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Erro ao distribuir meta");
      }

      setSuccess("Meta anual distribuída em 12 meses!");
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDistributeCosts() {
    const value = Number.parseFloat(annualCost.replaceAll(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      setError("Informe um custo anual válido.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/finance/operational-costs/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, annualCost: value }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Erro ao distribuir custo");
      }

      setSuccess("Custo operacional distribuído em 12 meses!");
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function updateGoal(month: number, value: number) {
    try {
      await fetch("/api/finance/revenue-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month, goalValue: value }),
      });
      loadData();
    } catch (err) {
      setError("Erro ao atualizar meta");
    }
  }

  async function updateCost(month: number, value: number) {
    try {
      await fetch("/api/finance/operational-costs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month, predictedCost: value }),
      });
      loadData();
    } catch (err) {
      setError("Erro ao atualizar custo");
    }
  }

  return (
    <div>
      <h1 className="mb-lg text-h2 font-semibold text-[var(--text-primary)]">
        Metas Financeiras
      </h1>
      <p className="mb-xl text-body text-[var(--text-secondary)]">
        Configure metas mensais de faturamento e previsão de custos operacionais.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-small text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-small text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
          {success}
        </div>
      )}

      <div className="mb-lg">
        <label htmlFor="year-select" className="mb-2 block text-small font-medium text-neutral-700 dark:text-neutral-300">
          Ano
        </label>
        <select
          id="year-select"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="h-10 w-48 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 py-2 text-body text-[var(--text-primary)] outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-neutral-600"
        >
          {[2024, 2025, 2026, 2027, 2028].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="mb-xl grid gap-4 lg:grid-cols-2">
        <Card padding="lg">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-h4 font-semibold text-[var(--text-primary)]">
                Meta de Faturamento
              </h2>
              <p className="text-small text-[var(--text-secondary)]">
                Defina a meta anual e distribua automaticamente
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              id="annualGoal"
              type="text"
              inputMode="decimal"
              label="Meta anual (R$)"
              placeholder="0,00"
              value={annualGoal}
              onChange={(e) =>
                setAnnualGoal(
                  e.target.value
                    .replaceAll(/[^\d,]/g, "")
                    .replace(/(\d+),(\d{2}).*/, "$1,$2")
                )
              }
            />
            <Button
              variant="primary"
              onClick={handleDistributeGoals}
              loading={saving}
              disabled={saving || !annualGoal}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Distribuir em 12 meses
            </Button>
          </div>
        </Card>

        <Card padding="lg">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
              <DollarSign className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-h4 font-semibold text-[var(--text-primary)]">
                Custo Operacional
              </h2>
              <p className="text-small text-[var(--text-secondary)]">
                Defina o custo anual previsto
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              id="annualCost"
              type="text"
              inputMode="decimal"
              label="Custo anual previsto (R$)"
              placeholder="0,00"
              value={annualCost}
              onChange={(e) =>
                setAnnualCost(
                  e.target.value
                    .replaceAll(/[^\d,]/g, "")
                    .replace(/(\d+),(\d{2}).*/, "$1,$2")
                )
              }
            />
            <Button
              variant="primary"
              onClick={handleDistributeCosts}
              loading={saving}
              disabled={saving || !annualCost}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Distribuir em 12 meses
            </Button>
          </div>
        </Card>
      </div>

      {loading ? (
        <Card padding="lg">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card padding="lg">
            <h3 className="mb-4 text-h4 font-semibold text-[var(--text-primary)]">
              Metas Mensais de Faturamento
            </h3>
            <div className="space-y-2">
              {MONTH_NAMES.map((name, index) => {
                const month = index + 1;
                const goal = goals.find((g) => g.month === month);
                return (
                  <div key={month} className="flex items-center gap-3">
                    <span className="w-24 text-small text-[var(--text-secondary)]">
                      {name}
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={goal ? String(goal.goalValue).replace(".", ",") : ""}
                      onChange={(e) => {
                        const val = e.target.value.replaceAll(",", ".");
                        const num = Number.parseFloat(val);
                        if (Number.isFinite(num) && num >= 0) {
                          updateGoal(month, num);
                        }
                      }}
                      className="h-9 flex-1 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-small text-[var(--text-primary)] outline-none focus:border-primary-500 dark:border-neutral-600"
                    />
                  </div>
                );
              })}
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="mb-4 text-h4 font-semibold text-[var(--text-primary)]">
              Custos Operacionais Mensais
            </h3>
            <div className="space-y-2">
              {MONTH_NAMES.map((name, index) => {
                const month = index + 1;
                const cost = costs.find((c) => c.month === month);
                return (
                  <div key={month} className="flex items-center gap-3">
                    <span className="w-24 text-small text-[var(--text-secondary)]">
                      {name}
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={cost ? String(cost.predictedCost).replace(".", ",") : ""}
                      onChange={(e) => {
                        const val = e.target.value.replaceAll(",", ".");
                        const num = Number.parseFloat(val);
                        if (Number.isFinite(num) && num >= 0) {
                          updateCost(month, num);
                        }
                      }}
                      className="h-9 flex-1 rounded-lg border border-neutral-300 bg-[var(--background)] px-3 text-small text-[var(--text-primary)] outline-none focus:border-primary-500 dark:border-neutral-600"
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
