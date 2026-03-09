"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftRight, Wallet, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FinancialCard, BalanceIndicator } from "@/components/finance";

type DashboardData = {
  balance: number;
  entriesMonth: number;
  exitsMonth: number;
  monthLabel: string;
};

export default function FinanceDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/finance/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar dados do dashboard.");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro desconhecido");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="mb-lg text-h2 font-semibold text-[var(--text-primary)]">Dashboard</h1>
        <p className="mb-xl text-body text-[var(--text-secondary)]">
          Visão geral do módulo financeiro: saldo, entradas e saídas do período.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-24 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
          <div className="h-24 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
          <div className="h-24 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
        </div>
        <div className="mt-8 h-32 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-lg text-h2 font-semibold text-[var(--text-primary)]">Dashboard</h1>
        <p className="mb-4 text-body text-red-600 dark:text-red-400">{error}</p>
        <Button variant="primary" onClick={() => globalThis.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  const d = data!;

  return (
    <div>
      <h1 className="mb-lg text-h2 font-semibold text-[var(--text-primary)]">Dashboard</h1>
      <p className="mb-xl text-body text-[var(--text-secondary)]">
        Visão geral do módulo financeiro: saldo, entradas e saídas do período.
      </p>

      <div className="mb-xl grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BalanceIndicator balance={d.balance} label="Saldo atual" />
        <FinancialCard
          title="Entradas no mês"
          value={d.entriesMonth}
          variant="entry"
          comparison={d.monthLabel}
          icon={<ArrowUpCircle className="h-5 w-5" aria-hidden />}
        />
        <FinancialCard
          title="Saídas no mês"
          value={d.exitsMonth}
          variant="exit"
          comparison={d.monthLabel}
          icon={<ArrowDownCircle className="h-5 w-5" aria-hidden />}
        />
      </div>

      <Card padding="lg" className="border-dashed border-neutral-300 dark:border-neutral-600">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              <ArrowLeftRight className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-h4 font-semibold text-[var(--text-primary)]">
                Movimentações
              </h2>
              <p className="text-small text-[var(--text-secondary)]">
                Registrar entradas, saídas, transferências e sangrias.
              </p>
            </div>
          </div>
          <Link href="/finance/movimentacoes">
            <Button variant="primary">Ver movimentações</Button>
          </Link>
        </div>
        <div className="mt-4 flex items-center gap-4 border-t border-neutral-200 pt-4 dark:border-neutral-700">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
            <Wallet className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-[var(--text-primary)]">Caixas</h3>
            <p className="text-small text-[var(--text-secondary)]">
              Controle por caixa, filial e operador.
            </p>
          </div>
          <Link href="/finance/caixas">
            <Button variant="secondary">Ir para Caixas</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
